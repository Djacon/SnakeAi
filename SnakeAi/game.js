class Block { // Создаем класс клетки

	constructor(x, y) { // Инициализируем координаты клетки на поле
		this.x = x;
		this.y = y;
	}

	draw(color) { // Прорисовка блока
		ctx.fillStyle = color;
		ctx.fillRect(this.x * size, this.y * size, size-2, size-2); // blockSizeX - 2
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
			ax = Math.floor(Math.random() * blockSizeX);
			ay = Math.floor(Math.random() * blockSizeY);
		} while(in_array(busyBlocks, ax, ay));

		busyBlocks.push(new Block(ax, ay));
		super(ax, ay);

		this.dead = false; // Проверяем, стало ли лишним яблоко
	}

	move() { // Перемещение яблока в другое место
		var ax, ay;
		do {
			var ax = Math.floor(Math.random() * blockSizeX);
			var ay = Math.floor(Math.random() * blockSizeY);
		} while (in_array(busyBlocks, ax, ay));

		this.x = ax;
		this.y = ay;
	}
}

class Snake  { // Создаем класс Змейки

	constructor() {
		var px, py;
		do {
			px = Math.floor(Math.random() * (blockSizeX - 2))
			py = Math.floor(Math.random() * (blockSizeY - 2) + 1)
		} while (in_array(busyBlocks, px, py));

		this.x = px;
		this.y = py;

		busyBlocks.push(new Block(px, py));

		this.trail = []; // Хвост змеи
		this.tail = 3; // Размер тела змейки

		this.foodPointer = 0;

		this.score = 1; // Твой счет

		this.color = 'White';
		
		this.vision = Array(24); // Вид змейки на 3 клетки в каждую сторону

		this.dead = false; // Проверка на смерть

		this.direction = 'Right'; // Нынешняя директория
		this.nextDirection = 'Right'; // Следующая директория
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
			dieVoice.play();
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
		eatVoice.play();
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
		return head.x < 0 || head.x > blockSizeX - 1 || head.y < 0 || head.y > blockSizeY - 1;
	}

	checkEat(head) { // Проверка на столкновение с яблоком
		for (let i = 0; i < food.apples.length; i++) {
			if (!food.apples[i].dead && food.apples[i].equalBlock(head)) {
				this.foodPointer = i;
				return true;
			}
		}
		return false;
	}

