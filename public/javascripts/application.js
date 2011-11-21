$(function(){
  
  /* 
  ============================
        INITIALIZATION
  ============================
  */
  
  var socket = io.connect();
  
  var my_client_id;
  
  var paper = new Raphael($("#canvas_container")[0], 500, 500);

  var MAZE = new Maze(paper, 25, 25, "grid", 20);
  MAZE.draw();
  
  var my_circle;
  
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
  
  socket.on("connect", function(){
    log("CONNECTED!");
    
    my_client_id = socket.socket.sessionid;
    
    var rc = MAZE.randomCellRC();
    //var rc = {r:1, c:1};
    
    my_circle = new Circle( my_client_id , MAZE,  rc.r, rc.c, randomColor() );
    
    $("li.me").attr("id", my_client_id);
    $("li.me span.color").css("background-color", my_circle.color );
    $("li.me span.nickname").text(my_client_id);
                        
    $('span#circle').css("background-color", my_circle.display_color );
                          
    var data = { 
                 client_id: my_client_id,
                 color:     my_circle.color,
                 position:  {r: my_circle.row, c: my_circle.col}
                };
    
    $(window).bind("keydown", function(e){
      var key = e.keyCode ? e.keyCode : e.which ;

      if( key in key_to_xy) {
        var rc_diffs =  key_to_rc[ key ];

        if( my_circle.canMove(rc_diffs) ) {
          var xy_diffs = key_to_xy[ key ];

          my_circle.move(xy_diffs, rc_diffs);
          
          var data = { 
                        client_id: my_client_id,
                        key: key
                      };

          log("i moved");
          log(data);

          socket.emit('i moved', data);
        }
      }
    });
                          
    log("my client id " + my_client_id)
    socket.emit("add me to users", data);
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
  
  socket.on("changed nickname", function (data){
    log("changed nickname");
    log(data);
    
    $("li#" + data.client_id + " span.nickname").text(data.nickname);
  });
  
  $("button.change_nickname").click(function(){
     var data = { 
                  client_id: my_client_id,
                  nickname: $("input.nickname").val()
                 };

     log("change_nickname");
     log(data);

     socket.emit("new nickname", data);

     $("li.me span.nickname").text($("input.nickname").val());
     $(this).val("");

     return false;
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
                                     data.color );
      
      others[data.client_id] = other_circle;
      
      var new_li = $("<li></li");
      new_li.attr("id", data.client_id);

      var color = $("<span class='color'></span>");
      color.css('background-color', data.color);

      var nickname = $("<span class='nickname'></span>");

      if( typeof(data.nickname) == "undefined" ){
        nickname.text(data.client_id);
      } else {
        nickname.text(data.nickname);
      }
      
      new_li.append(color);
      new_li.append(nickname);
      $("ul#users").append(new_li);
    }
  }
  
  function log(data){
    var LOG = true;
    
    if(LOG){
      console.log(data);
    }
  }
  
  function randomColor(){
    return '#'+Math.floor(Math.random()*16777215).toString(16);
  }
});