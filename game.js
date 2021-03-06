
var lastFrameTimeMs = 0;
var maxFPS = 120;
var delta = 0;
var timestep = 1000 / 120;
var fps = 120;
var framesThisSecond = 0;
var lastFpsUpdate = 0;
/**
 * requestAnimationFrame
 */
window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}
var elem = document.getElementById('canvasGame');

var ctx = elem.getContext('2d');
function random(min, max){
	return (Math.random() * max | 0) + min;
}
function mouseClicked(e){
    hasClicked = true;
	if(!lostLevel && !win && !nextLevelState)
		levels[currentLevel].eventMouseClicked(e);
}
var xMouse = 0;
var yMouse = 0;
function mouseMove(e){
	xMouse = e.clientX;
	yMouse = e.clientY;
}
var w = window,
e = document.documentElement,
g = document.getElementsByTagName('body')[0],
heightW = w.innerHeight|| e.clientHeight|| g.clientHeight;
var  widthW = w.innerWidth|| e.clientWidth|| g.clientWidth;
ctx.canvas.width = widthW - 0;
ctx.canvas.height = heightW - 4;
var WIDTH = widthW;
var HEIGHT = heightW - 4;
var hasClicked = false;
var alpha = 0;
var audioHit = [];
audioHit.push(new Audio('sound/select.wav'));
audioHit.push(new Audio('sound/hit.wav'));
audioHit.push(new Audio('sound/hitSine.wav'));
var currentHit = 0;
function nextHitSong(){
	if(currentHit + 1 == audioHit.length){
		currentHit = -1;
	}
	audioHit[++currentHit].play();
}
var Point = function(x, y, color, dx, dy, speedX, speedY){
	this.x = x;
	this.y = y;
	if(dx == undefined){
		this.dx = parseInt(Math.random()*100)/100;
		var inv = random(1, 2);
		if(inv == 1){
			this.dx *= -1;
		}
	}else{
		this.dx = dx;
	}
	if(dy == undefined){
		this.dy = parseInt(Math.random()*100)/100;
		var inv = random(1, 2);
		if(inv == 1){
			this.dy *= -1;
		}
	}else{
		this.dy = dy;
	}
	if(color == undefined){
		this.color = randomColor();
	}else{
		this.color = color;
	}
	if(speedX == undefined){
		this.speedX = random(2, 7);
	}else{
		this.speedX = speedX;
	}
	if(speedY == undefined){
		this.speedY = random(2, 7);
	}else{
		this.speedY = speedY;
	}
	this.radius = 4;
	this.inCollision = function(oPoint){
		var distance = Math.sqrt((this.x - oPoint.x) *
				(this.x - oPoint.x) +
				(this.y - oPoint.y) *
				(this.y - oPoint.y));
		if(distance < this.radius + oPoint.radius){
			return true;
		}
		return false;
	}
}
var colors = ['#b543de', '#FF4B47', '#40E64F',
				'#E0C93B', '#F58F39', '#39BAC5',
				'#e63192'];
