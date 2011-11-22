
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app   = module.exports = express.createServer();
var io    = require('socket.io').listen(app);
var fs    = require('fs');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  process.env.TZ='America/New_York';
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);

var port = process.env.PORT || 3000;

app.listen(port);


//io.set('transports', ['xhr-polling']); 
//io.set('polling duration', 10);

var LOG = true;

function log(data){
  if(LOG) {
    console.log(data);
  }
}

var users = {};

io.sockets.on('connection', function (socket) {
  
  socket.on("add me to users", function (data) {
    log("add me to users");
    log(data);
    
    users[socket.id] = data;
    
    socket.emit("current users", users);
    socket.broadcast.emit("new user connected", data);
  });
  
  socket.on("new nickname", function (data) {
    log(data);
    
    if(users[data.client_id]){
      users[data.client_id].nickname = data.nickname;

      socket.broadcast.emit("changed nickname", data);
    }
  });
  
  socket.on('i moved', function (data) {
    log(data);
    if(users[socket.id]){
      users[ socket.id ].position = data.position;
    
      socket.broadcast.emit('user moved', data);
    }
  });
  
  socket.on("mouse move", function (data) {
    log(data);
    
    if(users[data.client_id]){
      users[ data.client_id ].coords = data.coords;
    
      socket.broadcast.emit("mouse moved", data);
    }
  });
  
  socket.on('disconnect', function () {    
    log("disconnect " + socket.id);
    
    if(users[socket.id]){
      delete users[socket.id];
      io.sockets.emit('user disconnected', { client_id: socket.id} );
    }
  });
  
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);