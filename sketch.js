/*

P5 Game Project
*/

 //This is game to run in chrome browser, build with P5 Javascript library 
 // To run the game, just drag the sktech.js in chrome browser
 // I also a added a DEMO video file for the gameplay
/*

The game has some extensions :-
The sound extension:-
. Handling different types of sounds was tricky to place them in the right places
. The background music was the most challenging part, as I didn't know about the loaded function in the videos. I had to do extra research to be able to do it. 
. I got some sounds from freesound.org and added them all to the assets folder

For the enemies section:-
. It was a bit challenging to handle the lives and the game score
. I also added a hit enemy sound


*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees_x;
var mountains;
var clouds;

var collectables;

var canyons;

var game_score;
var flagpole;
var lives;
var livesTriangles;

var jumpSound;
var fallInCanyonSound;
var collectableSound;
var flagpoleSound;
var gameoverSound;
var hitenemySound;
var jungleSound;

var platforms;

var enemies;

// Preload the Sounds
function preload() {
	soundFormats('mp3', 'wav');

	// load your sounds here
	jumpSound = loadSound('assets/jump.wav');
	jumpSound.setVolume(0.1);

	// Got these from freesound.org
	fallInCanyonSound = loadSound('assets/fallincanyon.wav');
	fallInCanyonSound.setVolume(0.1);

	collectableSound = loadSound('assets/Collectable.wav');
	collectableSound.setVolume(0.1);

	hitenemySound = loadSound('assets/hitenemy.wav');
	hitenemySound.setVolume(0.1);

	flagpoleSound = loadSound('assets/flagpole.wav');
	flagpoleSound.setVolume(0.1);

	gameoverSound = loadSound('assets/gameover.wav');
	gameoverSound.setVolume(0.1);

	jungleSound = loadSound('assets/jungle.wav', loaded);
	jungleSound.setVolume(0.1);

}

// This function to loop the background music once it is loaded
function loaded() {
	jungleSound.loop();
}


// Setup Function
function setup() {
	createCanvas(1024, 576);
	floorPos_y = height * 3 / 4;
	lives = 3;
	game_score = 0;
	startGame();
}

// Draw function

function draw() {
	// fill the sky blue
	background(100, 155, 255);

	noStroke();
	fill(0, 155, 0);
	// draw some green ground
	rect(0, floorPos_y, width, height / 4);

	// Begin Translate here
	push();
	translate(scrollPos, 0);

	// Draw clouds.
	drawClouds();

	// Draw mountains.
	drawMountains();

	// Draw trees.
	drawTrees();

	// Draw platforms
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].draw();
	}

	// Draw canyons.
	for (var c = 0; c < canyons.length; c++) {
		drawCanyons(canyons[c]);
		checkCanyon(canyons[c]);
	}

	// Draw collectable items.
	for (var i = 0; i < collectables.length; i++) {
		if (collectables[i].isFound == false) {
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
	}

	// The flagpole
	renderFlagpole();

	// The enemies
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].draw();

		var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);

		if (isContact == true) {
			lives -= 1;
			hitenemySound.play();

			if (lives < 1) {
				gameoverSound.play();
				jungleSound.stop();
				for (var e = 0; i < enemies.length; i++) {
					enemies[i].range = 0;
				}
				lives = 0;
				return;
			}
			else {
				startGame();
				break;
			}
		}
	}

	//EndTranslate here
	pop();

	// Draw game character.

	drawGameChar();

	fill(255);
	noStroke();
	text("score: " + game_score, 20, 20);

	fill(255);
	noStroke();
	text("Lives: " + lives, 80, 20);

	// Drawing Lives tokens
	drawLives(lives);

	checkPlayerDie();

	//Game Over
	if (lives < 1) {
		fill(255, 0, 0);
		textSize(32);

		text("GAME OVER. Press space to continue", gameChar_x, height / 2);
		textSize(12);
		fill(255);
		text("Lives: " + lives, 80, 20);
		text("score: " + game_score, 20, 20);
		return;
	}

	// Level Complete
	if (flagpole.isReached == true) {
		fill(255);
		textSize(22);
		text("Level Complete. Press space to continue.", width / 2, height / 2);
		textSize(12);
		fill(255);
		text("Lives: " + lives, 80, 20);
		text("score: " + game_score, 20, 20);
		return;
	}

	// Logic to make the game character move or the background scroll.
	if (isLeft) {
		if (gameChar_x > width * 0.2) {
			gameChar_x -= 5;
		}
		else {
			scrollPos += 5;
		}
	}

	if (isRight) {
		if (gameChar_x < width * 0.8) {
			gameChar_x += 5;
		}
		else {
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
	if (gameChar_y < floorPos_y) {

		var isContact = false;

		for (var i = 0; i < platforms.length; i++) {
			if (platforms[i].checkContact(gameChar_world_x, gameChar_y) == true) {
				isContact = true;
				break;
			}
		}

		if (isContact == false) {
			gameChar_y += 2;
			isFalling = true;
		}
	}
	else {
		isFalling = false;
	}

	if (flagpole.isReached == false) {
		checkFlagpole();
	}

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed() {

	// Left arrow or A
	if (key == 'A' || keyCode == 37) {
		isLeft = true;

	}

	// Right arrow or D
	if (key == 'D' || keyCode == 39) {
		isRight = true;
	}

	else if (keyCode == 32 && gameChar_y == floorPos_y) {
		gameChar_y -= 100;

		// Play jumpsound
		jumpSound.play();
	}
}

function keyReleased() {
	if (key == 'A' || keyCode == 37) {
		isLeft = false;
	}

	if (key == 'D' || keyCode == 39) {
		isRight = false;
	}
}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar() {
	// draw game character
	strokeWeight(0);
	stroke(0, 0, 0);

	// Full plot of game character
	if (isLeft && isFalling) {
		// jumping-left code
		fill(0);
		ellipse(gameChar_x - 7, gameChar_y - 10, 5, 5);

		fill(200, 150, 150);
		ellipse(gameChar_x - 5, gameChar_y - 55, 35);

		fill(255, 0, 0);
		rect(gameChar_x - 10, gameChar_y - 40, 16, 30);

		fill(0);
		rect(gameChar_x - 20, gameChar_y - 15, 10, 10);
		rect(gameChar_x - 4, gameChar_y - 15, 10, 10);
	}

	else if (isRight && isFalling) {
		// jumping-right code
		fill(0);
		ellipse(gameChar_x + 7.5, gameChar_y - 10, 5, 5);

		fill(200, 150, 150);
		ellipse(gameChar_x + 5, gameChar_y - 55, 35);

		fill(255, 0, 0);
		rect(gameChar_x - 5, gameChar_y - 40, 16, 30);

		fill(0);
		rect(gameChar_x + 10, gameChar_y - 15, 10, 10);
		rect(gameChar_x - 5, gameChar_y - 15, 10, 10);
	}

	else if (isLeft) {
		// walking left code
		fill(0);
		ellipse(gameChar_x - 7, gameChar_y, 5, 5);

		fill(200, 150, 150);
		ellipse(gameChar_x - 5, gameChar_y - 50, 35);

		fill(255, 0, 0);
		rect(gameChar_x - 10, gameChar_y - 35, 16, 30);

		fill(0);
		rect(gameChar_x - 20, gameChar_y - 5, 10, 10);
		rect(gameChar_x - 4, gameChar_y - 5, 10, 10);
	}

	else if (isRight) {
		// walking right code
		fill(0);
		ellipse(gameChar_x + 7.5, gameChar_y, 5, 5);

		fill(200, 150, 150);
		ellipse(gameChar_x + 5, gameChar_y - 50, 35);

		fill(255, 0, 0);
		rect(gameChar_x - 5, gameChar_y - 35, 16, 30);

		fill(0);
		rect(gameChar_x + 10, gameChar_y - 5, 10, 10);
		rect(gameChar_x - 5, gameChar_y - 5, 10, 10);
	}

	else if (isFalling || isPlummeting) {
		// jumping facing forwards code
		fill(0);
		ellipse(gameChar_x, gameChar_y - 10, 5, 5);

		fill(200, 150, 150);
		ellipse(gameChar_x, gameChar_y - 55, 35);

		fill(255, 0, 0);
		rect(gameChar_x - 13, gameChar_y - 40, 26, 30);

		fill(0);
		rect(gameChar_x - 15, gameChar_y - 15, 10, 10);
		rect(gameChar_x + 5, gameChar_y - 15, 10, 10);
	}

	else {
		// standing front facing code
		fill(0);
		ellipse(gameChar_x, gameChar_y, 5, 5);

		fill(200, 150, 150);
		ellipse(gameChar_x, gameChar_y - 50, 35);

		fill(255, 0, 0);
		rect(gameChar_x - 13, gameChar_y - 35, 26, 30);

		fill(0);
		rect(gameChar_x - 15, gameChar_y - 5, 10, 10);
		rect(gameChar_x + 5, gameChar_y - 5, 10, 10);
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds() {
	for (var i = 0; i < clouds.length; i++) {
		fill(255);
		ellipse(clouds[i].pos_x, clouds[i].pos_y, 55, 55);
		ellipse(clouds[i].pos_x + 25, clouds[i].pos_y, 35, 35);
		ellipse(clouds[i].pos_x + 45, clouds[i].pos_y, 25, 25);
	}
}

// Function to draw mountains objects.
function drawMountains() {
	for (var i = 0; i < mountains.length; i++) {
		fill(128, 128, 128);
		triangle(mountains[i].m1 - 130, 200, mountains[i].m1 - 200, 432, mountains[i].m1 - 90, 432);
		triangle(mountains[i].m2 - 50, 200, mountains[i].m2, 432, mountains[i].m2 - 210, 432);
	}
}

// Function to draw trees objects.
function drawTrees() {
	for (var i = 0; i < trees_x.length; i++) {
		fill(100, 50, 0);
		rect(75 + trees_x[i], -200 / 2 + floorPos_y, 50, 200 / 2);
		fill(0, 100, 0);
		triangle(trees_x[i] + 25, -200 / 2 + floorPos_y,
			trees_x[i] + 100, -200 + floorPos_y,
			trees_x[i] + 175, -200 / 2 + floorPos_y);
		triangle(trees_x[i], -200 / 4 + floorPos_y,
			trees_x[i] + 100, -200 * 3 / 4 + floorPos_y,
			trees_x[i] + 200, -200 / 4 + floorPos_y);
	}
}

// Function to draw the lives triangles to track lives
function drawLives(templives) {
	strokeWeight(10);
	fill(0, 255, 0);

	for (i = 0; i < templives; i++) {
		triangle(livesTriangles[i].x1, livesTriangles[i].y1, livesTriangles[i].x2, livesTriangles[i].y2, livesTriangles[i].x3, livesTriangles[i].y3);
	}
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyons(t_canyon) {
	fill(255, 169, 50);
	beginShape();

	vertex(t_canyon.x_pos + t_canyon.width, 433);
	vertex(t_canyon.x_pos, 433);
	vertex(t_canyon.x_pos, 576);
	vertex(t_canyon.x_pos + t_canyon.width, 576);

	endShape();
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon) {

	// This detects whether the character should fall in the canyon or no 
	if (gameChar_world_x >= t_canyon.x_pos && gameChar_world_x <= (t_canyon.x_pos + t_canyon.width) && gameChar_y == floorPos_y) {
		isPlummeting = true;
	}
	else {
		isPlummeting = false;
	}

	// Character falls in the canyon
	if (isPlummeting == true) {
		gameChar_y += 150;
		gameChar_world__x = t_canyon.x_pos + 50;
		if (lives > 1) {
			fallInCanyonSound.play();
		}
		else {
			gameoverSound.play();
			jungleSound.stop();
		}
	}

	//Character is trapped in the canyon
	if (gameChar_y > floorPos_y) {
		isRight = false;
		isLeft = false;
	}
}

// ---------------------------------
// Flagpole render and check functions
// ---------------------------------

function renderFlagpole() {
	push();
	strokeWeight(5);
	stroke(180);
	line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
	fill(255, 0, 255);
	noStroke();

	if (flagpole.isReached) {
		rect(flagpole.x_pos, floorPos_y - 250, 50, 50);
	}
	else {
		rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
	}



	pop();
}

function checkFlagpole() {
	var d = abs(gameChar_world_x - flagpole.x_pos);

	if (d < 15) {
		flagpole.isReached = true;
		// Play the flagpole sound
		flagpoleSound.play();
		jungleSound.stop();
	}
}

// Check when player dies in canyon

function checkPlayerDie() {
	if (isPlummeting == true) {
		lives -= 1;

		if (lives > 0) {
			startGame();
		}
	}
}

// ----------------------------------
// Enemy items render and check functions
// ----------------------------------

function Enemy(x, y, range) {
	this.x = x;
	this.y = y;
	this.range = range;

	this.currentX = x;
	this.inc = 1;

	this.update = function () {
		this.currentX += this.inc;

		if (this.currentX >= this.x + this.range) {
			this.inc = -1;
		}

		else if (this.currentX < this.x) {
			this.inc = 1;
		}
	}

	this.draw = function () {
		this.update();
		fill(255, 0, 0);
		stroke(255, 0, 0);
		ellipse(this.currentX, this.y, 20, 20);
	}

	this.checkContact = function (gameChar_x, gameChar_y) {
		var d = dist(gameChar_x, gameChar_y, this.currentX, this.y);

		if (d < 20) {

			return true;
		}
		return false;
	}

}

// StartGame Function
function startGame() {
	gameChar_x = width / 2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
	trees_x = [100, 300, 500, 1000];

	mountains = [{ m1: 300, m2: 350 },
	{ m1: 750, m2: 800 }];

	clouds = [{ pos_x: 100, pos_y: 200 },
	{ pos_x: 600, pos_y: 100 },
	{ pos_x: 800, pos_y: 200 }];

	collectables = [{ pos_x: 80, pos_y: floorPos_y, size: 40, isFound: false },
	{ pos_x: 300, pos_y: floorPos_y, size: 40, isFound: false },
	{ pos_x: 450, pos_y: floorPos_y, size: 40, isFound: false }];

	canyons = [{ x_pos: 800, width: 100 },
	{ x_pos: 150, width: 100 }];

	platforms = [];

	platforms.push(createPLatforms(100, floorPos_y - 100, 100));
	platforms.push(createPLatforms(500, floorPos_y - 100, 200));

	flagpole = { isReached: false, x_pos: 1500 };

	livesTriangles = [
		{ x1: 150, y1: 7, x2: 140, y2: 20, x3: 160, y3: 20 },
		{ x1: 180, y1: 7, x2: 170, y2: 20, x3: 190, y3: 20 },
		{ x1: 210, y1: 7, x2: 200, y2: 20, x3: 220, y3: 20 }
	];

	enemies = [];
	enemies.push(new Enemy(100, floorPos_y - 10, 200));
	enemies.push(new Enemy(600, floorPos_y - 10, 150));
	enemies.push(new Enemy(800, floorPos_y - 10, 100));

}


// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable) {
	noFill();
	strokeWeight(6);
	stroke(220, 185, 0);
	ellipse(t_collectable.pos_x, t_collectable.pos_y - 20, t_collectable.size, t_collectable.size);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable) {
	if (dist(gameChar_world_x, gameChar_y, t_collectable.pos_x, t_collectable.pos_y) < 20) {
		t_collectable.isFound = true;
		game_score += 1;

		// Play collectables sound
		collectableSound.play();

	}
}

// ----------------------------------
// Platforms check and check functions
// ----------------------------------

function createPLatforms(x, y, length) {
	var p = {
		x: x,
		y: y,
		length: length,
		draw: function () {
			fill(255, 0, 255);
			rect(this.x, this.y, this.length, 20);
		},

		checkContact: function (gameChar_x, gameChar_y) {
			if (gameChar_x > this.x && gameChar_x < this.x + this.length) {
				var d = this.y - gameChar_y;
				if (d >= 0 && d < 5) {
					return true;
				}
			}
			return false;
		}
	}
	return p;
}