function randomColor(){
	var rdm = Math.round(Math.random()*(colors.length-1));
	return colors[rdm];
	var color = '#';
	for(var c = 0; c < 6; c++){
		color += rdm;
		rdm = Math.round(Math.random()*10);
	}
	return color;
}
var points = [];
var pointsTouched = [];
var mousePoints = [];
var currentLevel = -1;
var levels = [];
var flashBall = [];
function Level(goal, fctGeneration, logic, draw, fctMouseClicked){
	this.goal = goal;
	this.ballsPlaced = 0;
	//methods
	this.generation = fctGeneration;
	this.logic = logic;
	this.draw = draw;
	this.eventMouseClicked = fctMouseClicked;
}
levels.push(new Level('Place one ball and capture 10 other with the first !',
	function(){
		for(var p = 0; p < 72; p++){
			points.push(new Point(WIDTH/2,HEIGHT/2));
		}
		this.ready = false;
		this.step = 0;
		this.next = false;
	},
	function(){ //LOGIC
		if(!this.ready){
			if(hasClicked){
				this.ready = true;
				this.next = false;
			}else{
				return;
			}
		}else{
			if(this.next){
			if(this.step < 3){
				this.ready = false;
				this.step++;
			}}
		}

		for(var p = 0; p < points.length; p++){
			for(var m = 0; m < mousePoints.length; m++){
				if(points[p].inCollision(mousePoints[m]) &&
						pointsTouched.indexOf(points[p]) == -1){
					points[p].color = 'white';
					pointsTouched.push(points[p]);
					var fb = new Point(points[p].x, points[p].y);
					fb.color='white';
					flashBall.push(fb);
					nextHitSong();
					if(this.step == 1 && this.ready){
						this.next = true;
					}
				}
			}
		}
		if(pointsTouched.length >= 10){
			nextLevel();
		}
	},
	function(){ //DRAW
		if(!this.ready){
			if(this.step == 0){

				ctx.font = '23px serif';
				ctx.fillStyle = 'white';
				ctx.strokeStyle = "white";
				ctx.lineWidth="10";
				ctx.moveTo(200, 55);
				ctx.lineTo(200, HEIGHT * 0.42);
				ctx.moveTo(202, 55);
				ctx.lineTo(150, 100);
				ctx.moveTo(198, 55);
				ctx.lineTo(250, 100);
				ctx.stroke();
				ctx.fillText('LEVEL INSTRUCTION', 100, HEIGHT * 0.42 + 25);

				ctx.font = '42px serif';
				ctx.shadowColor = randomColor();
				ctx.shadowBlur="50";
				ctx.fillText('Mouse Left: Put one ball', WIDTH/2 - 160, HEIGHT/2 - 20);
				ctx.fillText('Mouse Right: Reverse the balls', WIDTH/2 - 185, HEIGHT/2 + 22);
				ctx.fillText('Click to start.', WIDTH/2 - 50, HEIGHT/2 + 62);
			}else if(this.step == 1){
				mousePoints[0].radius = 20;

				ctx.fillStyle = 'white';
				ctx.shadowColor = randomColor();
				ctx.shadowBlur="50";
				ctx.font = '42px serif';
				var y =  HEIGHT/2 + (HEIGHT/2 - mousePoints[0].y);
				ctx.fillText('This ball should be collided with one other..',  WIDTH/2 - 200, y);
			}else if(this.step == 2){
				ctx.shadowColor = randomColor();
				ctx.shadowBlur="50";
				ctx.font = '42px serif';

				ctx.fillStyle = 'white';
				ctx.fillText('You see, one other ball was collided with the first',  WIDTH/2 - 200, HEIGHT/2);
				ctx.fillText('Continue to do that, to capture 10 balls !', WIDTH/2 - 200, HEIGHT/2 + 40);
			}
		}
	},
	function(e){ //MOUSECLIKED
		if(!this.ready)
			return;
		if(e.button > 0){
			for(var p = 0; p < points.length; p++){
				points[p].speedX *= -1;
				points[p].speedY *= -1;
			}
		}else{
			mousePoints.push(new Point(e.clientX, e.clientY));
			if(this.ready){
				if(this.step == 0){
					this.next = true;
				}
			}
		}
	}));
levels.push(new Level('3 balls this time !',
		function(){
	for(var p = 0; p < 15; p++){
		points.push(new Point(random(1, WIDTH),random(1, HEIGHT)));
	}this.ballsPlaced = 0;

    },
	function(){ //LOGIC
		for(var p = 0; p < points.length; p++){
			for(var m = 0; m < mousePoints.length; m++){
				if(points[p].inCollision(mousePoints[m]) &&
						pointsTouched.indexOf(points[p]) == -1){
					points[p].color = 'white';
					pointsTouched.push(points[p]);
					nextHitSong();
					var fb = new Point(points[p].x, points[p].y);
					fb.color='white';
					flashBall.push(fb);
				}
			}
		}
        if(this.ballsPlaced > 3 && mousePoints.length == 0){
            lost();
            return;
        }
		if(pointsTouched.length >= 3){
			nextLevel();
		}
	},
	function(){ //DRAW
	},
	function(e){ //MOUSECLIKED
		if(e.button > 0){
			for(var p = 0; p < points.length; p++){
				points[p].speedX *= -1;
				points[p].speedY *= -1;
			}
		}else{
		if(this.ballsPlaced < 5){
    		mousePoints.push(new Point(e.clientX, e.clientY));
    		this.ballsPlaced++;
		}}
	}));
