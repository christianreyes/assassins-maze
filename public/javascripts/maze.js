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
    case "random":
      for(var r=0; r<rows ; r++){
        for(var c=0; c<cols ; c++){
          var rand = Math.random();
          // true = wall present   false = wall not present
          this.matrix[r][c].wall = rand > .5 ;
        }
      }
      break;
  }
  
  this.draw = function(){
    for(var r=0; r<rows ; r++){
      var out = [];
      for(var c=0; c<cols ; c++){
        out.push( this.isWall(r,c) ? 1 : 0);
        if( this.isWall(r, c) ) {
          var rect = paper.rect(c * cell_width, r * cell_width, cell_width, cell_width);
          //console.log("wall at: " + r + ", " + c);
          rect.attr({fill: "green", stroke: "none"}); // the wall unit
        }
      }
      console.log(out);
    }
  };
  
  this.isWall = function(row, col){
    return this.matrix[row][col].wall;
  };
  
  this.randomCellRC = function(){
    var r = Math.floor( Math.random() * this.rows );
    var c = Math.floor( Math.random() * this.cols );
    var cell = this.matrix[r][c];
    var found_wall = cell.wall;
    
    while( found_wall ){
      r = Math.floor( Math.random() * this.rows );
      c = Math.floor( Math.random() * this.cols );
      cell = this.matrix[r][c];
      found_wall = cell.wall;
    }
    
    return {r: r, c: c};   
  };
}