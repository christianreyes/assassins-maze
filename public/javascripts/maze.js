function Maze(paper, rows, cols, type, cell_width){
  this.paper = paper;
  this.rows = rows;
  this.cols = cols;
  this.cell_width = cell_width;
  this.matrix = {};
  
  for(var r=0; r<rows ; r++){
    this.matrix[r] = {};
    for(var c=0; c<cols ; c++){
      this.matrix[r][c] = {};
    }
  } // initialize every cell as an empty object
  
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
        if( this.matrix[r][c].wall ) {
          var rect = paper.rect(r * cell_width, c * cell_width, cell_width, cell_width);
          rect.attr({fill: "green", stroke: "none"}); // the wall unit
        }
      }
    }
  };
  
  this.isWall = function(row, col){
    return this.matrix[row][col].wall;
  };
  
  this.randomCellRC = function(){
    var r = Math.floor( Math.random() * this.rows + 1);
    var c = Math.floor( Math.random() * this.cols + 1);
    var found_wall = this.matrix[r][c].wall;
    
    while( found_wall ){
      r = Math.floor( Math.random() * this.rows + 1);
      c = Math.floor( Math.random() * this.cols + 1);
      found_wall = this.matrix[r][c].wall;
    }
    
    return {r: r, c: c};   
  };
}