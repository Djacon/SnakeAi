class Block { // Создаем класс клетки

	constructor(x, y) { // Инициализируем координаты клетки на поле
		this.x = x;
		this.y = y;
	}

	draw(color) { // Прорисовка блока
		ctx.fillStyle = color;
		ctx.fillRect(this.x * blockSize, this.y * blockSize, blockSize - 2, blockSize - 2);
	}

	equal(other_x, other_y) { // Сравнение координат с входными
		return this.x == other_x && this.y == other_y;
	}

	equalBlock(other) {
		return this.x == other.x && this.y == other.y;
	}

	add(other) {
		this.x += other.x;
		this.y += other.y;
	}
}

class Apple extends Block { // Создаем класс яблока (еды)
	
	constructor() { // Инициализируем цвет и кординаты яблока
		var ax, ay;
		do {
			ax = Math.floor(Math.random() * blockSize);
			ay = Math.floor(Math.random() * blockSize);
		} while(in_array(busyBlocks, ax, ay));

		busyBlocks.push(new Block(ax, ay));
		super(ax, ay);
	}

	move() {
		updateBusyBlocks();
		var ax, ay;
		do {
			var ax = Math.floor(Math.random() * blockSize);
			var ay = Math.floor(Math.random() * blockSize);
		} while (in_array(busyBlocks, ax, ay));

		this.x = ax;
		this.y = ay;
	}
}

class Food {

	constructor(count) {
		this.apples = [];

		for (let i = 0; i < count; i++) {
			this.apples.push(new Apple());
		}
	}

	update() {
		this.apples.forEach((apple) => {
			apple.draw('Red');
		})
	}

	move(pointer) {
		this.apples[pointer].move();
	}
}

class Snake  { // Создаем класс Змейки

	constructor() {
		var px, py;
		do {
			px = Math.floor(Math.random() * (blockSize - 2))
			py = Math.floor(Math.random() * (blockSize - 2) + 1)
		} while (in_array(busyBlocks, px, py));

		this.x = px;
		this.y = py;

		busyBlocks.push(new Block(px, py));

		this.trail = []; // Хвост змеи
		this.tail = 5; // Размер тела змейки

		this.foodPointer = 0;

		this.score = 1; // Твой счет

		this.color = "White";
		
		this.vision = Array(24); // Вид змейки на 3 клетки в каждую сторону

		this.dead = false; // Проверка на смерть

		this.direction = 'Right'; // Нынешняя директория
		this.nextDirection = 'Right'; // Следующая директория
	}

	update() {
		if (!this.dead) {
			this.look();
			this.move();
		}
		this.draw();
	}

	move() {
		this.direction = this.nextDirection // Производим ход

		// Сделать ход
		if (this.direction == 'Right') 		{ this.x += 1; } 
		else if (this.direction == 'Left')  { this.x += -1; }
		else if (this.direction == 'Down')  { this.y += 1; }
		else if (this.direction == 'Up')    { this.y += -1; }

		let head = new Block(this.x, this.y); // Инициализируем голову

		if (this.checkCollision(head)) { // Проверяем на столкновение
			this.dead = true;
			return
		}

		if (this.checkEat(head)) { // Если змейка съела яблоко
			this.eat(head);
		}

		this.trail.push(head); // Добавляем новую часть тела

		if (this.trail.length > this.tail) { // Удаляем ненужные части тела
			this.trail.shift();
		}
	}

	eat() { // Что происходит при съедении яблока?
		this.tail++; // Увеличиваем хвост
		this.score++; // Увеличиваем на одно очко

		food.move(this.foodPointer);
	}

	draw() { // Рисуем змейку
		this.trail.forEach((item) => {
			item.draw(this.color);
		})
	}

	checkCollision(head) { // Проверка на столковение
		let selfCollision = false;

		this.trail.forEach((item) => {
			if (item.equalBlock(head)) { // Если голова столкнулась с телом
				selfCollision = true
			}
		})

		return selfCollision || this.checkBorder(head);
	}

