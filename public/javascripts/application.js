$(function(){
  
  var my_client_id;
  var my_box;
                          
  var others = {};

  var socket = io.connect();
  
  socket.on("connect", function(){
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
                          
    socket.emit("add me to users", data);
  });

  $(window).bind("keydown", function(e){
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
  });
  
  socket.on("current users", function (data){
    console.log(data);
    
    for(id in data){
      var user = data[id];
      others[user.client_id] = user;
      createBox( user.client_id, user.position.left, user.position.top, user.color );
    }

  });
  
  socket.on("user disconnected", function (data){
    console.log(data);
      
    delete others[data];
    removeBox(data);
  });
  
  socket.on("new user connected", function (data){
    console.log(data);
    
    if( typeof(others[data.client_id]) == "undefined" ){
      var other_box = createBox(data.client_id, data.position.left, data.position.top, data.color);
      
      others[data.client_id] = other_box;
    }
  });
  
  socket.on('user moved', function (data) {
    console.log(data);
    
    move_position( others[data.client_id], data.position );
  });
  
  function move_position(elem, position){
    elem
      .css("left", position.left)
      .css("top", position.top);
  }
  
  function move_key(elem, dir){
    var MOVE_PX = 30;
    
    switch(dir){
      case "up":
        elem.css("top", parseInt(elem.css("top")) - MOVE_PX);
        break;
      case "down":
        elem.css("top", parseInt(elem.css("top")) + MOVE_PX);
        break;
      case "left":
        elem.css("left", parseInt(elem.css("left")) - MOVE_PX);
        break;
      case "right":
        elem.css("left", parseInt(elem.css("left")) + MOVE_PX);
        break;
    }
              
    var data = { 
                  client_id: my_client_id,
                  position:  elem.position()
                };
    
    socket.emit('i moved', data);
  }
  
  /* 
  ============================
              HELPERS
  ============================
  */ 
  
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
  
});