	look() { // Сохраняем результаты наблюдения
		let tempValues = Array(8);

		tempValues[0] = this.lookInDirection(new Block(-1, 0)); // Лево
		tempValues[1] = this.lookInDirection(new Block(-1, -1)); // Лево-Вверх
		tempValues[2] = this.lookInDirection(new Block(0, -1)); // Вверх
		tempValues[3] = this.lookInDirection(new Block(1, -1)); // Право-Вверх
		tempValues[4] = this.lookInDirection(new Block(1, 0)); // Право
		tempValues[5] = this.lookInDirection(new Block(1, 1)); // Право-Вниз
		tempValues[6] = this.lookInDirection(new Block(0, 1)); // Вниз
		tempValues[7] = this.lookInDirection(new Block(-1, 1)); // Лево-Вниз

		for (let i = 0; i < 24; i++){
			this.vision[i] = tempValues[i/3-i%3][i%3];
		}
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

class Food {

	constructor(count) {
		this.apples = Array(count); // Массив с яблоками
	}

	update() {
		this.apples.forEach((apple) => {
			if (!apple.dead) {
				apple.draw('Red');
			}
		})
	}

	rebuilt() {
		for (let i = 0; i < this.apples.length; i++) {
			this.apples[i] = new Apple();
		}
	}

	move(pointer) {
		updateBusyBlocks(); // Обновляем занятые книги
		if (busyBlocks.length < blockSizeX * blockSizeY) {
			this.apples[pointer].move();
		} else {
			this.apples[pointer].dead = true;
		}
	}
}

class Snakes {

	constructor(count) {
		this.snakes = Array(count);
	}

	update() {
		this.snakes.forEach((snake, i) => {
			if (!snake.dead) {
				// snake.look(); // Он пока не нужен)
				snake.move();
				snake.draw();
			} else if (this.snakeID == i) {
				this.nextUserSnake();
			}
		})
	}

	rebuilt() {
		for (let i = 0; i < this.snakes.length; i++) {
			this.snakes[i] = new Snake();
		}

		this.snakeID = 0;
		this.snakes[0].color = 'Yellow';
	}

	nextUserSnake() {
		if (!this.dead) {
			this.snakes[this.snakeID].color = 'White';
			do {
				this.snakeID = (this.snakeID + 1) % this.snakes.length;
			} while (this.snakes[this.snakeID].dead);
			
			this.snakes[this.snakeID].color = 'Yellow';
		}
		
	}

	get dead() {
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

function game() { // Рисуем игровое поле
	ctx.fillStyle = 'Black';
	ctx.fillRect(0, 0, canvas.width, canvas.height); // Рисуем фон

	ctx.fillStyle = 'White';
	ctx.font = '50px Helvetica';
	ctx.textBaseline = 'top';
	ctx.textAlign = 'left';

	if (screenSize != window.innerWidth) {
		setScreenSize()
	}

	if (snakes.dead) { // Если все змейки проиграли
		gameover();
		return
	}

	snakes.update(); // Обновляем змейки на экране
	food.update(); // Обновляем еду на экране

	// Выводим текст
	ctx.fillStyle = 'White';
	ctx.fillText(`Змейка №${snakes.snakeID+1}`, blockSizeX, blockSizeY / 2);
	ctx.fillText(`Счет: ${snakes.userSnake.score}`, blockSizeX, blockSizeY / 2 + 60);
}

function gameover() { // Конец игры
	isEnd = true;
	ctx.font = '80px Helvetica';
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';

	ctx.fillText('Игра окончена', canvas.width / 2, canvas.height / 2 - 50 );
	ctx.font = '40px Helvetica';

	if (snakes.userSnake.score > globalBestScore) {
		globalBestScore = snakes.userSnake.score;

		ctx.fillStyle = 'Yellow';
		ctx.fillText(`НОВЫЙ РЕКОРД! Ваш счет: ${snakes.userSnake.score} Лучший счет: ${globalBestScore}`, canvas.width / 2, canvas.height / 2 + 40 );
	} else {
		ctx.fillText(`Ваш счет: ${snakes.userSnake.score} Лучший счет: ${globalBestScore}`, canvas.width / 2, canvas.height / 2 + 40 );
	}

	ctx.fillStyle = 'White';
	if (is_mobile) {
		ctx.fillText('Нажмите на экран чтобы продолжить', canvas.width / 2, canvas.height / 2 + 90 );
	} else {
		ctx.fillText('Нажмите на пробел чтобы продолжить', canvas.width / 2, canvas.height / 2 + 90 );
	}
	clearInterval(GameID);
}

function start() { // Начало игры
	ctx.fillStyle = 'Black';
	ctx.fillRect(0, 0, canvas.width, canvas.height); // Рисуем фон

	ctx.fillStyle = 'LimeGreen';
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';
	ctx.font = '80px Helvetica';

	ctx.fillText(`Змейка`, canvas.width / 2, window.innerHeight / 2 - 50 );
	ctx.font = '40px Helvetica';
	if (is_mobile) {
		ctx.fillText(`Нажмите на экран чтобы начать`, canvas.width / 2, canvas.height / 2 + 50 );
	} else {
		ctx.fillText(`Нажмите на пробел чтобы начать`, canvas.width / 2, canvas.height / 2 + 50 );
	}
}

function restart() { // Функция для запуска и перезапуска игры
	if (isEnd) {
		isEnd = false;

		snakes.rebuilt(); // Инициализируем змеек
		food.rebuilt(); // Инициализируем еду

		GameID = setInterval(game, 1000/FPS); // Вызываем игровую функцию с задержкой в 1000/FPS миллисекунд
	}
}

function init() {

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

	snakes.snakes.forEach((snake) => { // Перебираем каждый блок каждой змейки
		if (!snake.dead) {
			snake.trail.forEach((block) => {
				busyBlocks.push(new Block(block.x, block.y));
			})
		}
	})

	food.apples.forEach((apple) => { // Перебираем каждое яблочко
		if (!apple.dead) {
			busyBlocks.push(new Block(apple.x, apple.y));
		}
	})
}

function setDirection(direction) { // Установка директории управляемой змейки
	if (!isEnd) {
		snakes.userSnake.setDirection(direction);
	}
}

function setScreenSize() { // Установить игровой размер
	screenSize = window.innerWidth;

	blockSizeX = Math.floor(window.innerWidth / size);
	blockSizeY = Math.floor(window.innerHeight / size); // Количество блоков на поле

	// Ставим размер холста относительно окна
	canvas.width  = blockSizeX * size;
	canvas.height = blockSizeY * size;
	canvas.style.setProperty('left', (window.innerWidth - canvas.width)/2 + 'px');
	canvas.style.setProperty('top', (window.innerHeight - canvas.height)/2 + 'px');
}

function screenPush(e) { // Управление змейкой на мобильном устройстве
	let event = e.changedTouches[0];
	if (e.type == 'touchstart') {
		posx = event.screenX;
		posy = event.screenY;
		fPosx = posx;
		fPosy = posy;
		return
	}
	if (e.type == 'touchend') {
		if (Math.abs(event.screenX - fPosx) <= 10 && Math.abs(event.screenY - fPosy) <= 10) { 
			if (isEnd) {
				restart();
			} else {
				snakes.nextUserSnake();
			}	
		}
		return
	}

	let _posx = event.screenX - posx;
	let _posy = event.screenY - posy;

	posx = event.screenX;
	posy = event.screenY;

	if (Math.abs(_posx) > Math.abs(_posy)) {
		if (_posx >= 5) {
			setDirection('Right');
		} else if (_posx <= -5) {
			setDirection('Left')
		}
	} else {
		if (_posy >= 5) {
			setDirection('Down');
		} else if (_posy <= -5) {
			setDirection('Up');
		}
	}
}

function keyPush(event) { // Управление змейкой на пк
	switch (event.keyCode) {
		case 37: case 65: setDirection('Left'); break; // Влево
		case 38: case 87: setDirection('Up'); break; // Вверх
		case 39: case 68: setDirection('Right'); break; // Вправо
		case 40: case 83: setDirection('Down'); break; // Вниз
		case 13: snakes.nextUserSnake(); break; // Переключится на другую змейку
		case 32: restart(); break; // Рестарт игры
	}
}

const size = 40; // Размер блока
let blockSizeX, blockSizeY; // Количество блоков в ширину и в высоту

let screenSize;
let globalBestScore = 0;
let FPS = 10; // FPS

let busyBlocks = []; // Список с занятыми блоками
let isEnd = true;

let eatVoice = new Audio();
let dieVoice = new Audio();
let gameoverVoice = new Audio();

eatVoice.src = 'Audio/eat.mp3';
dieVoice.src = 'Audio/die.mp3';
gameoverVoice.src = 'Audio/gameover.mp3';

// Инициализировать окно
let canvas = document.getElementById('game'); // Сохраняем игровое поле в переменной
let ctx = canvas.getContext('2d'); // Создаем переменную для работы с объектами

let is_mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent); // Проверяем является ли это устройство мобильным
let GameID;

setScreenSize(); // Устанавливаем размер поля под размер экрана
start(); // Стартовое меню

if (is_mobile) {
	let posx, posy; // Инициализируем координаты мышки на экране
	let fPosx, fPosy; // Инициализируем координаты мышки для того, чтобы понять сделал ли пользователь клик

	document.addEventListener('touchmove', screenPush); // Следим за зажатым пальцем
	document.addEventListener('touchend', screenPush); // Следим за разжатым пальцем
	document.addEventListener('touchstart', screenPush); // Следим за перемещение пальца
} else {
	document.addEventListener('keydown', keyPush); // Создаем прослушку нажатия кнопок на клавиатуре
}

let snakes = new Snakes(3);
let food = new Food(28); // Инициализируем змеек и еду