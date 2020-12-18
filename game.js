// Init canvas
canvas = document.getElementById('game');
ctx = canvas.getContext('2d');

// document.addEventListener('keydown', keyPush)
setInterval(game, 1000/30)

var blockSize = 27; // Canvas block-size

function DrawBoard() {

	// Draw background
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Show text
	ctx.fillStyle = 'white';
	ctx.font = '20px Comic Sans MS';
	ctx.textBaseline = 'top';
	ctx.fillText(`Счет: ${snakes[0].point}\t\t\tЛучший счет: ${snakes[0].bestpoint}`, blockSize, blockSize);
}

function Block(x, y) { // Create mini-class Block
	this.x = x
	this.y = y
}

Block.prototype.draw = function(color) { // Draw block
	ctx.fillStyle = color;
	ctx.fillRect(this.x * blockSize, this.y * blockSize, blockSize - 2, blockSize - 2);
}

Block.prototype.equal = function(other_x, other_y) {
	return this.x == other_x && this.y == other_y;
}

function Apple(color) {
	let x = Math.floor(Math.random() * blockSize);
	let y = Math.floor(Math.random() * blockSize);

	this.position = new Block(x, y)
	this.color = color
}

Apple.prototype.draw = function() {
	this.position.draw(this.color)
}

Apple.prototype.move = function(trail) { // Move apple
	is_finish = false

	while (!is_finish) {
		var ax = Math.floor(Math.random() * blockSize)
		var ay = Math.floor(Math.random() * blockSize)

		for (let i = 0; i < trail.length; i++) {
			if (trail[i].equal(ax, ay)) {
				is_finish = false;
				break;
			} else {
				is_finish = true;
			}
		}
	}
	this.position = new Block(ax, ay);
}

class Snake {
	constructor(color) {
		this.px = Math.floor(Math.random() * blockSize); // Snake coordinates OX
		this.py = Math.floor(Math.random() * blockSize); // Snale coordinates OY

		this.xv = 1; // Snake directory (left-up-right-down) (X-vector)
		this.yv = 0; // Snake directory (left-up-right-down) (Y-vector)

		this.trail = []; // Хвост змеи
		this.tail = 5; // Size of trail

		this.point = 0; // Your points
		this.bestpoint = 0; // Your best result

		this.color = color

		this.direction = 'Right';
		this.nextDirection = 'Right';
	}

	move() {
		this.direction = this.nextDirection

		if (this.direction == 'Right') { this.px += 1; }
		if (this.direction == 'Left')  { this.px += -1; }
		if (this.direction == 'Down')  { this.py += 1; }
		if (this.direction == 'Up')    { this.py += -1; }

		// Teleportaion snake to other side
		if (this.px < 0) 	 		 this.px = blockSize - 1;
		if (this.px > blockSize - 1) this.px = 0;
		if (this.py < 0) 	 		 this.py = blockSize - 1;
		if (this.py > blockSize - 1) this.py = 0
	}

	draw() {
		// Draw snake
		this.trail.forEach((item) => {
			item.draw(this.color);

			if (item.equal(this.px, this.py)) { // If die
				this.point = 0
				this.tail = 5;
			}
		})

		this.trail.push(new Block(this.px, this.py));
	
		while(this.trail.length > this.tail) {
			this.trail.shift();
		}

		var head = this.trail[this.trail.length-1];

		// If snake eat apple
		apples.forEach((apple)=> {
			if (head.equal(apple.position.x, apple.position.y)) {
				this.tail++;
				this.point++;

				if (this.point > this.bestpoint) { 
					this.bestpoint = this.point;
				}

				apple.move(this.trail)
			}
		})
		
	}

	setDirection(newDirection) {

		let values = {
			'Up' : 'Down',
			'Down': 'Up',
			'Left': 'Right',
			'Right': 'Left'
		}

		if (this.direction != values[newDirection]) {
			this.nextDirection = newDirection
		}
	}

	ai() {
		let head = this.trail[this.trail.length-1];
		let pos = [];
		let total = 1000;
		let i = 0;

		apples.forEach((apple) => {
			pos.push({x: head.x - apple.position.x, y: head.y - apple.position.y});
		})

		pos.forEach((p, index) => {
			if (p.x - p.y < total) {
				total = p.x - p.y;
				i = index
			}
		})

		if (pos[i].x > 0) 	   { this.setDirection('Left'); }
		else if (pos[i].y > 0) { this.setDirection('Up'); }
		else if (pos[i].x < 0) { this.setDirection('Right'); }  
		else if (pos[i].y < 0) { this.setDirection('Down'); }
	}
}

snakes = [];
apples = [];

for (i of [...Array(3)]) {
	snakes.push(new Snake('white'));
}

for (i of [...Array(25)]) {
	apples.push(new Apple('red'))
}

function game() { // All game function

	DrawBoard();

	snakes.forEach((snake)=> {
		snake.move();
		snake.draw();
		snake.ai() // Псевдо ИИ (Максимально тупой алгоритм)
	})

	apples.forEach((apple)=> {
		apple.draw()
	})
}

// Key test
function keyPush(event) {
	switch (event.keyCode) {
		case 37: case 65: snakes[0].setDirection('Left'); break;
		case 38: case 87: snakes[0].setDirection('Up'); break;
		case 39: case 68: snakes[0].setDirection('Right'); break;
		case 40: case 83: snakes[0].setDirection('Down'); break;
	}
}

class NeuronNetwork {
	constructor() {

	}

	sigmoid(x) {
		return 1 / (1 + Math.E ** -x)
	}

	forward(inputs, w, b) {
		for (let i = 0; i < inputs.length; i++) {
			b += inputs[i] * w[i];
		}
		return b
	}

}