$(function(){
  var ROWS = 25;
  var COLS = 25;
  
  var paper  = new Raphael($("#canvas_container")[0], 500, 500);
    
  var circle = paper.circle(30,30, 10).attr({fill: "red", stroke:"none"});
  
  var STEP = 20;
  
  var WALL_WIDTH = 20;
  
  drawMaze(paper, 25, 25, WALL_WIDTH);
  
  var key_to_dir = { 38: [0, -1], 40: [0, 1], 37: [-1, 0], 39: [1, 0] }
  
  $(window).bind("keydown", function(e){
    var transform = key_to_dir[ e.keyCode ? e.keyCode : e.which ];
    
    if( typeof(transform) != "undefined" ) {
      circle.attr({ cx: circle.attrs.cx + STEP * transform[0], 
                    cy: circle.attrs.cy + STEP * transform[1]
                    });
    }
  });
});

function drawMaze(paper, rows, cols, width){
  for(var i=0; i<rows ; i++){
    for(var j=0; j<cols ; j++){
      var border = (i == 0) || (j == 0) || (i== rows - 1) || (j == cols - 1);
      var even = (i%2 == 0) && (j%2 == 0);
      
      if( border || even ){
        var rect = paper.rect(i * width, j * width, width, width)
        rect.attr({fill: "green", stroke: "none"});
      }
    }
  }
}