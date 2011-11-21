function Circle(maze, row, col, color){
  this.row = row;
  this.col = col;
  
  var circle = maze.paper.circle(
                                 row * maze.cell_width + maze.cell_width / 2, 
                                 col * maze.cell_width + maze.cell_width / 2, 
                                 10
                                ).attr({fill: color, stroke:"none"});
  
  circle.canMove = function(rc_coord_diffs){
    var newR = this.row + rc_coord_diffs.r;
    var newC = this.col + rc_coord_diffs.c;

    return ! maze.isWall(newR, newC);
  };
  
  circle.move = function(xy_diffs, rc_diffs){
    circle.row += rc_diffs.r;
    circle.col += rc_diffs.c;

    circle.attr({ 
                  cx: circle.attrs.cx + maze.cell_width * xy_diffs.x, 
                  cy: circle.attrs.cy + maze.cell_width * xy_diffs.y
                });
  };
}