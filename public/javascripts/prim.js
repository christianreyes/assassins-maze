// Perfect maze generation that was never used. Not tested much either. Doesn't work.
// Not enough time to work on it.

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