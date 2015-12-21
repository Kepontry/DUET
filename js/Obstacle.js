//Inheritance Function
var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};

//Parent Obstacle Class

var Obstacle = function(dx, dy, fs) {
	this.x; 
	this.y;
	this.w;
	this.h;
	this.dx = dy;
	this.dy = dy;
	this.initialX = this.x;
	this.initialY = this.y;
	this.onScreen = false;
	if(!fs)this.fs = 'white';
	else this.fs = fs;
	this.spd = 5;	
};

Obstacle.prototype.updatePos = function() {	
	if(this.y < 700 && this. y > -200) this.onScreen = true;
	else this.onScreen = false;
	this.y +=this.dy;
	this.x +=this.dx;	
}

Obstacle.prototype.reversePos = function() {
	if(this.y < 700 && this. y > -200) this.onScreen = true;
	else this.onScreen = false;
	if(this.initialY <=this.y) {
		this.y -=this.dy*4;
		this.x -=this.dx*4;
		return;
	}
	else return true;
}

Obstacle.prototype.changeColor = function(color) {
	this.fs = color;
}


//Square Obstacle
var SquareStillCenter = function(dx, dy, fs) {
	this.x = 150;
	this.y = -100;
	this.w = 80;
	this.h = 80;
	this.dx = dx;
	this.dy = dy;
	this.initialX = this.x;
	this.initialY = this.y;
	// this.onScreen = false;
	if(!fs)this.fs = 'white';
	else this.fs = fs;
	this.spd = 5;	
	
	// SquareStillCenter.prototype.updatePos.call(this);
}
inheritsFrom(SquareStillCenter, Obstacle);


//Rectangle Upright Right
var RectangleUprightR = function(dx, dy, fs) {
	this.x = 100;
	this.y = -600;
	this.w = 30;
	this.h = 150;
	this.dx = dx;
	this.dy = dy;
	this.initialX = this.x;
	this.initialY = this.y;
	if(!fs)this.fs = 'white';
	else this.fs = fs;
	this.spd = 5;
};
inheritsFrom(RectangleUprightR, Obstacle);


//Rectangle Upright Left
var RectangleUprightL = function(dx, dy, fs) {
	this.x = 300;
	this.y = -600;
	this.w = 30;
	this.h = 150;
	this.dx = dx;
	this.dy = dy;
	this.initialX = this.x;
	this.initialY = this.y;
	if(!fs)this.fs = 'white';
	else this.fs = fs;
	this.spd = 5;
};
inheritsFrom(RectangleUprightL, Obstacle);


//Rectangle Upright Left
var RectangleHorzC = function(dx, dy, fs) {
	this.x = 150;
	this.y = -1000;
	this.w = 70;
	this.h = 30;
	this.dx = dx;
	this.dy = dy;
	this.initialX = this.x;
	this.initialY = this.y;
	if(!fs)this.fs = 'white';
	else this.fs = fs;
	this.spd = 5;
};
inheritsFrom(RectangleHorzC, Obstacle);