	checkBorder(head) {
		return head.x < 0 || head.x > blockSize - 1 || head.y < 0 || head.y > blockSize - 1;
	}

	checkEat(head) { // Проверка на столкновение с яблоком
		for (let i = 0; i < food.apples.length; i++) {
			if (food.apples[i].equalBlock(head)) {
				this.foodPointer = i;
				return true;
			}
		}
		return false;
	}

	look() { // Сохраняем результаты наблюдения
		let tempValues = this.lookInDirection(new Block(-1, 0)); // Лево

		this.vision[0] = tempValues[0];
		this.vision[1] = tempValues[1];
		this.vision[2] = tempValues[2];
		
		tempValues = this.lookInDirection(new Block(-1, -1)); // Лево-Вверх

		this.vision[3] = tempValues[0];
		this.vision[4] = tempValues[1];
		this.vision[5] = tempValues[2];
		
		tempValues = this.lookInDirection(new Block(0, -1)); // Вверх

		this.vision[6] = tempValues[0];
		this.vision[7] = tempValues[1];
		this.vision[8] = tempValues[2];
		
		tempValues = this.lookInDirection(new Block(1, -1)); // Право-Вверх

		this.vision[9] = tempValues[0];
		this.vision[10] = tempValues[1];
		this.vision[11] = tempValues[2];
		
		tempValues = this.lookInDirection(new Block(1, 0)); // Право

		this.vision[12] = tempValues[0];
		this.vision[13] = tempValues[1];
		this.vision[14] = tempValues[2];
		
		tempValues = this.lookInDirection(new Block(1, 1)); // Право-Вниз

		this.vision[15] = tempValues[0];
		this.vision[16] = tempValues[1];
		this.vision[17] = tempValues[2];

		tempValues = this.lookInDirection(new Block(0, 1)); // Вниз

		this.vision[18] = tempValues[0];
		this.vision[19] = tempValues[1];
		this.vision[20] = tempValues[2];

		tempValues = this.lookInDirection(new Block(-1, 1)); // Лево-Вниз

		this.vision[21] = tempValues[0];
		this.vision[22] = tempValues[1];
		this.vision[23] = tempValues[2];
	}

	lookInDirection(direction) { // Возвращает массив с результатом о местоположении еды, хвоста и растояния до стенки в определенной директории
		let visionInDirection = Array(3); // Массив с ответом

		let pos = new Block(this.x, this.y, 'Yellow'); // Позиция блока относительно поля

		let foodIsFound = false; // Была ли задета блоком еда
		let tailIsFound = false; // Был ли задет блоком хвост

		pos.add(direction); // Добавляем смещение позиции от начальной
		let distance = 1; // Расстояние от головы змейки

		while (!this.checkBorder(pos)) { // Введем цикл пока не врежимся в стенку

			if (!foodIsFound && pos.equalBlock(food.apples)) { // Если встретили еду
				visionInDirection[0] = 1; // Сохраняем тот факт, что еда есть в поле зрения
				foodIsFound = true;
			}
			
			if (!tailIsFound && in_array(this.trail, pos.x, pos.y)) { // Если уткнулись в хвост
				visionInDirection[1] = 1 / distance; // Сохраняем расстояние до хвоста
				tailIsFound = true;
			}
			// pos.draw();

			pos.add(direction);
			distance += 1; // Добавляем еще расстояния от начальной позиции
		}

		visionInDirection[2] = 1 / distance; // Сохраняем растояние до стенки

		return visionInDirection;
	}

	setDirection(newDirection) { // Установка новой директории
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
}

class Snakes {

	constructor(count) {
		this.snakes = [];

		for (let i = 0; i < count; i++) {
			this.snakes.push(new Snake());
		}

		this.snakeID = 0;
		this.snakes[0].color = "Yellow";
	}

	update() {
		this.snakes.forEach((snake) => {
			snake.update();
		})
	}

	nextUserSnake() {
		this.snakes[this.snakeID].color = 'White';
		this.snakeID = (this.snakeID + 1) % this.snakes.length;
		this.snakes[this.snakeID].color = 'Yellow';
	}

