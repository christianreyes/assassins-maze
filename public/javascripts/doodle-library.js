/* Doodle Drawing Library
 *
 * Christian Reyes
 * Carnegie Mellon University
 * 05433D Software Structures for User Interfaces - Web
 *
 * Project 2 - Doodle
 *
 * Drawing library which extends HTML5 <canvas>
 *
 */

function Doodle(context) {
    this.context = context;
    this.children = [];
}

Doodle.prototype.draw = function() {
	// Your draw code here
    for(var i=0;i<this.children.length;i++){
        this.context.save();
        this.children[i].draw(this.context);
        this.context.restore();
    }
};


/* Base class for all drawable objects.
 * Do not modify this class!
 */
function Drawable (attrs) {
    var dflt = { 
        left: 0,
        top: 0,
        visible: true,
        theta: 0
    };
    attrs = mergeWithDefault(attrs, dflt);
    this.left = attrs.left;
    this.top = attrs.top;
    this.visible = attrs.visible;
    this.theta = attrs.theta;
}

Drawable.prototype.draw = function() {
    console.log("ERROR: Calling unimplemented draw method on drawable object.");
};


/* Base class for objects that cannot contain child objects.
 * Do not modify this class!
 */
function Primitive(attrs) {
    var dflt = {
        lineWidth: 1,
        color: "black"
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);
    this.lineWidth = attrs.lineWidth;
    this.color = attrs.color;
}
Primitive.inheritsFrom(Drawable);


function Text(attrs) {
    var dflt = {
        content: "",
        fill: "black",
        font: "12pt Helvetica",
        height: 12
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);
    this.content = attrs.content;
    this.fill = attrs.fill;
    this.font = attrs.font;
    this.height = attrs.height;
    // add constructor code here
}
Text.inheritsFrom(Drawable);

Text.prototype.draw = function (c) {
    // your draw code here
    c.fillStyle = this.fill;
    c.font = this.font;
    c.fillText(this.content, this.left, this.height);
};

function DoodleImage(attrs) {
    var dflt = {
        width: -1,
        height: -1,
        src: ""
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);
	this.width = attrs.width;
	this.height = attrs.height;
	this.src = attrs.src;
	// rest of constructor code here
}
DoodleImage.inheritsFrom(Drawable);

DoodleImage.prototype.draw = function (c) {
    var img = new Image();
	var l = this.left;
	var t = this.top;
	var w = this.width;
	var h = this.height;
	img.src = this.src;

    //img.onload = function(){
	if(w != -1 && h != -1){
		c.drawImage(img,l,t,w,h);
	} else {
		c.drawImage(img,l,t);
	}
    //};
};


function Line(attrs) {
    var dflt = {
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
		lineWidth: 1
    };
    attrs = mergeWithDefault(attrs, dflt);
    Primitive.call(this, attrs);
    // your draw code here
	this.startX = attrs.startX;
	this.startY = attrs.startY;
	this.endX = attrs.endX;
	this.endY = attrs.endY;
	this.lineWidth = attrs.lineWidth;
}
Line.inheritsFrom(Primitive);

Line.prototype.draw = function (c) {
    // your draw code here
    c.beginPath();

    if(typeof(this.lineWidth) != "undefined"){
         c.lineWidth = this.lineWidth;
    }
    if(typeof(this.color) != "undefined"){
         c.strokeStyle = this.color;
    }
    c.moveTo(this.startX,this.startY);
    c.lineTo(this.endX, this.endY);
    c.closePath();
    c.stroke();
};

function Path(attrs) {
    var dflt = {
        type: "straight",
        points: [],
		fill: ""
    };
    attrs = mergeWithDefault(attrs, dflt);
    Primitive.call(this, attrs);
    // rest of constructor code here
	this.type = attrs.type;
	this.points = attrs.points;
	this.fill = attrs.fill
}
Path.inheritsFrom(Primitive);

Path.prototype.draw = function (c) {
	if(this.points.length > 0){
		// draw code here
		c.beginPath();
		c.moveTo(this.points[0].x, this.points[0].y);
		
		if(typeof(this.lineWidth) != "undefined"){
			c.lineWidth = this.lineWidth;
		}
		if(typeof(this.color) != "undefined"){
			c.strokeStyle = this.color;
		}
		if(this.fill != ""){
			c.fillStyle = this.fill;
		}
		
		for(var i=1;i<this.points.length;i++){
			var p = this.points[i];

		//c.lineCap = "r";
			switch(this.type){
				case "straight":
					c.lineTo(p.x, p.y);
					break;
				case "quadratic":
					c.quadraticCurveTo(p.cp1x, p.cp1y, p.x, p.y);
					break;
				case "bezier":
					c.bezierCurveTo(p.cp1x, p.cp1y, p.cp2x, p.cp2y, p.x, p.y);
					break;
			}
		}
		
		if(this.fill != ""){
			c.fill();
		}
		else
		{	
			c.stroke();
		}
	}
};


