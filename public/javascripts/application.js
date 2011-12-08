/* Assassin's Maze
 *
 * Christian Reyes
 * Carnegie Mellon University
 * 05433D Software Structures for User Interfaces - Web Lab
 *
 * Final Project
 *
 * Uses node.js and socket.io with raphaeljs for cross-browser SVG/VML graphics
 *
 */

// global variable for disabling keyboard when animating.
var _not_animating = true;

$(function(){
  
  /* 
  ============================
        INITIALIZATION
  ============================
  */
  
  var my_client_id;
  
  // needed for resizing the paper
  // all drawing operations happen in the raphael canvas, similar to HTML5 canvas
  var paper = new ScaleRaphael("canvas_container", 780, 660);
  
  // function to resize the paper 
  function resizePaper(){
        var win = $(this);
        paper.changeSize(win.width(), win.height(), true, false);
  }    
  
  // resize the paper before drawing
  $(window).resize(resizePaper);

  // initialize the maze
  var MAZE = new Maze(paper, 33, 39, "full", 20);
  
  // some variables used to manage the game
  var blood;
  var my_circle;
  var mask;
  var assassin_id;
  var others = {};
  
  // translates key input to x and y differences
  var key_to_xy = { 
                    /* up   */  38: { x:  0, y: -1 }, 
                    /* down */  40: { x:  0, y:  1 }, 
                    /* left */  37: { x: -1, y:  0 }, 
                    /* right */ 39: { x:  1, y:  0 } 
                    };
  
  // translates key input to r and c differences
  // r = row c = column
  var key_to_rc = {
                  /* up   */  38: { r: -1, c:  0 }, 
                  /* down */  40: { r:  1, c:  0 }, 
                  /* left */  37: { r:  0, c: -1 }, 
                  /* right */ 39: { r:  0, c:  1 }
                  };
  
  /* 
  ============================
         SOCKET LOGIC
  ============================
  */
  
  // connect to server. use auto-discovery for port
  var socket = io.connect();
  
  // store the socket_id in my_client_id
  socket.on("connect", function(){
    log("CONNECTED!");
    
    my_client_id = socket.socket.sessionid;
  });
  
  // server tells client if they are assassin or not
  // when client is told, client makes self
  socket.on("you are", function(data){
    var rc = MAZE.randomCellRC();

    // create the circle on the screen based on whether or not client is assassin
    my_circle = new Circle( my_client_id , MAZE,  rc.r, rc.c, randomColor(), data.assassin, true );
    
    if(data.assassin){
      assassin_id = my_client_id;
    }
    
    // prepare data to be sent to the server after creation
    var data = { 
                 client_id: my_client_id,
                 color:     my_circle.color,
                 position:  {r: my_circle.row, c: my_circle.col},
                 assassin: my_circle.assassin
                };
    
    resizePaper();
    
    // show the instructions after all this has happened. slideup when the x is clicked to close
    $('.instructions').slideDown(1000, "swing", function(){
      $('.instructions .close').fadeIn(function(){
        $(this).click(function(){
          $('.instructions').slideUp();
        });
      });
    });
    
    // process the keydown. move circle and then determine if a kill was made or not
    $(window).bind("keydown", function(e){
      // only continue if not currently animating
      if(_not_animating){
        // cross-browser support for keycode
        var key = e.keyCode ? e.keyCode : e.which ;

        //if the key is a valid key for moving: up down left right
        if( key in key_to_xy) {
          var rc_diffs =  key_to_rc[ key ]; // get the rc diffs

          if( my_circle.canMove(rc_diffs) ) { // move circle if can move
            var xy_diffs = key_to_xy[ key ];

            // move the circle to the new absolute position
            my_circle.moveTo({ r: my_circle.row + rc_diffs.r,
                               c: my_circle.col + rc_diffs.c });

            // prepare move data to send to server to have the other 
            // clients update this client's position
            var move_data = { 
                          client_id: my_client_id,
                          key: key,
                          position: {r: my_circle.row, c: my_circle.col}
                        };

            log("i moved");
            log(move_data);

            // send the move information to the server. will broadcast to everyone else.
            socket.emit('i moved', move_data);

            // if circle is assassin, check if any other circles are in that location. if so,
            // kill them and tell everyone that they were killed
            if(my_circle.assassin) { 
              for(client_id in others){ // check if any of the other circles are in the same position as client
                var other = others[client_id];
                if(my_circle.row == other.row && my_circle.col == other.col){
                  log("killed: " + client_id);
                  
                  // change self from looking like assassin to looking like a client
                  my_circle.changeType(false);

                  // generate a random, valid path location to send the other circle to
                  var new_rc = MAZE.randomCellRC();
                  other.killed(false, new_rc); // kill the circle and send them to the location
                  
                  assassin_id = client_id; // the other circle is now the assassin

                  // prepare the kill data to send to server
                  var kill_data = {
                                    assassin_id: my_client_id,
                                    target_id: client_id,
                                    new_rc: new_rc
                                   }; 
                                   
                  bloodSplat(paper); // display blood on screen

                  socket.emit("killed", kill_data); // send kill data to server to relay to all clients
                }
              }
            } else {
              // if client is not assassin, check to see if they stepped where an assassin is.
              // if so, kill this client and make it into an assassin.
              
              var assassin = others[assassin_id];
              
              if(my_circle.row == assassin.row && my_circle.col == assassin.col){
                log("killed: " + my_client_id);

                assassin.changeType(false);

                var new_rc = MAZE.randomCellRC();
                my_circle.killed(true, new_rc);
                
                assassin_id = my_client_id;

                var kill_data = {
                                  assassin_id: assassin_id,
                                  target_id: my_client_id,
                                  new_rc: new_rc
                                 }; 
                                 
                bloodSplat(paper);

                socket.emit("killed", kill_data);
              }
            }
          }
        }
      }
    });
                          
    log("my client id " + my_client_id)
    socket.emit("add me to users", data);
    
    // fade in the maze after everything is ready
    $('#canvas_container').fadeIn(3000);
  });
  
  // if a circle is killed, check to see if it is this client
  // if it is, update accordingly, if it is not, check to see if it's any client we know
  // update accordingly
  socket.on("killed", function (data){
    if(data.target_id == my_client_id){
      others[data.assassin_id].changeType(false);
      my_circle.killed(true, data.new_rc); 
      assassin_id = my_client_id;
      bloodSplat(paper);
    }
    if( typeof(others[data.target_id]) != "undefined" && typeof(others[data.assassin_id]) != "undefined" ){
      my_circle.changeType(false);
      others[data.assassin_id].changeType(false);
      others[data.target_id].killed(false, data.new_rc);
      bloodSplat(paper);
      assassin_id = data.target_id;
    }
  });
  
  // create all the circles for the current users in the game
  socket.on("current users", function (data){ 
    log("current_users");
    log(data);
    
    for(client_id in data){
      if(typeof(others[client_id]) == "undefined"){
        var user_data = data[client_id];
      
        add_other_user(user_data);
      }
    }

  });

  // add circle to maze when a new user connects
  socket.on("new user connected", function (data){
    log("new user connected");
    log(data);
    
    $("#new_user").text("user connected: " + data.client_id);
    
    add_other_user(data);
  });
  
  // update the circle's position on the maze
  socket.on('user moved', function (data) {
    log("user moved");
    log(data);
    
    var circle = others[data.client_id];
    
    circle.moveTo(data.position);
  });
  
  // remove the circle from the maze and tracking
  socket.on("user disconnected", function (data){
    log("user disconnected");
    log(data);
    
    removeOther(data);
  });
  
  // update the assassin to the new one.
  socket.on("new assassin", function(data){
    assassin_id = data.assassin_id;
    
    if( data.assassin_id == my_client_id ){
      my_circle.changeType(true);
    } else {
      if(typeof(others[data.assassin_id]) != "undefined"){
        others[data.assassin_id].changeType(true);
      } 
    }
  })
   
  // remove everyone from maze on disconnect
  socket.on("disconnect", function (){
    log("server disconnected");
    
    for(client_id in others){
      removeOther({client_id: client_id});
    }
     
    my_circle.element.animate({opacity: 0}, 1000, function(){
      my_circle.element.remove();
    });
  });
  
  /* 
  ============================
           HELPERS
  ============================
  */
  
  // called when adding other circles
  function add_other_user(data){
    if( data.client_id != my_client_id && typeof(others[data.client_id]) == "undefined" ){
      var other_circle = new Circle( data.client_id , 
                                     MAZE,  
                                     data.position.r, 
                                     data.position.c, 
                                     data.color, 
                                     data.assassin, 
                                     false );
      
      others[data.client_id] = other_circle;
      
      if(data.assassin){
        assassin_id = data.client_id;
      }
    }
  }
  
  // remove circle from maze, stop tracking that circle
  function removeOther(data){
    others[data.client_id].element.animate({opacity: 0}, 1000, function(){
      this.remove();
      delete others[data];
    });
  }
  
});

// used to control console output in one place. set LOG = true to turn on console output again
function log(data){
  var LOG = false;

  if(LOG){
    console.log(data);
  }
}

// generate a random valid color
function randomColor(){
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

// helper to return the xy for a rc for a given maze
function rc_to_xy(maze, row, col){
  return { x: col * maze.cell_width, y: row * maze.cell_width };
}