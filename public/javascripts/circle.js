function Circle(id, maze, row, col, color, assassin){
  this.id = id;
  this.color = color;
  this.row = row;
  this.col = col;
  this.get_x = function(){
    return this.col * maze.cell_width;
  }
  this.get_y = function(){
    return this.row * maze.cell_width;
  }
  
  this.assassin = assassin;
  var fill_color = assassin ? "#333" : "#fff" ; //#fff if good #333 if bad
                              
  var good = maze.paper.set(); 
  var top = maze.paper.path("M16.779,5.693 c-1.298-2.981-4.265-5.068-7.723-5.068c-3.72,0-6.841,2.424-7.961,5.768C4.552,8.592,13.32,8.181,16.779,5.693z");
      top.attr({fill: fill_color});
  var bottom = maze.paper.path("M0.937,11.21 c0.958,3.606,4.211,6.277,8.12,6.277c4.02,0,7.368-2.816,8.214-6.582C13.569,13.185,4.858,13.693,0.937,11.21z");
      bottom.attr({fill: fill_color});
  var middle = maze.paper.path("M17.271,10.905 c0.135-0.598,0.217-1.211,0.217-1.849c0-1.198-0.257-2.333-0.708-3.363C13.32,8.181,4.552,8.592,1.096,6.393 C0.814,7.234,0.625,8.118,0.625,9.057c0,0.75,0.13,1.464,0.312,2.153C4.858,13.693,13.569,13.185,17.271,10.905z"); 
      middle.attr({fill: color, stroke: "#444", "stroke-width": .5 });
  good.push(top);
  good.push(bottom);
  good.push(middle);
  
  var location = rc_to_xy(maze, row, col);
  
  good.attr({transform: "t " + location.x + "," + location.y});
  
   
  this.changeType = function(is_assassin){
    this.assassin = is_assassin;
    
    var fill_color = is_assassin ? "#333" : "#fff" ; //#fff if good #333 if bad
    top.attr({ fill: fill_color });
    bottom.attr({ fill: fill_color });
  }
  
  this.element = good;
  
  this.canMove = function(rc_diffs){
    var newR = this.row + rc_diffs.r;
    var newC = this.col + rc_diffs.c;

    return ! maze.isWall(newR, newC);
  };
  
  this.move = function(xy_diffs, rc_diffs){
    this.row += rc_diffs.r;
    this.col += rc_diffs.c;

    this.element.attr({ transform: "...t " +
                                          maze.cell_width * xy_diffs.x
                                          + ", " + 
                                          maze.cell_width * xy_diffs.y
                        });
                
    if( typeof(this.mask) != "undefined" ){
      this.mask.attr({ 
                    x: this.mask.attrs.x + maze.cell_width * xy_diffs.x, 
                    y: this.mask.attrs.y + maze.cell_width * xy_diffs.y
                  });
    }
  };
}