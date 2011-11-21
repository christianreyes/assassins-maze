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
  
  var my_circle;
  
  var others = {};
  
  /* 
  ============================
         SOCKET LOGIC
  ============================
  */
  
  function random_row_col(maze){
    var free = false;
    
    while( ! free ){
      maze.matrix[]
    }
  }
  
  socket.on("connect", function(){
    log("CONNECTED!");
    
    my_client_id = socket.socket.sessionid;
    
    my_circle = createTriangle( my_client_id ,
                        Math.floor( Math.random() * (canvas.width() - OBJECT_WIDTH * 2) + OBJECT_WIDTH),
                        Math.floor( Math.random() * (canvas.height() - OBJECT_WIDTH * 2) + OBJECT_WIDTH) ,
                        '#'+Math.floor(Math.random()*16777215).toString(16));
    
    $("li.me").attr("id", my_client_id);
    $("li.me span.color").css("background-color", my_box.display_color );
    $("li.me span.nickname").text(my_client_id);
                        
    $('#square').css("background-color", my_box.display_color );
                          
    var data = { 
                 client_id: my_client_id,
                 color:     my_box.fill,
                 position:  {centerX: my_box.centerX, centerY: my_box.centerY}
                };
    
    ticker = setInterval(function(){ clearAndDraw(); }, TICK_INTERVAL);
    
    $(window).bind("keydown", callMove);

    $("canvas").bind("mousemove", function (e){
      canvasMouseMove(e);

      setThetaPoint(my_box, coords);
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
});