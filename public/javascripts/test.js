$(function(){
  var ROWS = 25;
  var COLS = 25;
  
  var MAZE = {};
  
  for(var r=0; r<ROWS ; r++){
    MAZE[r] = {};
  }
  
  var paper  = new Raphael($("#canvas_container")[0], 500, 500);
    
  var circle = paper.circle(30,30, 10).attr({fill: "red", stroke:"none"});
  
  circle.row = 1;
  circle.col = 1;
  

  
  var STEP = 20;
  
  var WALL_WIDTH = 20;
  
  drawMaze(MAZE, paper, 25, 25, WALL_WIDTH);
  
  var key_to_dir = { 
                    /* up   */  38: [0, -1], 
                    /* down */  40: [0, 1], 
                    /* left */  37: [-1, 0], 
                    /* right */ 39: [1, 0] 
                    };
                    
  var key_to_rc = {
                  /* up   */  38: [-1, 0], 
                  /* down */  40: [1, 0], 
                  /* left */  37: [0, -1], 
                  /* right */ 39: [0, 1] 
                  };
                  
  circle.canMove = function(coord_diffs){
    var newR = this.row + coord_diffs[0];
    var newC = this.col + coord_diffs[1];

    return ! MAZE[newR][newC];
  }
  
  $(window).bind("keydown", function(e){
    var key = e.keyCode ? e.keyCode : e.which ;
    
    if( key in key_to_dir) {
      var xy_transform = key_to_dir[ key ];
      var rc_transform = key_to_rc[ key ];

      if( circle.canMove(rc_transform) ) {
        circle.row += rc_transform[0];
        circle.col += rc_transform[1];

        console.log(circle.row);
        console.log(circle.col);

        circle.attr({ 
                      cx: circle.attrs.cx + STEP * xy_transform[0], 
                      cy: circle.attrs.cy + STEP * xy_transform[1]
                    });
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
        rect.attr({fill: "green", stroke: "none"});
        
        maze[r][c] = true;
      } else {
        maze[r][c] = false;
      } 
    }
  }
}