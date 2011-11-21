$(function(){
  var ROWS = 25;
  var COLS = 25;
  
  var MAZE = {};
  
  for(var r=0; r<ROWS ; r++){
    MAZE[r] = {};
  } // initialize every row as an empty object
  
  var STEP = 20;
  
  var WALL_WIDTH = 20;
  
  var paper  = new Raphael($("#canvas_container")[0], 500, 500);
    
  var my_circle = make_circle(paper, 1, 1, STEP, "red");

  drawMaze(MAZE, paper, 25, 25, WALL_WIDTH);
  
  var key_to_dir = { 
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
  
  $(window).bind("keydown", function(e){
    var key = e.keyCode ? e.keyCode : e.which ;
    
    if( key in key_to_dir) {
      var rc_diffs =  key_to_rc[ key ];

      if( my_circle.canMove(MAZE, rc_diffs) ) {
        var xy_diffs = key_to_dir[ key ];
        
        my_circle.move(STEP, xy_diffs, rc_diffs);
      }
    }
  });
});

function drawMaze(maze, paper, rows, cols, width){
  for(var r=0; r<rows ; r++){
    for(var c=0; c<cols ; c++){
      var border = (r == 0) || (c == 0) || (r== rows - 1) || (c == cols - 1);
      var even = (r%2 == 0) && (c%2 == 0);
      
      if( border || even ){
        var rect = paper.rect(r * width, c * width, width, width)
        rect.attr({fill: "green", stroke: "none"}); // the wall unit
        
        maze[r][c] = true; // true = wall present
      } else {
        maze[r][c] = false; // false = wall not present
      } 
    }
  }
}

function make_circle(paper, row, col, step, color){
  var circle = paper.circle(row * step + step / 2, col * step + step / 2 , 10).attr({fill: color, stroke:"none"});
  
  circle.row = row;
  circle.col = col;
  
  circle.canMove = function(maze, rc_coord_diffs){
    var newR = this.row + rc_coord_diffs.r;
    var newC = this.col + rc_coord_diffs.c;

    return ! maze[newR][newC];
  };
  
  circle.move = function(px_step, xy_diffs, rc_diffs){
    circle.row += rc_diffs.r;
    circle.col += rc_diffs.c;

    circle.attr({ 
                  cx: circle.attrs.cx + px_step * xy_diffs.x, 
                  cy: circle.attrs.cy + px_step * xy_diffs.y
                });
  };
  
  return circle
}