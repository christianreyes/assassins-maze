function Maze(paper, rows, cols, type, cell_width){
  this.paper = paper;
  this.rows = rows;
  this.cols = cols;
  this.cell_width = cell_width;
  this.matrix = {};

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
      this.draw();
      break;
    case "random":
      for(var r=0; r<rows ; r++){
        for(var c=0; c<cols ; c++){
          var rand = Math.random();
          // true = wall present   false = wall not present
          this.matrix[r][c].wall = rand > .5 ;
        }
      }
      this.draw();
      break;
    case "hand":
      var raw_rows = [];
      raw_rows.push('1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1');
      raw_rows.push('1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1');
      raw_rows.push('1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1');
      raw_rows.push('1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1');
      raw_rows.push('1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1');
      raw_rows.push('1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1');
      raw_rows.push('1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1');
      raw_rows.push('1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,1');
      raw_rows.push('1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,0,1');
      raw_rows.push('1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1');
      raw_rows.push('1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1');
      raw_rows.push('1,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1');
      raw_rows.push('1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,0,1,1');
      raw_rows.push('1,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,1');
      raw_rows.push('1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1');
      raw_rows.push('1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1');
      raw_rows.push('1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1');
      raw_rows.push('1,0,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1');
      raw_rows.push('1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1');
      raw_rows.push('1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1');
      raw_rows.push('1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1');
      
      for(var r = 0; r< raw_rows.length ; r++){
        var str = raw_rows[r];
        var col = str.split(",");
        for(var c = 0 ; c<col.length ; c++){
          this.matrix[r][c].wall = parseInt(col[c]) == 1 ;
        }
      }
      this.draw();
      break;
    case "prim":
      var walls = [];
      
      for(var r=0; r<rows ; r++){
        for(var c=0; c<cols ; c++){
          //alert("STOP!");
          var border = (r == 0) || (c == 0) || (r== rows - 1) || (c == cols - 1);
          var odd   = (r%2 == 0) || (c%2 == 0);
          var even   = (r%2 == 1) || (c%2 == 1);
          
          this.matrix[r][c] = {r: r, c:c};
          
          if(border){
            this.matrix[r][c].wall = "border";
            var rect = paper.rect(c * cell_width, r * cell_width, cell_width, cell_width);
            rect.attr({fill: "green", stroke: "none"}); // the wall unit
          } 
          else {
            if(!border && even){
              var rect = paper.rect(c * cell_width, r * cell_width, cell_width, cell_width);
              rect.attr({fill: "green", stroke: "none"}); // the wall unit
          
              this.matrix[r][c].wall = "wall";
              this.matrix[r][c].element = rect;
          
              walls.push[this.matrix[r][c]];
          
            } else {
              this.matrix[r][c].wall = "unexplored";
            }
          }
        }
      }

      
      while(walls.length > 0){
        var ind = Math.floor( Math.random() * walls.length );
        var wall = walls[ind];
        
        wall.element.remove();
        
        var north = this.matrix[wall.r-1][wall.c ];
        var south = this.matrix[wall.r+1][wall.c ];
        var east  = this.matrix[wall.r][wall.c +1];
        var west  = this.matrix[wall.r][wall.c -1];
        
        var updownsideside = Math.random() > .5;
        
        walls.splice(ind, 1);
        
        if(updownsideside){
          if(north.wall = "unexplored" && south.wall = "unexplored"){
            wall.element.remove();
            walls.splice(ind,1);
            wall.wall = "unexplored";
          } else {
            if(east.wall = "unexplored" && west.wall = "unexplored"){
              wall.element.remove();
              walls.splice(ind,1);
              wall.wall = "unexplored";
            }
          }
        } else {
          if(east.wall = "unexplored" && west.wall = "unexplored"){
            wall.element.remove();
            walls.splice(ind,1);
            wall.wall = "unexplored";
          } else {
            if(north.wall = "unexplored" && south.wall = "unexplored"){
              wall.element.remove();
              walls.splice(ind,1);
              wall.wall = "unexplored";
            }
          }
        }
        
      }

      break;
      
  }
  
}