levels.push(new Level('Try 3 red balls !',
			function(){
		for(var p = 0; p < 10; p++){
			var color = randomColor();
			while(color == '#FF4B47'){
				color = randomColor();
			}
			points.push(new Point(random(1, WIDTH),random(1, HEIGHT), color));
		}
		for(var p = points.length; p < 20; p++){
			points.push(new Point(random(1, WIDTH),random(1, HEIGHT), '#FF4B47'));
		}
		this.ballsPlaced = 0;
		this.ballsGoal = 3;
		this.pointsMouseToLose = 3;
		this.colorGoal = '#FF4B47';
	    },
		function(){ //LOGIC
			if(alpha < Math.PI){
				alpha += 0.02;
				animations['win'].logic();
				if(alpha + 0.5 >= Math.PI){
					alpha = Math.PI;
				}
				return;
			}
			for(var p = 0; p < points.length; p++){
				for(var m = 0; m < mousePoints.length; m++){
					if(points[p].inCollision(mousePoints[m]) &&
							pointsTouched.indexOf(points[p]) == -1
							&& points[p].color == this.colorGoal){
						points[p].color = 'white';
						pointsTouched.push(points[p]);
						nextHitSong();
						var fb = new Point(points[p].x, points[p].y);
						fb.color=this.colorGoal;
						flashBall.push(fb);
					}
				}
			}
	        if(this.ballsPlaced >= this.pointsMouseToLose && mousePoints.length == 0){
	            lost();
	            return;
	        }
			if(pointsTouched.length >= this.ballsGoal){
				nextLevel();
			}
		},
		function(){ //DRAW
			if(alpha < Math.PI){
				ctx.fillStyle = 'white';
				ctx.shadowColor = 'white';
		    ctx.shadowBlur = animations['win'].step;
				ctx.font = '42px serif';
		    ctx.fillText('LOADING', WIDTH/2 - 55, HEIGHT/2);
			}
		},
		function(e){ //MOUSECLIKED
			if(alpha < Math.PI)
				return;
			if(e.button > 0){
				for(var p = 0; p < points.length; p++){
					points[p].speedX *= -1;
					points[p].speedY *= -1;
				}
			}else{
				if(this.ballsPlaced < this.pointsMouseToLose+1){
		    		mousePoints.push(new Point(e.clientX, e.clientY));
		    		this.ballsPlaced++;
				}
			}
}));
levels.push(new Level('Try 3 green balls !',
			function(){
		for(var p = 0; p < 10; p++){
			var color = randomColor();
			while(color == '#40E64F'){
				color = randomColor();
			}
			points.push(new Point(WIDTH/2,HEIGHT/2, color));
		}
		for(var p = points.length; p < 15; p++){
			points.push(new Point(WIDTH/2,HEIGHT/2, '#40E64F'));
		}
			levels[currentLevel-1].ballsPlaced = 0;
			levels[currentLevel-1].pointsMouseToLose = 2;
	  	levels[currentLevel-1].colorGoal='#40E64F';
	  },
		function(){ //LOGIC
			levels[currentLevel-1].logic();
		},
		function(){ //DRAW
			if(alpha < Math.PI){
				ctx.fillStyle = 'white';
				ctx.shadowColor = 'white';
		    ctx.shadowBlur = animations['win'].step;
				ctx.font = '42px serif';
		    ctx.fillText('LOADING', WIDTH/2 - 55, HEIGHT/2);
			}
		},
		function(e){ //MOUSECLIKED
			if(alpha < Math.PI)
				return;
			if(e.button > 0){
				for(var p = 0; p < points.length; p++){
					points[p].speedX *= -1;
					points[p].speedY *= -1;
				}
			}else{
				if(levels[currentLevel-1].ballsPlaced < 3){
		    		mousePoints.push(new Point(e.clientX, e.clientY));
		    		levels[currentLevel-1].ballsPlaced++;
				}
			}
}));
levels.push(new Level('You have a new spell, place two balls to try. After that capture 5 balls with those line.',
			function(){
		for(var p = 0; p < 11; p++){
			points.push(new Point(random(1, WIDTH),random(1, HEIGHT), randomColor(), undefined, undefined,
								random(1, 4), random(1, 4)));
		}
		this.ballsPlaced = 0;
		this.ballsGoal = 5;
		this.pointsMouseToLose = 4;
	    },
		function(){ //LOGIC
			if(alpha < 2*Math.PI){
				alpha += 0.1;
				animations['win'].logic();
				if(parseFloat(alpha) > 6.1){
					alpha = 2*Math.PI;
					}
				return;
			}
			for(var p = 0; p < mousePoints.length; p++){
				if(mousePoints[p].radius < 14){
					mousePoints[p].radius+=0.1;
				}
			}


			for(var m = 0; m < mousePoints.length; m++){
				if(m % 2 != 0){
					var a = (mousePoints[m-1].y - mousePoints[m].y) /
						(mousePoints[m-1].x - mousePoints[m].x);
					var b = -(a * mousePoints[m].x - mousePoints[m].y);
					for(var p = 0; p < points.length; p++){
						if(points[p].x >
							((mousePoints[m].x < mousePoints[m-1].x) ?
							mousePoints[m].x : mousePoints[m-1].x) &&
							points[p].x <
							((mousePoints[m].x > mousePoints[m-1].x) ?
							mousePoints[m].x : mousePoints[m-1].x)){
							var a1 = points[p].dy / points[p].dx;
							var b1 = -(a1 * points[p].x - points[p].y);
							var xColl = (b1 - b) / (a - a1);
							var distance = Math.sqrt((points[p].x - xColl) *
									(points[p].x - xColl) +
									(points[p].y - (a*xColl+b)) *
									(points[p].y - (a*xColl+b)));
							if(distance < 10){
								if(points[p].color == 'white' && !points[p].touched){
									points[p].color = points[p].lastColor;
									points[p].touched = true;
								}else if(!points[p].touched && points[p].color != 'white'){
									points[p].lastColor = points[p].color;
									points[p].color = 'white';
									points[p].touched = true;
									nextHitSong();
									var fb = new Point(xColl, a*xColl+b);
									fb.color='white';
									flashBall.push(fb);
									pointsTouched.push(points[p]);
								}
							}else{
								points[p].touched = false;
							}
						}
					}
				}
			}
	        if(this.ballsPlaced > this.pointsMouseToLose && mousePoints.length == 0){
	            lost();
	            return;
	        }
			if(pointsTouched.length >= this.ballsGoal){
				nextLevel();
			}
		},
		function(){ //DRAW
			if(alpha < 2*Math.PI){
				ctx.fillStyle = 'white';
				ctx.shadowColor = 'white';
		    ctx.shadowBlur = animations['win'].step;
				ctx.font = '42px serif';
		    ctx.fillText('LOADING', WIDTH/2 - 55, HEIGHT/2);
			}else{
				ctx.beginPath();
				ctx.lineWidth = 4;
				ctx.strokeStyle='white';
				for(var m = 0; m < mousePoints.length; m++){
					if(m % 2 != 0){
						ctx.moveTo(mousePoints[m-1].x, mousePoints[m-1].y);
						ctx.lineTo(mousePoints[m].x, mousePoints[m].y);
					}
				}
				ctx.stroke();
			}
		},
		function(e){ //MOUSECLIKED
			if(alpha < 2*Math.PI)
				return;

			for(var p = 0; p < points.length; p++){
				points[p].speedX *= -1;
				points[p].speedY *= -1;
			}
			if(e.button == 0){
				if(this.ballsPlaced < 6){
		    		mousePoints.push(new Point(e.clientX, e.clientY));
		    		this.ballsPlaced++;
				}else{
					lost();
					hasClicked = false;
					return;
				}
			}
}));
levels.push(new Level('Ok you have understand, now get 7 balls.',
			function(){
		for(var p = 0; p < 2; p++){
			points.push(new Point(WIDTH/2 + p,HEIGHT/2, randomColor()));
		}
		levels[currentLevel-1].ballsPlaced = 0;
		levels[currentLevel-1].ballsGoal = 7;
		levels[currentLevel-1].pointsMouseToLose = 2;
	    },
		function(){ //LOGIC
			levels[currentLevel-1].logic();
		},
		function(){ //DRAW
			if(alpha < 2*Math.PI){
				ctx.fillStyle = 'white';
				ctx.shadowColor = 'white';
		    ctx.shadowBlur = animations['win'].step;
				ctx.font = '42px serif';
		    ctx.fillText('LOADING', WIDTH/2 - 55, HEIGHT/2);
			}else{
				ctx.beginPath();
				ctx.lineWidth = 4;
				ctx.strokeStyle='white';
				for(var m = 0; m < mousePoints.length; m++){
					if(m % 2 != 0){
						ctx.moveTo(mousePoints[m-1].x, mousePoints[m-1].y);
						ctx.lineTo(mousePoints[m].x, mousePoints[m].y);
					}
				}
				ctx.stroke();
			}
		},
		function(e){ //MOUSECLIKED
			if(alpha < 2*Math.PI)
				return;

			for(var p = 0; p < points.length; p++){
				points[p].speedX *= -1;
				points[p].speedY *= -1;
			}
			if(e.button == 0){
				if(this.ballsPlaced < 6){
		    		mousePoints.push(new Point(e.clientX, e.clientY));
		    		this.ballsPlaced++;
				}else{
					lost();
					hasClicked = false;
					return;
				}
			}
}));