	dead() {
		for (let snake of this.snakes) {
			if (!snake.dead) {
				return false;
			}
		}
		return true;
	}

	get userSnake() {
		return this.snakes[this.snakeID];
	}
}

const size = window.innerHeight > window.innerWidth ? Math.floor(Math.sqrt(window.innerWidth)) : Math.floor(Math.sqrt(window.innerHeight))-1;
const blockSize = size; // Количество блоков на поле
let FPS = 10; // FPS

let busyBlocks = []; // Список с занятыми блоками

let snakes, food;

let posx, posy;

restart(); // Начинаем игру, ну и перезапускает естественно

// Инициализировать окно
let canvas = document.getElementById('game'); // Сохраняем игровое поле в переменной
let ctx = canvas.getContext('2d'); // Создаем переменную для работы с объектами

canvas.width = canvas.height = blockSize * blockSize;

document.addEventListener('touchend', screenPush);
document.addEventListener('touchstart', screenPush);
document.addEventListener('keydown', keyPush); // Создаем прослушку нажатия кнопок на клавиатуре
let GameID = setInterval(game, 1000/FPS); // Вызываем игровую функцию с задержкой в 1000/FPS миллисекунд

function game() { // Рисуем игровое поле
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height); // Рисуем фон

	// Выводим текст
	ctx.fillStyle = 'White';
	ctx.font = '20px Comic Sans MS';
	ctx.textBaseline = 'top';
	ctx.fillText(`Змейка №${snakes.snakeID+1}`, blockSize, blockSize);
	ctx.fillText(`Счет: ${snakes.userSnake.score}`, blockSize, blockSize * 2);

	ctx.fillText(`Нажмите 'R' для Рестарта`, blockSize * (blockSize-10), blockSize * (blockSize-4) );
	ctx.fillText(`Нажмите 'Enter' чтобы переключиться`, blockSize * (blockSize-15), blockSize * (blockSize-2) );

	snakes.update(); // Обновляем змейки на экране
	food.update(); // Обновляем еду на экране
}

function restart() { // Функция для запуска и перезапуска игры
	snakes = new Snakes(3); // Инициализируем змеек
	food = new Food(28); // Инициализируем еду
}

function in_array(arr, x, y) { // Проверяем наличие блока в других блоках
	for (let item of arr) {
		if (item.equal(x, y)) {
			return true
		}
	}
	return false
}

function updateBusyBlocks() { // Изменяем список с занятыми блоками
	busyBlocks = [];

	snakes.snakes.forEach((snake) => {
		snake.trail.forEach((block) => {
			busyBlocks.push(new Block(block.x, block.y));
		})
	})

	food.apples.forEach((apple) => {
		busyBlocks.push(new Block(apple.x, apple.y));
	})
}

function setDirection(direction) {
	snakes.userSnake.setDirection(direction);
}

function screenPush(e) {
	let event = e.changedTouches[0];
	if (event.force) {
		posx = event.screenX;
		posy = event.screenY;
	}
	else {
		posx = event.screenX - posx;
		posy = event.screenY - posy;

		console.log(posx, posy)

		if (Math.abs(posx) > Math.abs(posy)) {
			if (posx > 0) {
				setDirection('Right');
			} else if (posx < 0) {
				setDirection('Left')
			}
		} else {
			if (posy > 0) {
				setDirection('Down');
			} else if (posy < 0) {
				setDirection('Up');
			} else {
				snakes.nextUserSnake();
			}
		}
	}
}

function keyPush(event) { // Key test
	switch (event.keyCode) {
		case 37: case 65: setDirection('Left'); break; // Влево
		case 38: case 87: setDirection('Up'); break; // Вверх
		case 39: case 68: setDirection('Right'); break; // Вправо
		case 40: case 83: setDirection('Down'); break; // Вниз
		case 13: snakes.nextUserSnake(); break; // Переключится на другую змейку
		case 82: restart(); // Рестарт игры
	}
}