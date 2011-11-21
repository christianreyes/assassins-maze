function Maze(paper, rows, cols, type, cell_width){
  this.paper = paper;
  this.rows = rows;
  this.cols = cols;
  this.cell_width = cell_width;
  this.matrix = {};
  
  for(var r=0; r<rows ; r++){
    this.matrix[r] = {};
  } // initialize every row as an empty object
  
  switch(type){
    case "grid":
      for(var r=0; r<rows ; r++){
        for(var c=0; c<cols ; c++){
          var border = (r == 0) || (c == 0) || (r== rows - 1) || (c == cols - 1);
          var even   = (r%2 == 0) && (c%2 == 0);

          // true = wall present   false = wall not present
          this.matrix[r][c].wall = border || even ;
        }
      }
      break;
  }
  
  this.draw = function(){
    for(var r=0; r<rows ; r++){
      for(var c=0; c<cols ; c++){
        var rect = paper.rect(r * cell_width, c * cell_width, cell_width, cell_width);
        rect.attr({fill: "green", stroke: "none"}); // the wall unit
      }
    }
  };
  
  this.isWall = function(row, col){
    return this.matrix[row][col].wall;
  };
}