function nextLevel(){
	reset();
	if(currentLevel == levels.length - 1){
        win = true;
		for(var p = 0; p < 120; p++){
			points.push(new Point(random(1, WIDTH),random(1, HEIGHT)));
		}
		return;
	}
	if(currentLevel > -1){
		nextLevelState=true;
	}else{
		levels[++currentLevel].generation();
	}
}
function reset(){
	points = [];
	pointsTouched = [];
	mousePoints = [];
	flashBall = [];
}
var lostLevel = false;
var win = false;
function lost(){
	lostLevel = true;
}

var messages = [];
//time in ms
//animation str
function Message(msg, x, y, time, animation){
	this.msg = msg;
	this.x = x;
	this.y = y;
	this.time = time;
	this.animation = animation;
	this.logic = function(){
		if(this.startTime + this.time < Date.now()){
			messages.splice(messages.indexOf(this), 1);
			return;
		}
		if(this.animation != null)
			animations[this.animation].logic();
	}
	this.draw = function(){
		ctx.font = '30px serif';
		ctx.fillText(this.msg, this.x, this.y);
	}
	this.startTime = Date.now();
	messages.push(this);
}
function Animation(start, end, bearing){
    this.start = start;
    this.sens = 1;
    this.step = start;
    this.bearing = bearing;
    this.end = end;
    this.logic = function(){
        if(this.step > this.end-1){
            this.sens *= -1;
        }else if(this.step < this.start){
            this.sens *= -1;
        }
        this.step += (this.bearing * this.sens);
    }
}
var animations = [];
animations['lost'] = new Animation(0, 16, 0.15);
animations['win'] = animations['lost'];

