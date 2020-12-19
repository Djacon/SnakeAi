// Init canvas
canvas = document.getElementById('game');
ctx = canvas.getContext('2d');

document.addEventListener('keydown', keyPush)
setInterval(game, 1000/60)

const blockSize = 27; // Количество блоков на поле

// Рисуем поле
function drawBoard() {
	// Рисуем фон
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Выводим текст
	ctx.fillStyle = 'white';
	ctx.font = '20px Comic Sans MS';
	ctx.textBaseline = 'top';
	ctx.fillText(`Поколение: ${pop.gen}`, blockSize, blockSize);
}

// Key test
function keyPush(event) {
	switch (event.keyCode) {
		case 37: case 65: pop.snakes[0].setDirection('Left'); break;
		case 38: case 87: pop.snakes[0].setDirection('Up'); break;
		case 39: case 68: pop.snakes[0].setDirection('Right'); break;
		case 40: case 83: pop.snakes[0].setDirection('Down'); break;
	}
}

// Вычисляем случайное гауссовое число
function randomGaussian(x) {
    var rand = 0;
    for(var i = x; i > 0; i--){
        rand += Math.random() * 2 - 1;
    }
    return rand / x;
}

class Matrix { // Создаем класс матрицы

	constructor(row, col) { // Инициализируем размер матрицы
		this.rows = row; // Ряд (V)
		this.cols = col; // Столбик (>)

		this.matrix = Array(this.rows);

		for (let i = 0; i < this.rows; i++) {
			this.matrix[i] = Array(this.cols)
		}

		this.randomize(); // Заполняем пустую матрицу значениями от -1 до 1
	}

	dot(mat) { // Умножение матриц
		let result = new Matrix(this.rows, mat.cols);

		if (this.rows == mat.rows) {
			for (let i = 0; i < this.rows; i++) {
				for (let j = 0; j < this.cols; j++) {
					let sum = 0;
					for (let k = 0; k < this.cols; k++) {
						sum += this.matrix[i][k] * mat.matrix[k][j];
					}
					result.matrix[i][j] = sum;
				}
			}
		}
		return result;
	}

	randomize() { // Заполнение матрицы случайными значениями от -1 до 1
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.matrix[i][j] = Math.random() * 2 - 1; // От -1 до 1
			}
		}
	}

	addBias() { // Добаление смещения к определенному слою нейросети
		let mat = new Matrix(this.rows + 1, 1);
		
		for (let i = 0; i < this.rows; i++) {
			mat.matrix[i][0] = this.matrix[i][0];
		}

		mat.matrix[this.rows][0] = 1;
		return mat;
	}

	activate() { // Преобразуем каждое значение массива через активатор 
		let mat = new Matrix(this.rows, this.cols);

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				mat.matrix[i][j] = this.relu(this.matrix[i][j]);
			}
		}
		return mat;
	}

	relu(x) { // Один из видов активаторов
		return Math.max(0, x);
	}

	clone() { // Клонирование матрицы
		let mat = new Matrix(this.rows, this.cols);

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				mat.matrix[i][j] = this.matrix[i][j];
			}
		}
		return mat;
	}

	mutate(mutateRate) { // Мутация нейросети
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				let rand = Math.random();
				if (rand < mutateRate) {
					this.matrix[i][j] += randomGaussian(5);

					if (this.matrix[i][j] > 1) {
						this.matrix[i][j] = 1;
					} else if (this.matrix[i][j] < -1) {
						this.matrix[i][j] = -1;
					}
				}
			}
		}
	}

	crossover(partner) { // Создание нового экземпляра из двух матриц (родителей)
		let child = new Matrix(this.rows, this.cols);

		let randC = Math.floor(Math.random() * this.cols);
		let randR = Math.floor(Math.random() * this.rows);

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if ((i < randR) || (i == randR && j <= randC)) {
					child.matrix[i][j] = this.matrix[i][j];
				} else {
					child.matrix[i][j] = partner.matrix[i][j];
				}
			}
		}
		return child;
	}

	singleColumnMatrixFromArray(arr) { // Преобразуем массив в одномерную матрицу
		let mat = new Matrix(arr.length, 1);

		for (let i in arr) {
			mat.matrix[i][0] = arr[i];
		}
		return mat
	}

	toArray() { // Преобразуем матрицу в массив
		let arr = new Array(this.rows * this.cols);

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				arr[j + i * this.cols] = this.matrix[i][j];
			}
		}
		return arr;
	}
}

class NeuronNet { // Создаем класс нейросети
	
