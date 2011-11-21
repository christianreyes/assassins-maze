$(function(){
  
  /* 
  ============================
        INITIALIZATION
  ============================
  */
  
  var socket = io.connect();
  
  var canvas = $("canvas");
  var context = canvas[0].getContext("2d");
  
  var doodle = new Doodle(context);
  
  var OBJECT_WIDTH = 36;
  
  var my_client_id;
  var my_box;
  
  var projectiles = [];
  
  var coords = {};
  
  var ticker;
  var TICK_INTERVAL = 40;
                          
  var others = {};
  
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
  
  function setThetaPoint(elem, elem_coords){
    elem.polygonTheta = Math.atan2(elem_coords.y - elem.centerY, elem_coords.x - elem.centerX );
  }
  
  /* 
  ============================
         SOCKET LOGIC
  ============================
  */
  
  socket.on("connect", function(){
    log("CONNECTED!");
    
    my_client_id = socket.socket.sessionid;
    
    my_box = createTriangle( my_client_id ,
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
  
  socket.on("changed nickname", function (data){
    log("changed nickname");
    log(data);
    
    $("li#" + data.client_id + " span.nickname").text(data.nickname);
  });
  
  socket.on('user moved', function (data) {
    log("user moved");
    log(data);
    
    var box = others[data.client_id];
    
    box.centerX = data.position.centerX;
    box.centerY = data.position.centerY;
  });
  
  socket.on('mouse moved', function (data) {
    log("user mouse moved");
    log(data);
    
    var box = others[data.client_id];
    
    setThetaPoint(box, data.coords);
  });
  
  /* 
  ============================
           HELPERS
  ============================
  */ 
  
  function canvasMouseMove(e){
  	var bb = canvas[0].getBoundingClientRect();
  	
    coords.x = (e.clientX - bb.left)*(canvas.width()/bb.width);
    coords.y = (e.clientY - bb.top)*(canvas.height()/bb.height);
    
    var data = {
                  client_id: my_client_id,
                  coords: coords
                };
    
    socket.emit("mouse move", data);
  }
  
  function callMove(e){
    switch (e.keyCode ? e.keyCode : e.which) {
      case 38:  /* Up arrow was pressed. move the box accordingly */
        move_key(my_box, 38);
  		  break;
      case 40:  /* Down arrow was pressed. move the box accordingly */
        move_key(my_box, 40);
        break;
      case 37:  /* Left arrow was pressed. move the box  accordingly */
  		  move_key(my_box, 37);
  		  break;
      case 39:  /* Right arrow was pressed. move the box  accordingly */
  		  move_key(my_box, 39);
  		  break;
      case 32:  /* Space bar was pressed */
  		  break;
    }
  }
  
  function move_key(elem, dir){
    var MOVE_PX = 15;
    
    switch(dir){
      case 38: /* Up arrow was pressed. move the box accordingly */
        elem.centerY -= MOVE_PX;
        break;
      case 40: /* down arrow was pressed. move the box accordingly */
        elem.centerY += MOVE_PX;
        break;
      case 37: /* left arrow was pressed. move the box accordingly */
        elem.centerX -= MOVE_PX;
        break;
      case 39: /* right arrow was pressed. move the box accordingly */
        elem.centerX += MOVE_PX;
        break;
    }
    
    setThetaPoint(elem, coords);
              
    var data = { 
                  client_id: my_client_id,
                  position: { centerX: elem.centerX, centerY: elem.centerY }
                };
    
    log("i moved");
    log(data);
    
    socket.emit('i moved', data);
  }
  
  function clearAndDraw(){
    context.clearRect(0,0, canvas.width(), canvas.height());
    
    for(var i = 0 ; i<projectiles.length ; i++){
      var proj = projectiles[i];
      
      proj.left += proj.xVelocity;
      proj.top += proj.yVelocity;
      
      if(proj.left > canvas.width() || proj.left < 0 || proj.top > canvas.height() || proj.top < 0){
        projectiles.splice(i,1);
        for(var j = 0; j< doodle.children.length ; j++){
          if(doodle.children[j] == proj){
            doodle.children.splice(j,1);
          }
        }
      }
    }
    
    doodle.draw();
  }
  
  function add_other_user(data){
    if( data.client_id != my_client_id && typeof(others[data.client_id]) == "undefined" ){
      var other_box = createTriangle(data.client_id, data.position.centerX, data.position.centerY, data.color);
      
      others[data.client_id] = other_box;
      
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
  
  function createTriangle(id, centerX, centerY, color){
    
    var box = new PolygonContainer({
      radius: OBJECT_WIDTH / 2,
      centerX: centerX, 
      centerY: centerY,
      fill: color
    });
    
    box.shoot = function(){
      var container = new Container({
        left: box.centerX,
        top: box.centerY,
        height: 16,
        width: 16,
        borderWidth: 0,
        xVelocity: Math.cos(Math.atan2(coords.y - box.centerY, coords.x - box.centerX)) * 10,
        yVelocity: Math.sin(Math.atan2(coords.y - box.centerY, coords.x - box.centerX)) * 10
      });
      
      var circle = new Arc({
        centerX: 8,
        centerY: 8,
        lineWidth: 1,
        fill: color,
        radius: 6,
        startingTheta: 0,
        endingTheta: Math.PI * 2
      });
      
      var data = {
                    client_id: my_client_id,
                    color: color,
                    centerX: centerX,
                    centerY: centerY,
                    xVelocity:  Math.cos(Math.atan2(coords.y - box.centerY, coords.x - box.centerX)) * 10,
                    yVelocity: Math.sin(Math.atan2(coords.y - box.centerY, coords.x - box.centerX)) * 10
      };
      
      socket.emit("fired", data);
      
      container.children = [circle];
      projectiles.push(container);
      doodle.children.push(container);
    };
    
    $("canvas").click( function(){ 
      box.shoot();
      return false;
    });
    
    box.id = id;
    box.display_color = color;
    
    //var tip = new PolygonContainer({
    //  left: OBJECT_WIDTH * 6 / 8,
    //  top: OBJECT_WIDTH * 3 / 8,
    //  radius: OBJECT_WIDTH / 8,
    //  centerX: OBJECT_WIDTH * 7 / 8, 
    //  centerY: OBJECT_WIDTH / 2,
    //  fill: '#'+Math.floor(Math.random()*16777215).toString(16)
    //});

    //box.children = [tip];
    
    doodle.children.push(box)
    
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