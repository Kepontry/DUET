var STATE = { START: 0, PLAY: 1, HIT: 2, OVER:3, LVLCLR:4 };
var KEY = { LEFT:97, RIGHT:100, ESC:27, SPACE:32 };
var GAMESTATE = STATE.START;
var PAUSE = false;

var Duet = function() {
	var GAMEINT = 1;
	var that = this;
	var gameLoop;
	var canvas = document.getElementById('canvas');
	var screenOverlay;
	var screenMsg;
	var MSG = {	START: "HIT SPACE TO START", 
							PAUSE: "HIT ESC TO RESUME", 
							OVER: "GAME OVER!", 
							LVLCLR: "LEVEL CLEARED! PRESS SPACE TO CONTINUE"};
	var orbitCx = canvas.width/2;
	var orbitCy = canvas.height/1.3;
	var angleInterval = 15;
  var angle = 0;
  var angleIncr = 0.9;
  var keyPressInterval;
  var orbit, redCircle, blueCircle;
	var obstacles = [];
	var collisionDetector;
	var scoreCounter = 0;
	var levelCounter = 0;
	var currentLevel = level[levelCounter];
	var playerData = {life: 1, score: 0};
	var obsFactory = new ObstacleFactory();


	var loadLevel = function() {	
			//loading obstacles
	
		for(var i = 0; i<currentLevel.obs.length; i++) {
		obstacles[i] = obsFactory.getObstacle(currentLevel.obs[i].code, currentLevel.SPD, currentLevel.obs[i].IY);
		}
	}

	var reset = function() {
		levelCounter = 0;
		currentLevel = level[levelCounter];
		life = 1;

	}
	

	this.load = function() {
		//Set Listeners
		document.addEventListener('keypress', onKeyPress);
		document.addEventListener('keyup', onKeyUp);
		document.addEventListener('keydown', onKeyDown);

		//Create the player
		orbit = new Orbit(orbitCx, orbitCy, 100, null, 'gray');
		redCircle = new RedCircle(orbitCx-100, orbitCy, 10, 'red');
		blueCircle = new BlueCircle(orbitCx+100, orbitCy, 10, 'blue');

		//initial call to canvas draw function
		var drawer = new Drawer(canvas, orbit, redCircle, blueCircle, obstacles, playerData);
		window.requestAnimationFrame(drawer.redraw);

		// //loading obstacles
		// var obsFactory = new ObstacleFactory();
		// for(var i = 0; i<currentLevel.obs.length; i++) {
		// obstacles[i] = obsFactory.getObstacle(currentLevel.obs[i].code, currentLevel.SPD, currentLevel.obs[i].IY);
		// }


		//create start, pause and gameover screens
		screenOverlay = document.createElement('div');
		screenMsg = document.createElement('p');
		screenOverlay.id = 'screen-overlay';

		screenMsg = document.createElement('p');
		screenOverlay.appendChild(screenMsg);

		screenMsg.innerHTML = MSG.START;
		document.body.appendChild(screenOverlay);

		// obstacles[0] = obsFactory.getObstacle('RHRR', 1.2, -100);

		collisionDetector = new CollisionDetector();

	}

	var changeState = function() {
		clearInterval(gameLoop);
	  gameLoop = setInterval(that.game, GAMEINT);
	}

	this.game = function() {
		switch(GAMESTATE) {
			case STATE.PLAY:
			scoreCounter++;
			if(scoreCounter%250 == 0){playerData.score++;
				// console.log('obstacles[obstacles.length-1]',obstacles[obstacles.length-1]);
				if(obstacles[obstacles.length-1].crossedFinish()) GAMESTATE = STATE.LVLCLR;
			}
				for(var i = 0; i < obstacles.length; i++) {
			    obstacles[i].updatePos();
			    // console.log('obstacles[obstacles.length-1]',obstacles[obstacles.length-1]);
			    if(collisionDetector.detectCollision(redCircle, obstacles[i])) {
			    	playerData.life--;
			    	GAMESTATE = STATE.HIT;
			    	obstacles[i].changeColor('red');
			    } 
			    if(collisionDetector.detectCollision(blueCircle, obstacles[i])) {
			    	playerData.life--;
			    	GAMESTATE = STATE.HIT;
			    	obstacles[i].changeColor('blue');
			    } 
		  	}
		  	break;

	  	case STATE.HIT:
  		changeState();
  		for(var i = 0; i < obstacles.length; i++) {
  			redCircle.revolveAround(orbitCx, orbitCy, .5);
  			blueCircle.revolveAround(orbitCx, orbitCy, .5);
  			if(playerData.life == 0) GAMESTATE = STATE.OVER;
		   if(obstacles[i].reversePos()) GAMESTATE = STATE.PLAY;  
	  	}
  		break;

	    case STATE.START:
	    if(level[levelCounter])loadLevel();
	    else MSG.LVLCLR = 'NO MORE LEVELS';
    	changeState();
    	GAMESTATE = STATE.PLAY;
    	break;

	    case STATE.OVER:
	    clearInterval(gameLoop);
	    screenMsg.innerHTML = MSG.OVER;
			document.body.appendChild(screenOverlay);
			break;


    	case STATE.LVLCLR:
    	currentLevel = level[++levelCounter];
    	screenMsg.innerHTML = MSG.LVLCLR;
			document.body.appendChild(screenOverlay);
    	clearInterval(gameLoop);
    	GAMESTATE = STATE.START;
    	// document.body.removeChild(screenOverlay);
    	break;
		}
	}

	//EVENT LISTENING
  var onKeyPress = function(ev) {
    // console.log("onKeyPress", ev.keyCode);

    if (!keyPressInterval) {
        switch(ev.keyCode){
            case KEY.LEFT:
                keyPressInterval = setInterval(function() {
                // console.log('first',angle);
                if(angle < 5)
                angle += angleIncr;
                redCircle.revolveAround(orbitCx, orbitCy, angle);
                blueCircle.revolveAround(orbitCx, orbitCy, angle);
                }, angleInterval);
            break;

            case KEY.RIGHT:
                keyPressInterval = setInterval(function() {
                  // console.log('first',angle);
                if(angle > -5)
                angle -= angleIncr;
                redCircle.revolveAround(orbitCx, orbitCy, angle);
                blueCircle.revolveAround(orbitCx, orbitCy, angle);
                }, angleInterval);
            break;
        }
    }
  }

  var onKeyUp = function(ev) {
    if(angle>0) angle -= angleIncr*3;
    else angle += angleIncr*3;
    // console.log('keyup',angle);
    clearInterval(keyPressInterval);
    keyPressInterval = undefined;
  }

  var onKeyDown = function(ev) {
    switch(ev.keyCode){
      case KEY.ESC:
      if(!PAUSE){
        clearInterval(gameLoop);
        document.removeEventListener('keypress', onKeyPress);
        document.removeEventListener('keyup', onKeyUp);
        PAUSE = !PAUSE;
      }
      else {
        gameLoop = setInterval(that.game, GAMEINT);
        document.addEventListener('keypress', onKeyPress);
        document.addEventListener('keyup', onKeyUp);
        PAUSE = !PAUSE;
      }  
      break;

      case KEY.SPACE:   
      // console.log('space pressed');
      if(document.getElementById('screen-overlay'))document.body.removeChild(screenOverlay);
      if(GAMESTATE == STATE.START)that.game();
      if(GAMESTATE == STATE.OVER){
      	GAMESTATE = STATE.START;
      	changeState();
      }
      break;
    }
  }
}