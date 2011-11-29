var _not_animating = true;

$(function(){
  
  /* 
  ============================
        INITIALIZATION
  ============================
  */
  
  $('input.nickname').bind("keydown", function(e){
     var code = (e.keyCode ? e.keyCode : e.which);
      if(code == 13) { //Enter keycode
        changeNickname();
        $(this).blur();
        $('#canvas_container').focus();
      }
  });
  
  function changeNickname(){
    var data = { 
                  client_id: my_client_id,
                  nickname: $("input.nickname").val()
                 };

     log("change_nickname");
     log(data);

     socket.emit("new nickname", data);

     $("li.me span.nickname").text($("input.nickname").val());
  }
  
  $("button.change_nickname").click(function(){
    changeNickname()
    $('#canvas_container').focus();
    return false;
  });
  
  var my_client_id;
  
  //var paper = new Raphael($("#canvas_container")[0], 780, 660);
  
  var paper = new ScaleRaphael("canvas_container", 780, 660);
  
  function resizePaper(){
        var win = $(this);
        paper.changeSize(win.width(), win.height(), true, false);
  }    
  
  $(window).resize(resizePaper);

  var MAZE = new Maze(paper, 33, 39, "full", 20);
  //MAZE.draw();
  
  var my_circle;
  var mask;
  
  var others = {};
  
  var key_to_xy = { 
                    /* up   */  38: { x:  0, y: -1 }, 
                    /* down */  40: { x:  0, y:  1 }, 
                    /* left */  37: { x: -1, y:  0 }, 
                    /* right */ 39: { x:  1, y:  0 } 
                    };
                    
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
  
  var socket = io.connect();
  
  socket.on("connect", function(){
    log("CONNECTED!");
    
    $('#msg').text("Server Connected!").delay(3000).slideUp();
    
    my_client_id = socket.socket.sessionid;
  });
  
  socket.on("you are", function(data){
    
    var rc = MAZE.randomCellRC();
    //var rc = {r:1, c:1};
    
    my_circle = new Circle( my_client_id , MAZE,  rc.r, rc.c, randomColor(), data.assassin, true );
    
    $("li.me").addClass(my_client_id);
    $("li.me span.color").css("background-color", my_circle.color );
    $("li.me span.nickname").text("User");
                        
    $('span#circle').css("background-color", my_circle.color );
                          
    var data = { 
                 client_id: my_client_id,
                 color:     my_circle.color,
                 position:  {r: my_circle.row, c: my_circle.col},
                 assassin: my_circle.assassin
                };
    
    resizePaper();
    
    $(window).bind("keydown", function(e){
      if(_not_animating){
        var key = e.keyCode ? e.keyCode : e.which ;

        if( key in key_to_xy) {
          var rc_diffs =  key_to_rc[ key ];

          if( my_circle.canMove(rc_diffs) ) {
            var xy_diffs = key_to_xy[ key ];

            my_circle.move(xy_diffs, rc_diffs);

            var move_data = { 
                          client_id: my_client_id,
                          key: key,
                          position: {r: my_circle.row, c: my_circle.col}
                        };

            log("i moved");
            log(move_data);

            socket.emit('i moved', move_data);

            if(my_circle.assassin) { 
              for(client_id in others){
                var other = others[client_id];
                if(my_circle.row == other.row && my_circle.col == other.col){
                  log("killed: " + client_id);

                  my_circle.changeType(false);

                  var new_rc = MAZE.randomCellRC();
                  other.killed(new_rc);

                  var kill_data = {
                                    assassin_id: my_client_id,
                                    target_id: client_id,
                                    new_rc: new_rc
                                   }; 

                  socket.emit("killed", kill_data);
                }
              }
            }
          }
        }
      }
    });
                          
    log("my client id " + my_client_id)
    socket.emit("add me to users", data);
  });
  
  socket.on("killed", function (data){
    if(data.target_id == my_client_id){
      others[data.assassin_id].changeType(false);
      my_circle.killed(data.new_rc);
    }
    if( typeof(others[data.target_id]) != "undefined" ){
      others[data.assassin_id].changeType(false);
      others[data.target_id].killed(data.new_rc);
    }
  });
  
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
  
  socket.on("killed", function (data) {
    
  });
  
  socket.on("new user connected", function (data){
    log("new user connected");
    log(data);
    
    $("#new_user").text("user connected: " + data.client_id);
    
    add_other_user(data);
  });
  
  socket.on('user moved', function (data) {
    log("user moved");
    log(data);
    
    var circle = others[data.client_id];
    
    var rc_diffs =  key_to_rc[ data.key ];
    var xy_diffs =  key_to_xy[ data.key ];
    
    circle.move(xy_diffs, rc_diffs);
  });
  
  socket.on("user disconnected", function (data){
    log("user disconnected");
    log(data);
    
    removeOther(data);
  });
  
  socket.on("changed nickname", function (data){
    log("changed nickname");
    log(data);
    
    $("li." + data.client_id + " span.nickname").text(data.nickname);
  });
  
  socket.on("new assassin", function(data){
    if( data.assassin_id == my_client_id ){
      my_circle.changeType(true);
    } else {
      if(typeof(others[data.assassin_id]) != "undefined"){
        others[data.assassin_id].changeType(true);
      } 
    }
  })
   
  socket.on("disconnect", function (){
    log("server disconnected");
     
    $('#msg').text("Server Disconnected!").slideDown();
     
    for(client_id in others){
      removeOther({client_id: client_id});
    }
     
    //$('li.' + my_client_id).fadeOut(1000, function(){
    //   $(this).remove();
    //});
    my_circle.element.animate({opacity: 0}, 1000, function(){
      my_circle.element.remove();
    });
  });
  
  /* 
  ============================
           HELPERS
  ============================
  */
  
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
      
      var new_li = $("<li></li");
      new_li.addClass(data.client_id);

      var color = $("<span class='color'></span>");
      color.css('background-color', data.color);

      var nickname = $("<span class='nickname'></span>");

      if( typeof(data.nickname) == "undefined" ){
        nickname.text("User");
      } else {
        nickname.text(data.nickname);
      }
      
      new_li.append(color);
      new_li.append(nickname);
      $("ul#users").append(new_li);
    }
  }
  
  function removeOther(data){
    //$('li.' + data.client_id).fadeOut(1000, function(){
    //  $(this).remove();
    //});
    others[data.client_id].element.animate({opacity: 0}, 1000, function(){
      this.remove();
      delete others[data];
    });
  }
  
});

function log(data){
  var LOG = true;

  if(LOG){
    console.log(data);
  }
}

function randomColor(){
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

function rc_to_xy(maze, row, col){
  return { x: col * maze.cell_width, y: row * maze.cell_width };
}