	constructor(count_of_inputs, count_of_hidden, count_of_outputs) { // Инициализируем количества нейронов на каждом слою
		this.iNodes = count_of_inputs; // Количество входных данных
		this.hNodes = count_of_hidden; // Количество скрытых нейронов
		this.oNodes = count_of_outputs; // Количество выходных данных

		this.weights = Array(3);

		this.weights[0] = new Matrix(this.hNodes, this.iNodes+1); // Веса между входным и скрытым слоями (I -> H1)
		this.weights[1] = new Matrix(this.hNodes, this.hNodes+1); // Веса между скрытым и вторым скрытым слоями (H1 -> H2)
		this.weights[2] = new Matrix(this.oNodes, this.hNodes+1); // Веса между скрытым и выходным слоями (H2 -> O)
	}

	mutate(mutateRate) { // Создаем мутацию под каждый вес
		for (let i in this.weights) {
			this.weights[i].mutate(mutateRate);
		}
	}

	output(inputsArr) { // 
		let inputs = this.weights[2].singleColumnMatrixFromArray(inputsArr);

		let inputsBias = inputs.addBias();

		//////////////////////////////////////////////////
		
		let hiddenInputs = this.weights[0].dot(inputsBias);

		let hiddenOutputs = hiddenInputs.activate();

		let hiddenOutputsBias = hiddenOutputs.addBias();

		/////////////////////////////////////////////////
		
		let hiddenInputs2 = this.weights[1].dot(hiddenOutputsBias);

		let hiddenOutputs2 = hiddenInputs2.activate();

		let hiddenOutputsBias2 = hiddenOutputs2.addBias();

		//////////////////////////////////////////////////

		let outputInputs = this.weights[2].dot(hiddenOutputsBias2);

		let outputs = outputInputs.activate()

		return outputs.toArray();
	}

	clone() {
		let clone = new NeuronNet(this.iNodes, this.hNodes, this.oNodes);

		for (let i = 0; i < this.weights.length; i++) {
			clone.weights[i] = this.weights[i].clone();
		}
		
		return clone;
	}
}

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
}

class Apple { // Создаем класс яблока (еды)
	
	constructor() { // Инициализируем цвет и кординаты яблока
		var is_finish = false;

		while (!is_finish) { // Перебираем пока не выпадет яблоко, не находящиеся в позиции другого яблока
			is_finish = true;
			var ax = Math.floor(Math.random() * blockSize);
			var ay = Math.floor(Math.random() * blockSize);

			for (let apple of apples) {
				if (apple.position.equal(ax, ay) ) {
					is_finish = false;
					break;
				}
			}
		}

		this.position = new Block(ax, ay);
		this.color = 'Red';
	}

	draw() { // Рисуем яблоко на экране
		this.position.draw(this.color);
	}
}

class Snake { // Создаем класс Змейки

	constructor(snakes=[]) {
		var is_finish = false;

		while (!is_finish) { // Перебираем пока не выпадет яблоко, не находящиеся в позиции другой змейки
			is_finish = true
			var px = Math.floor(Math.random() * (blockSize - 2))
			var py = Math.floor(Math.random() * (blockSize - 2) + 1)

			for (let snake of snakes) {
				if (snake.px == px && snake.py == py) {
					is_finish = false;
					break;
				}
			}
		}

		this.px = px // Координаты змейки по OX
		this.py = py // Координаты змейки по OY

		this.trail = []; // Хвост змеи
		this.tail = 5; // Размер тела змейки

		this.score = 1; // Твой счет

		this.lifeLeft = 100; // Показывает, сколько осталось ходов
		this.lifetime = 0; // Количество времени жизни змейки

		this.fitness = 0; // Результат жизни змейки
		this.decision = []; // Решение змейки
		this.brain = new NeuronNet(24, 18, 4);

		this.applePointer = 0; // Указатель на массив с яблоками

		this.dead = false; // Проверка на смерть
		this.best = false; // Проверка на то, будет ли змейка лучшей

		this.color = 'White'; // Инициализируем цвет змейки

		this.direction = 'Right'; // Нынешняя директория
		this.nextDirection = 'Right'; // Следующая директория
	}

	move() {
		// Уменьшаем ходы, добавляем время
		this.lifeLeft--;
		this.lifetime++;

		// Производим ход
		this.direction = this.nextDirection

		// Сделать ход
		if (this.direction == 'Right') 		{ this.px += 1; } 
		else if (this.direction == 'Left')  { this.px += -1; }
		else if (this.direction == 'Down')  { this.py += 1; }
		else if (this.direction == 'Up')    { this.py += -1; }

		// Инициализируем голову
		let head = new Block(this.px, this.py);

		if (this.checkEat(head)) { // Если змейка съела яблоко
			this.eat(head);
		}

		// Проверяем на столкновение
		if (this.checkCollision(head) || this.lifeLeft <= 0) {
			this.dead = true;
			this.calculateFitness();
			return
		}

		// Добавляем новую часть тела
		this.trail.push(head);

		// Удаляем ненужные части тела
		if (this.trail.length > this.tail) {
			this.trail.shift();
		}
	}

