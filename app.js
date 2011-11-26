
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
var assassin_id;

io.sockets.on('connection', function (socket) {
  if(typeof(assassin_id) == "undefined"){
    socket.emit("you are", {assassin: true});
    assassin_id = socket.id;
  } else {
    socket.emit("you are", {assassin: false});
  }
  
  socket.emit("current users", users);
  
  socket.on("add me to users", function (data) {
    log("add me to users");
    log(data);
    
    users[socket.id] = data;
    
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
    if(users[data.client_id]){
      users[ data.client_id ].position = data.position;
    
      socket.broadcast.emit('user moved', data);
    }
  });
  
  socket.on("killed", function (data){
    log(data);
    users[assassin_id].assassin = false;
    users[data.target_id].assassin = true;
    users[data.target_id].position = data.new_rc;
    assassin_id = data.target_id;
    
    socket.broadcast.emit("killed", data);
  });
  
  socket.on('disconnect', function () {    
    log("disconnect " + socket.id);
    
    if(users[socket.id]){
      delete users[socket.id];
      
      io.sockets.emit('user disconnected', { client_id: socket.id} );
      
      if(assassin_id == socket.id){
        //pick new assassin
        
        var ids = [];
        for (var client_id in users) {
            if (users.hasOwnProperty(client_id)) {
                ids.push(client_id);
            }
        } 
        
        assassin_id = ids[ Math.floor( Math.random() * ids.length ) ];
        
        log("new assassin " + assassin_id);
        users[assassin_id].assassin = true;
        
        socket.broadcast.emit("new assassin", { assassin_id: assassin_id });
      }
    }
  });
  
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);