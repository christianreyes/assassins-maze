$(function(){
  var paper  = new Raphael($("#canvas_container")[0], 500, 500);
    
  // tetronimo.animate({transform: "...r360"}, 1000, "<>").animate({tranform: "100 100"}, 1000, "<>");
  
  var circle = paper.circle(30,30, 10).attr({fill: "red", stroke:"none"});
  
  var set = paper.set()
  set.push(circle);
  
  var STEP = 20;
  
  var WALL_WIDTH = 20;
  
  drawMaze(paper, 40, 40, WALL_WIDTH);
  
  var code_to_dir = { 38: [0, -1], 40: [0, 1], 37: [-1, 0], 39: [1, 0] }
  
  $(window).bind("keydown", function(e){
    var val = e.keyCode;
    var transform = code_to_dir[val];
    
    if( typeof(transform) != "undefined" ) {
      circle.attr({ cx: circle.attrs.cx + STEP * transform[0], 
                    cy: circle.attrs.cy + STEP * transform[1]
                    });
    }
  });
});

function drawMaze(paper, rows, cols, width){
  for(var i=0; i<rows ; i+=2){
    for(var j=0; j<cols ; j+=2){
      var rect = paper.rect(i * width, j * width, width, width)
      rect.attr({fill: "green", stroke: "none"});
    }
  }
}