	draw() { // Рисуем змейку
		this.trail.forEach((item) => {
			item.draw(this.color);
		})
	}

	checkCollision(head) { // Проверка на столковение
		let selfCollision = false;

		this.trail.forEach((item) => {
			if (item.equal(head.x, head.y)) { // Если голова столкнулась с телом
				selfCollision = true
			}
		})

		return selfCollision || (this.px < 0 || this.px > blockSize - 1 || this.py < 0 || this.py > blockSize - 1)
	}

	checkEat(head) { // Проверка на столкновение с яблоком
		for (let i = 0; i < apples.length; i++) {
			if (head.equal(apples[i].position.x, apples[i].position.y)) { // Если голова столкнулось с яблоком
				this.applePointer = i;
				return true
			}
		}
		return false
	}

	eat() { // Что происходит при съедении яблока?
		this.tail++; // Увеличиваем хвост
		this.score++; // Увеличиваем на одно очко

		if (this.lifeLeft < 500) { // Увеличиваем время жизни змеи
			if (this.lifeLeft > 400) {
				this.lifeLeft = 500;
			} else {
				this.lifeLeft += 100;
			}
		}

		apples.splice(this.applePointer, 1); // Удаляем яблоко с поля
	}

	calculateFitness() { // Вычисляем коэффицент развития ИИ
		if (this.score < 10) {
			this.fitness = Math.floor(this.lifetime * this.lifetime) * Math.pow(2, this.score); // F = life^2 * 2^score
		} else {
			this.fitness = Math.floor(this.lifetime * this.lifetime) * Math.pow(2, 10) * (this.score - 9) // F = life^2 * 2^10 * (score-9)
		}
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

	clone() {
		let snake = new Snake();
		snake.brain = this.brain.clone();

		return snake;
	}

	mutate(mutateRate) {
		brain.mutate(mutateRate);
	}

	think() { // Ответ ИИ и его выполнение

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

class Population { // Создаем класс популяции змеек
	
	constructor(count) {
		this.snakes = []; // Массив со змейками

		for (let n = 0; n < count; n++) { // Создаем n-ое количество змеек
			let snake = new Snake(this.snakes);
			this.snakes.push(snake);
		}
		this.bestSnake = this.snakes[0].clone(); // Лучшая змейка

		this.bestSnakeScore = 0;
		this.gen = 1;
		this.samebest = 0;

		this.bestFitness = 0;
		this.fitnessSum = 0;
	}

	done() {
		for (let snake of this.snakes) {
			if (!snake.dead) {
				return false;
			}
		}
		return true;
	}

	update() {
		for (let snake of this.snakes) {
			snake.draw(); // Прорисовываем змейку
			if (!snake.dead) {
				snake.move(); // Делаем ход
				snake.think() // Псевдо ИИ (Максимально тупой алгоритм)
				console.log(this.done())
			}
		}
	}

	setBestSnake() {
		let max = 0;
		let maxIndex = 0;

		for (let i in this.snakes) {
			if (this.snakes[i].fitness > max) {
				max = this.snakes[i].fitness;
				maxIndex = i;
			}
		}

		if (max > this.bestFitness) {
			this.bestFitness = max;
			this.bestSnake = this.snakes[maxIndex];
			this.bestSnakeScore = this.snakes[maxIndex].score;
		}
	}

	selectParent() {
		let rand = Math.random() * this.fitnessSum;
		let summation = 0;
		for (let snake of this.snakes) {
			summation += snake.fitness;
			if (summation > rand) {
				return snake;
			}
		}
		return this.snakes[0];
	}

	naturalSelection() {
		newSnakes = [];

		this.setBestSnake();
		this.calculateFitnessSum();

		newSnakes[0] = this.bestSnake
		
		for (let i = 1; i < snakes.length; i++) {
			let child = selectParent();

			newSnakes.push(child);
		}

		this.snakes = newSnakes;
		this.gen++;
	}
}

let apples = []; // Массив с едой

for (i of [...Array(25)]) apples.push(new Apple()) // Создание яблок в массиве

let pop = new Population(30); // Инициализируем популяцию змеек

function game() { // Игровой цикл

	drawBoard(); // Рисуем поле

	pop.update(); // Перебираем каждую змейку

	apples.forEach((apple)=> {
		apple.draw()
	})
}