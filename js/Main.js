var Duet = function() {
	var STATE = { START: 0, PLAY: 1, HIT: 2, OVER:3, LVLCLR:4 };
	var KEY = { LEFT:97, RIGHT:100, ESC:27, SPACE:32 };
	var GAMESTATE;
	var PAUSE = false;
	var that = this;
	var gameLoop;
	var canvas = document.getElementById('canvas');
	var canvasContainer = document.getElementById('canvas-container');
	var screenOverlay,
		gameTitle,
		gameSubtitle,
		btnContinue,
		btnPause,
		screenMsg,
		levelTitle,
		levelMsg;
	var MSG = {	
		LOADING: "LOADING...",
		START: "HIT SPACE TO START", 
		PAUSE: "GAME PAUSED", 
		OVER: "GAME OVER!", 
		LVLCLR: "<p>LEVEL CLEARED!</p> <p>PRESS SPACE TO CONTINUE</p>",
		NEWHS: "NEW HIGHSCORE: ",
		BTNCONTINUE: "CONTINUE",
		BTNRESTART: "RESTART",
		BTNRESUME: "RESUME",
		BTNSTART: "START",
		GAMETITLE: "DUET",
		GAMESUBTITLE: "HEADPHONES RECOMMENDED"};
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
	var playerData = {life: 2, score: 0, highScore: 0, level: 0};
	var obsFactory = new ObstacleFactory();
	var rect = canvas.getBoundingClientRect();
	var backgroundAudio;
	var checkAudioInterval;


	var loadLevel = function() {	
			//loading obstacles
	
		for(var i = 0; i<currentLevel.OBS.length; i++) {
		obstacles[i] = obsFactory.getObstacle(currentLevel.OBS[i].code, currentLevel.SPD, currentLevel.OBS[i].IY);
		}
		playerData.level += 1;
		levelTitle.innerHTML = currentLevel.TITLE;
		levelMsg.innerHTML = currentLevel.MSG;
		var levelMsgTimeout = currentLevel.TIMEOUT;
		canvasContainer.appendChild(levelTitle);
		canvasContainer.appendChild(levelMsg);
		setTimeout(function(){
			canvasContainer.removeChild(levelTitle);
		}, 3000);
		setTimeout(function(){
			canvasContainer.removeChild(levelMsg);
		}, levelMsgTimeout);
	}

	var reset = function() {
		obstacles.splice(0,obstacles.length);
		levelCounter = 0;
		currentLevel = level[levelCounter];
		playerData.life = 2;
		playerData.score = 0;
		playerData.level = 0;
	}
	

	this.load = function() {
		//Set Listeners
		document.addEventListener('keypress', onKeyPress);
		document.addEventListener('keyup', onKeyUp);
		document.addEventListener('keydown', onKeyDown);

		//Set Touch event listeners
		canvas.addEventListener('touchstart', onTouchStart, false);
		canvas.addEventListener('touchend', onTouchEnd, false);		

		//Create the player
		orbit = new Orbit(orbitCx, orbitCy, 100, null, 'gray');
		redCircle = new RedCircle(orbitCx-100, orbitCy, 10, '#CA0013');
		blueCircle = new BlueCircle(orbitCx+100, orbitCy, 10, '#043C89');

		//initial call to canvas draw function
		var drawer = new Drawer(canvas, orbit, redCircle, blueCircle, obstacles, playerData);
		window.requestAnimationFrame(drawer.redraw);


		//create start, pause and gameover screens
		screenOverlay = document.createElement('div');
		screenOverlay.id = 'screen-overlay';
		
		btnContinue = document.createElement('div');
		btnContinue.id = 'btn-continue';		

		btnPause = document.createElement('div');
		btnPause.id = 'btn-pause';
		btnPause.addEventListener('click', onPause);

		gameTitle = document.createElement('p');
		gameTitle.id = 'game-title';
		gameTitle.innerHTML = MSG.GAMETITLE;

		gameSubtitle = document.createElement('p');
		gameSubtitle.id = 'game-subtitle';
		gameSubtitle.innerHTML = MSG.GAMESUBTITLE;

		levelTitle = document.createElement('p');
		levelTitle.id = 'level-title';

		levelMsg = document.createElement('p');
		levelMsg.id = 'level-msg';

		screenMsg = document.createElement('p');
		screenOverlay.appendChild(screenMsg);
		screenOverlay.appendChild(gameTitle);
		btnContinue.innerHTML = MSG.BTNSTART;
		btnContinue.addEventListener('click', onContinue);

		screenMsg.innerHTML = MSG.LOADING;
		canvasContainer.appendChild(screenOverlay);
		canvasContainer.appendChild(gameSubtitle);
		canvasContainer.appendChild(btnPause);

		collisionDetector = new CollisionDetector();

		//loading background audio
		backgroundAudio = new Audio("https://raw.githubusercontent.com/biiishal/DUET/gh-pages/sounds/bgaudio.mp3");
		// backgroundAudio = new Audio('sounds/bgaudio.MP3');
		backgroundAudio.loop = true;
		backgroundAudio.volume = .50;
		backgroundAudio.load();

		checkAudioInterval = setInterval(function(){
			console.log('checking audio');
			if(checkAudioLoad()){
				clearInterval(checkAudioInterval);
				screenMsg.innerHTML = MSG.START;
				canvasContainer.appendChild(btnContinue);
				GAMESTATE = STATE.START;
			}
		}, 1000);
	}

	var checkAudioLoad = function()	{
		if (backgroundAudio.readyState === 4) {
			return true;
		}
	}

	var changeState = function() {
		// clearInterval(gameLoop);
		window.cancelAnimationFrame(gameLoop);
		gameLoop = window.requestAnimationFrame(that.game);
	}

	this.game = function() {
		switch(GAMESTATE) {
			case STATE.PLAY:
			gameLoop = window.requestAnimationFrame(that.game);
			scoreCounter++;
			if(scoreCounter%100 == 0){playerData.score++;
				if(obstacles[obstacles.length-1].crossedFinish()) GAMESTATE = STATE.LVLCLR;
			}
				for(var i = 0; i < obstacles.length; i++) {
			    obstacles[i].updatePos();
			    if(collisionDetector.detectCollision(redCircle, obstacles[i])) {
			    	playerData.life--;
			    	GAMESTATE = STATE.HIT;
			    	obstacles[i].changeColor('#801515');
			    } 
			    if(collisionDetector.detectCollision(blueCircle, obstacles[i])) {
			    	playerData.life--;
			    	GAMESTATE = STATE.HIT;
			    	obstacles[i].changeColor('#261758');
			    } 
		  	}
		  	break;

	  	case STATE.HIT:
	  	console.log('GAMESTATE', GAMESTATE);
  		changeState();
  		for(var i = 0; i < obstacles.length; i++) {
  			redCircle.revolveAround(orbitCx, orbitCy, 2);
  			blueCircle.revolveAround(orbitCx, orbitCy, 2);
  			if(playerData.life == 0) GAMESTATE = STATE.OVER;
		   if(obstacles[i].reversePos()) GAMESTATE = STATE.PLAY;  
	  	}
  		break;

	    case STATE.START:
	    console.log('GAMESTATE', GAMESTATE);
	    if(level[levelCounter])loadLevel();
	    else {
	    	MSG.LVLCLR = 'NO MORE LEVELS';
	    	changeState();
	    	GAMESTATE = STATE.PLAY;
	  		break;}
    	changeState();
    	backgroundAudio.play();
    	GAMESTATE = STATE.PLAY;
    	break;

	    case STATE.OVER:
	    console.log('GAMESTATE', GAMESTATE);
	    if(gameLoop)window.cancelAnimationFrame(gameLoop);
	    screenOverlay.appendChild(gameTitle);
	    btnContinue.innerHTML = MSG.BTNRESTART;
	    canvasContainer.appendChild(btnContinue);
	    if(playerData.score > playerData.highScore) {
	    	playerData.highScore = playerData.score;
	    	screenMsg.innerHTML = '<p id = "game-over">' + MSG.OVER + '</p>'+ ' <p>' +MSG.NEWHS+ playerData.highScore + '</p>'; 
	    }
	    else screenMsg.innerHTML = MSG.OVER;
			canvasContainer.appendChild(screenOverlay);
			break;


    	case STATE.LVLCLR:
    	console.log('GAMESTATE', GAMESTATE);
    	currentLevel = level[++levelCounter];
    	if(currentLevel.AUDIO) {
    		backgroundAudio.src = currentLevel.AUDIO;
    		checkAudioInterval = setInterval(function(){
					console.log('checking audio');
					if(checkAudioLoad()){
						clearInterval(checkAudioInterval);
						GAMESTATE = STATE.START;
					}
				}, 1000);
    	} 
    	screenMsg.innerHTML = MSG.LVLCLR;
			canvasContainer.appendChild(screenOverlay);
			btnContinue.innerHTML = MSG.BTNCONTINUE;
			canvasContainer.appendChild(btnContinue);
    	window.cancelAnimationFrame(gameLoop);
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
      if(GAMESTATE == STATE.PLAY){
	      if(!PAUSE){
	      	btnPause.style.backgroundImage = "url('images/icon-play.png')";
	        if(gameLoop)window.cancelAnimationFrame(gameLoop);
	        backgroundAudio.pause();
	        document.removeEventListener('keypress', onKeyPress);
	        document.removeEventListener('keyup', onKeyUp);
	        canvas.removeEventListener('touchstart', onTouchStart);
	        canvas.removeEventListener('touchend', onTouchEnd);
	        screenMsg.innerHTML = MSG.PAUSE;
	        btnContinue.innerHTML = 'RESUME';
	        canvasContainer.appendChild(screenOverlay);
	        canvasContainer.appendChild(btnContinue);
	        PAUSE = !PAUSE;
	      }
	      else {
	      	btnPause.style.backgroundImage = "url('images/icon-pause.png')";
	      	backgroundAudio.play();
	      	if(document.getElementById('screen-overlay'))canvasContainer.removeChild(screenOverlay);
  	 			if(document.getElementById('btn-continue'))canvasContainer.removeChild(btnContinue);
	        gameLoop = window.requestAnimationFrame(that.game);
	        document.addEventListener('keypress', onKeyPress);
	        document.addEventListener('keyup', onKeyUp);
	        canvas.addEventListener('touchstart', onTouchStart);
	        canvas.addEventListener('touchend', onTouchEnd);
	        PAUSE = !PAUSE;
	      }  
    	}
      break;

      case KEY.SPACE:   
      // console.log('space pressed');
      if(!PAUSE && GAMESTATE == STATE.START){
	      if(document.getElementById('game-title'))screenOverlay.removeChild(gameTitle);
	      if(document.getElementById('game-subtitle'))canvasContainer.removeChild(gameSubtitle);
	      if(document.getElementById('screen-overlay'))canvasContainer.removeChild(screenOverlay);
	      if(document.getElementById('btn-continue'))canvasContainer.removeChild(btnContinue);
	    }
      if(GAMESTATE == STATE.START)that.game();
      if(GAMESTATE == STATE.OVER){
      	reset();
      	GAMESTATE = STATE.START;
      	changeState();
      }
      break;
    }
  }

  var onTouchStart = function(ev) {
  	ev.preventDefault();
  	console.log('canvas touch start', ev.touches[0].clientX - rect.left ); 
  	var x = ev.touches[0].clientX - rect.left;
	  	if(x<200) {
	  		 ev.keyCode = 97;
	  		 onKeyPress(ev);
  	  	}
  	  	else {
  	  		ev.keyCode = 100;
  	  		onKeyPress(ev);
	  		}
  }

  var onTouchEnd = function(ev) {
  	ev.preventDefault();
  	onKeyUp(ev);
  }

  var onContinue = function(ev) {
  	console.log('in onContinue');
		if(document.getElementById('game-title'))screenOverlay.removeChild(gameTitle);
		if(document.getElementById('screen-overlay'))canvasContainer.removeChild(screenOverlay);
		if(document.getElementById('game-subtitle'))canvasContainer.removeChild(gameSubtitle);
		if(document.getElementById('btn-continue'))canvasContainer.removeChild(btnContinue);
		 
      if(GAMESTATE == STATE.START)that.game();
      if(GAMESTATE == STATE.OVER){
      	reset();
      	GAMESTATE = STATE.START;
      	changeState();
      }

      if(PAUSE){
      		backgroundAudio.play();
	        gameLoop = window.requestAnimationFrame(that.game);
	        document.addEventListener('keypress', onKeyPress);
	        document.addEventListener('keyup', onKeyUp);
	        PAUSE = !PAUSE;
	      }  
  }

  var onPause = function(ev) {
  	ev.keyCode = KEY.ESC;
  	onKeyDown(ev);
  }
}