function Arc(attrs) {
    var dflt = {
        centerX: 0,
        centerY: 0,
        radius: 0,
        startingTheta: 0,
        endingTheta: 0,
        counterclockwise: false,
		fill: ""
    };
    attrs = mergeWithDefault(attrs, dflt);
    Primitive.call(this, attrs);
	
	this.centerX = attrs.centerX;
    this.centerY = attrs.centerY;
    this.radius = attrs.radius;
    this.startingTheta = attrs.startingTheta;
    this.endingTheta = attrs.endingTheta;
    this.counterclockwise = attrs.counterclockwise;
    this.left = attrs.centerX - attrs.radius;
    this.top = attrs.centerY - attrs.radius;
	this.fill = attrs.fill;
	// rest of constructor code here
}
Arc.inheritsFrom(Primitive);

Arc.prototype.draw = function (c) {
    // draw code here
    c.beginPath();

    if(typeof(this.lineWidth) != "undefined"){
         c.lineWidth = this.lineWidth;
    }
    if(typeof(this.color) != "undefined"){
         c.strokeStyle = this.color;
    }

    c.arc(this.centerX,this.centerY,this.radius, this.startingTheta, this.endingTheta, this.counterclockwise );
	
	if(this.fill!=""){
		c.fillStyle = this.fill;
		c.fill();
	}
    c.stroke();
};

function Container(attrs) {
    var dflt = {
        width: 100,
        height: 100,
        fill: "",
        borderColor: "black",
        borderWidth: 0,
		gradient: "",
		xVelocity: 0,
		yVelocity: 0
    };
    attrs = mergeWithDefault(attrs, dflt);
    Drawable.call(this, attrs);    
    this.children = [];
    this.width = attrs.width;
    this.height = attrs.height;
    this.fill = attrs.fill;
    this.borderColor = attrs.borderColor;
    this.borderWidth = attrs.borderWidth;
	this.gradient = attrs.gradient;
	this.xVelocity = attrs.xVelocity;
	this.yVelocity = attrs.yVelocity;
    // rest of constructor code here.
}
Container.inheritsFrom(Drawable);

Container.prototype.draw = function (c) {
    // draw code here
    c.save();
	
	if(this.borderWidth != 0){
        c.lineWidth = this.borderWidth;
	}
	
    c.translate(this.left,this.top);
	c.rotate(this.theta);
   
    c.beginPath();
    c.moveTo(0,0);
    c.lineTo(this.width,0);
    c.lineTo(this.width,this.height);
    c.lineTo(0,this.height);
    c.lineTo(0,0);
    c.closePath();
    
    if(this.fill != ""){
        c.fillStyle = this.fill;
        c.fill();
    }
	
	if(this.gradient != ""){
        var grad = c.createLinearGradient(0,0,this.width,this.height);
        
        for(var i=0; i<this.gradient.length;i++){
            var stop = this.gradient[i];
            grad.addColorStop(stop.position,stop.color);
        }
        
        c.fillStyle = grad;
        c.fill();
    }


    if(this.borderWidth != 0){
        c.stroke();
    }
    c.clip();
	
    for(var i=0;i<this.children.length;i++){
        var child = this.children[i];
        
        c.save();
        //c.translate(child.left,child.top);
        //c.rotate(child.theta);
        child.draw(c);
        c.restore();
    }
    

    c.restore();
};

function PolygonContainer(attrs) {
    var dflt = {
        radius: 100,
        sides: 3,
	    centerX: 100,
	    centerY: 100,
	    polygonTheta: 0
    };
    attrs = mergeWithDefault(attrs, dflt);
    Container.call(this, attrs);
    // rest of constructor code here
    this.radius = attrs.radius;
    this.sides = attrs.sides;
    this.centerX = attrs.centerX;
    this.centerY = attrs.centerY;
    this.polygonTheta = attrs.polygonTheta;
    this.left = attrs.centerX - attrs.radius;
    this.top = attrs.centerY - attrs.radius;
}
PolygonContainer.inheritsFrom(Container);

PolygonContainer.prototype.draw = function (c) {
    // draw code here
	c.save();
	{
	    if(this.borderWidth != 0){
            c.lineWidth = this.borderWidth;
	    }

        if(typeof(this.borderColor) != "undefined" ){
            c.strokeStyle = this.borderColor;
	    }

        if(typeof(this.fill) != "undefined") {
            c.fillStyle = this.fill;
        }
	
        c.save();
        {
            c.translate(this.centerX,this.centerY);
	        c.rotate(this.polygonTheta);
    
            var ang = (360/this.sides) * (Math.PI / 180);

            c.beginPath();
            // first point
            c.moveTo(this.radius, 0);
    
            for(var i=1;i<=this.sides;i++){
		        var inAng = ang * i;
                var x = this.radius * Math.cos(inAng);
                var y = this.radius * Math.sin(inAng);
                c.lineTo(x,y);
            }

            c.closePath();
            c.fill();
            c.stroke();
            c.clip();
        }
	    c.restore();

        c.save();
        {
            c.translate(this.left, this.top);

            for(var i=0;i<this.children.length;i++){
                var child = this.children[i];
        
                c.save();
                //c.translate(child.left,child.top);
                //c.rotate(child.theta);
                child.draw(c);
                c.restore();
            }
        }
        c.restore();
    }
	c.restore();
};