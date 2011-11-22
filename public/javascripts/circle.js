function Circle(id, maze, row, col, color){
  this.id = id;
  this.row = row;
  this.col = col;
  this.color = color;
  this.element = maze.paper.circle(
                                 col * maze.cell_width + maze.cell_width / 2, 
                                 row * maze.cell_width + maze.cell_width / 2, 
                                 10
                                ).attr({fill: color, stroke:"none"});
  
  this.canMove = function(rc_diffs){
    var newR = this.row + rc_diffs.r;
    var newC = this.col + rc_diffs.c;

    return ! maze.isWall(newR, newC);
  };
  
  this.move = function(xy_diffs, rc_diffs){
    this.row += rc_diffs.r;
    this.col += rc_diffs.c;

    this.element.attr({ 
                  cx: this.element.attrs.cx + maze.cell_width * xy_diffs.x, 
                  cy: this.element.attrs.cy + maze.cell_width * xy_diffs.y
                });
                
    if( typeof(this.mask) != "undefined" ){
      this.mask.attr({ 
                    x: this.mask.attrs.x + maze.cell_width * xy_diffs.x, 
                    y: this.mask.attrs.y + maze.cell_width * xy_diffs.y
                  });
    }
  };
}