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
    
    //var rc = MAZE.randomCellRC();
    var rc = {r:1, c:1};
    
    my_circle = new Circle( my_client_id , MAZE,  rc.r, rc.c, randomColor() );
    
    $("li.me").attr("id", my_client_id);
    $("li.me span.color").css("background-color", my_circle.color );
    $("li.me span.nickname").text(my_client_id);
                        
    $('span#circle').css("background-color", my_circle.display_color );
                          
    var data = { 
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
        }
      }
    });
                          
    log("my client id " + my_client_id)
    socket.emit("add me to users", data);
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
});