nextLevel();
function loop(timestamp){
	// Throttle the frame rate.
	if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
		requestAnimationFrame(loop);
		return;
	}
	delta += timestamp - lastFrameTimeMs;
	lastFrameTimeMs = timestamp;

	if (timestamp > lastFpsUpdate + 1000) {
		fps = 0.25 * framesThisSecond + 0.75 * fps;

		lastFpsUpdate = timestamp;
		framesThisSecond = 0;
	}
	framesThisSecond++;
	var numUpdateSteps = 0;
	while (delta >= timestep) {
		update(timestep);
		delta -= timestep;
		if (++numUpdateSteps >= 240) {
			panic();
			break;
		}
	}
	draw();
	requestAnimationFrame(loop);
}
var nextLevelState = false;
function draw(){

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, WIDTH, HEIGHT);


		ctx.save();
		levels[currentLevel].draw();

		ctx.fillStyle = 'white';
	  ctx.shadowBlur = 0;
		ctx.font = '24px serif';
		ctx.fillText(levels[currentLevel].goal, 22, 30);
		ctx.fillText('balls captured: '+pointsTouched.length, 22, 60);
	    if(lostLevel){
	        ctx.fillStyle = 'white';
	        ctx.shadowOffsetX = 0;
	        ctx.shadowOffsetY = 0;
	        ctx.shadowColor = 'white';
	        ctx.shadowBlur = animations['lost'].step;
					ctx.font = '30px serif';
					ctx.fillText('CLICK TO', WIDTH/2 - 42, HEIGHT/2-30);
					ctx.font = '42px serif';
	        ctx.fillText('RETRY', WIDTH/2 - 42, HEIGHT/2);
	    }else if(win){
					ctx.fillStyle = 'white';
	        ctx.font = '42px serif';
	        ctx.shadowOffsetX = 0;
	        ctx.shadowOffsetY = 0;
	        ctx.shadowColor = 'white';
	        ctx.shadowBlur = animations['win'].step;
					ctx.font = '72px serif';
	        ctx.fillText('Good Game !', WIDTH/2 - 200, HEIGHT/2);
		}

		if(nextLevelState){
				ctx.fillStyle = 'white';
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ctx.shadowColor = 'white';
				ctx.shadowBlur = animations['lost'].step;
				ctx.font = '30px serif';
				ctx.fillText('CLICK TO', WIDTH/2 - 42, HEIGHT/2-30);
				ctx.font = '42px serif';
				ctx.fillText('NEXT LEVEL', WIDTH/2 - 92, HEIGHT/2);
				return;
		}


		ctx.translate(WIDTH/2,HEIGHT/2);
		ctx.rotate(alpha);
		ctx.translate(-WIDTH/2,-HEIGHT/2);

	ctx.beginPath();
	if(flashBall.length > 0){
		ctx.fillStyle = flashBall[0].color;
		ctx.globalAlpha = 0.4;
		ctx.shadowBlur = 10;
		ctx.shadowColor = flashBall[0].color;
	}
	for(var f = 0; f < flashBall.length; f++){
		ctx.moveTo(flashBall[f].x, flashBall[f].y);
		ctx.arc(flashBall[f].x, flashBall[f].y,
				flashBall[f].radius, 0, 2 * Math.PI, false);
	}ctx.fill();
	ctx.globalAlpha = 1;
	for(var p = 0; p < points.length; p++){
	//ball
		ctx.beginPath();
		ctx.fillStyle = points[p].color;
		ctx.shadowBlur = 16;
		ctx.shadowColor = points[p].color;
		ctx.arc(points[p].x, points[p].y, points[p].radius, 0, 2 * Math.PI, false);
		ctx.fill();
	}

		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 20;
		ctx.shadowColor = 'white';
		for(var p = 0; p < mousePoints.length; p++){
			ctx.moveTo(mousePoints[p].x, mousePoints[p].y);
			ctx.arc(mousePoints[p].x, mousePoints[p].y,
					mousePoints[p].radius, 0, 2 * Math.PI, false);


		}
		ctx.fill();
	for(var m = 0; m < messages.length; m++){
		messages[m].draw();
	}

		//draw mouse
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.shadowBlur = 1;
		ctx.lineWidth = 2;
		ctx.arc(xMouse, yMouse, 11, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(xMouse, yMouse, 8, 0, 2 * Math.PI, false);
		ctx.stroke();

		ctx.restore();
}
function panic() {
    delta = 0;
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
}
function update(){
	for(var m = 0; m < messages.length; m++){
		messages[m].logic();
	}
	for(var f = 0; f < flashBall.length; f++){
		flashBall[f].radius += 0.8;
		if(flashBall[f].radius > 70){
			flashBall.splice(f, 1);
			f--;
		}
	}


	if(currentLevel < 4){
		var mouseNeedDeleted = -1;
		for(var p = 0; p < mousePoints.length; p++){
			mousePoints[p].radius += 0.1;
			if(mousePoints[p].radius >= 28){
				mouseNeedDeleted = p;
			}
		}
		if(mouseNeedDeleted >= 0){
			mousePoints.splice(mouseNeedDeleted, 1);
		}
	}
	for(var p = 0; p < points.length; p++){
		if(points[p].x + points[p].speedX * points[p].dx >= WIDTH){
			points[p].dx *= -1;
		}
		else if(points[p].x + points[p].speedX * points[p].dx <= 0){
			points[p].dx *= -1;
		}
		if(points[p].y + points[p].speedY * points[p].dy >= HEIGHT){
			points[p].dy *= -1;
		}
		else if(points[p].y + points[p].speedY * points[p].dy <= 0){
			points[p].dy *= -1;
		}
		points[p].x += points[p].speedX * points[p].dx;
		points[p].y += points[p].speedY * points[p].dy;
		points[p].x = parseInt(points[p].x*100)/100;
		points[p].y = parseInt(points[p].y*100)/100;
	}

	if(nextLevelState){
		animations['win'].logic();
		if(hasClicked){
			levels[++currentLevel].generation();
			nextLevelState = false;
		}
		return;
	}

    if(lostLevel){
        animations['lost'].logic();
        if(hasClicked){
            reset();
            levels[currentLevel].generation();
            lostLevel = false;
        }
    }else if(!win){
        levels[currentLevel].logic();
    }else if(win){
			animations['win'].logic();
		}
    hasClicked = false;
}
requestAnimationFrame(loop);
