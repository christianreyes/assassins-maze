$(function(){
  
  var my_client_id;
  var my_box;
                          
  var others = {};

  var socket = io.connect();
  
  socket.on("connect", function(){
    log("CONNECTED!");
    
    my_client_id = socket.socket.sessionid;
    
    my_box = createBox( my_client_id ,
                        Math.floor( Math.random() * ($(window).width() - 50)),
                        Math.floor( Math.random() * ($(window).height() - 50)),
                        '#'+Math.floor(Math.random()*16777215).toString(16));
                          
    var data = { 
                 client_id: my_client_id,
                 color:     my_box.css("background-color"),
                 position:  my_box.position()
                };
                          
    log("my client id " + my_client_id)
    socket.emit("add me to users", data);
  });

  $(window).bind("keydown", callMove);
  
  function callMove(e){
    switch (e.keyCode ? e.keyCode : e.which) {
      case 38:  /* Up arrow was pressed. move the box accordingly */
        move_key(my_box, "up");
  		  break;
      case 40:  /* Down arrow was pressed. move the box accordingly */
        move_key(my_box, "down");
        break;
      case 37:  /* Left arrow was pressed. move the box  accordingly */
  		  move_key(my_box, "left");
  		  break;
      case 39:  /* Right arrow was pressed. move the box  accordingly */
  		  move_key(my_box, "right");
  		  break;
      case 32:  /* Space bar was pressed */
  		  break;
    }
  }
  
  socket.on("current users", function (data){ 
    log("current_users");
    log(data);
    
    for(id in data){
      var user_data = data[id];
      
      add_other_user(user_data);
    }

  });
  
  socket.on("user disconnected", function (data){
    log("user disconnected");
    log(data);
    
    $("#new_user").text("user disconnected: " + data).show();
      
    delete others[data];
    removeBox(data);
  });
  
  socket.on("disconnect", function (){
    log("server disconnected");
    
    alert("server disconnected");
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
    
    var box = $(others[data.client_id]);
    
    box
      .css("left", data.position.left)
      .css("top", data.position.top);
     
    //$(box).animate({left: data.position.left, top:data.position.top}, 50);
  });
  
  function move_key(elem, dir){
    var MOVE_PX = 30;
    
    switch(dir){
      case "up":
        $(elem).css("top", parseInt(elem.css("top")) - MOVE_PX);
        //$(elem).animate({top: "-=" + MOVE_PX}, 50);
        break;
      case "down":
        $(elem).css("top", parseInt(elem.css("top")) + MOVE_PX);
        //$(elem).animate({top: "+=" + MOVE_PX}, 50);
        break;
      case "left":
        $(elem).css("left", parseInt(elem.css("left")) - MOVE_PX);
        //$(elem).animate({left: "-=" + MOVE_PX}, 50);
        break;
      case "right":
        $(elem).css("left", parseInt(elem.css("left")) + MOVE_PX);
        //$(elem).animate({left: "+=" + MOVE_PX}, 50);
        break;
    }
              
    var data = { 
                  client_id: my_client_id,
                  position: { left: elem.position().left, top: elem.position().top }
                };
    
    log("i moved");
    log(data);
    
    socket.emit('i moved', data);
  }
  
  /* 
  ============================
              HELPERS
  ============================
  */ 
  
  function add_other_user(data){
    if( data.client_id != my_client_id && typeof(others[data.client_id]) == "undefined" ){
      var other_box = createBox(data.client_id, data.position.left, data.position.top, data.color);
      
      others[data.client_id] = other_box;
    }
  }
  
  function createBox(id, left, top, color){
    var box = $("<div></div>")
              .attr("id", id)
              .addClass("box")
              .css("left", left)
              .css("top", top)
              .css("background-color", color);
    $("body").append(box);
    
    return box;
  }
  
  function removeBox(id){
    delete others[id];
    
    $("#" + id).fadeOut(function(){
      $(this).remove();
    });
  }
  
  function log(data){
    var LOG = true;
    
    if(LOG){
      console.log(data);
    }
  }
});