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
				for (let j = 0; j < mat.cols; j++) {
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

	singleColumnMatrixFromArray(arr) { // Преобразуем массив в одномерную матрицу
		let mat = new Matrix(arr.length, 1);

		for (let i = 0; i < arr.length; i++) {
			mat.matrix[i][0] = arr[i];
		}
		return mat
	}

	fromArray(arr) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.matrix[i][j] = arr[j + i * this.cols];
			}
		}
		return arr;
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

	sigmoid(x) { // Один из видов активаторов
		return 1 / ( 1 + Math.pow(Math.E, -x))
	}

	sigmoidDeriv(x) {
		return sigmoid(x) * (1 - sigmoid(x));
	}

	relu(x) { // Один из видов активаторов
		return Math.max(0, x);
	}

	removeBottomLayer() {
		let mat = new Matrix(rows-1, cols);

	 	for (let i = 0; i < mat.rows; i++) {
	 		for (let j = 0; j < this.cols; j++) {
	 			n.matrix[i][j] = this.matrix[i][j];
	 		}
	 	}
	    return n;
	}

	mutate(mutateRate) { // Мутация нейросети
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				let rand = Math.random();
				if (rand < mutateRate) { // Если рандом меньше мутации, мутировать
					this.matrix[i][j] += randomGaussian() / 5; // добавляем к значению гауссовое распределение

					if (this.matrix[i][j] > 1) { // Если значение вышло за предел
						this.matrix[i][j] = 1;

					} else if (this.matrix[i][j] < -1) { // Если значение вышло за предел
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
				if ((i < randR) || (i == randR && j <= randC)) { // Если рандом выбрал эту позицию
					child.matrix[i][j] = this.matrix[i][j]; // Отдать значение первого родителя
				} else {
					child.matrix[i][j] = partner.matrix[i][j]; // Отдать значение второго родителя
				}
			}
		}
		return child;
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

	output(inputsArr) { // Вернуть значение нейросети исходя из нынешних высов и входных данных
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

	crossover(partner) { // Вернуть значение новой змейки исходя из мозга двух родителей
		let child = new NeuronNet(this.iNodes, this.hNodes, this.oNodes);

		for (let i = 0; i < this.weights.length; i++) {
			child.weights[i] = this.weights[i].crossover(partner.weights[i]);
		}
		return child;
	}

	clone() { // Копируем мозг нейросети с его весами
		let clone = new NeuronNet(this.iNodes, this.hNodes, this.oNodes);

		for (let i = 0; i < this.weights.length; i++) {
			clone.weights[i] = this.weights[i].clone();
		}
		
		return clone;
	}
}

class Block { // Создаем класс клетки

	constructor(x, y, color) { // Инициализируем координаты клетки на поле
		this.x = x;
		this.y = y;
		this.color = color;
	}

	draw() { // Прорисовка блока
		ctx.fillStyle = this.color;
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
		
		let ax = Math.floor(Math.random() * blockSize);
		let ay = Math.floor(Math.random() * blockSize);

		super(ax, ay, 'Red');
	}

	move(snake) {

		do {
			var ax = Math.floor(Math.random() * blockSize);
			var ay = Math.floor(Math.random() * blockSize);
		} while (in_array(snake, ax, ay));

		this.x = ax;
		this.y = ay;
	}
}

class Snake extends Block { // Создаем класс Змейки

	constructor() {
		var px = Math.floor(Math.random() * (blockSize - 2))
		var py = Math.floor(Math.random() * (blockSize - 2) + 1)

		super(px, py, 'White'); // Инициализируем координаты змейки и цвет змейки

		this.trail = []; // Хвост змеи
		this.tail = 5; // Размер тела змейки

		this.score = 1; // Твой счет

		this.food = new Apple();

		this.lifeLeft = 100; // Показывает, сколько осталось ходов
		this.lifetime = 0; // Количество времени жизни змейки

		this.fitness = 0; // Результат жизни змейки
		this.decision = []; // Решение змейки
		
		this.vision = Array(24); // Вид змейки на 3 клетки в каждую сторону
		this.brain = new NeuronNet(24, 18, 4); // Мозг змейки

		this.dead = false; // Проверка на смерть

		this.color = 'White'; // Инициализируем цвет змейки

		this.direction = 'Right'; // Нынешняя директория
		this.nextDirection = 'Right'; // Следующая директория
	}

	mutate(mutateRate) { // Мутация мозга
		this.brain.mutate(mutateRate);
	}

	think() { // Ответ ИИ и его выполнение

		this.decision = this.brain.output(this.vision); // Ответ ИИ

		let max = 0;
		let maxIndex = 0;

		for (let i = 0; i < this.decision.length; i++) { // Вычисляем лучший результат
			if (max < this.decision[i]) {
				max = this.decision[i];
				maxIndex = i;
			}
		}

		switch (maxIndex) { // Выбираем ход исходя из ответа
			case 0: this.setDirection('Left'); break;
			case 1: this.setDirection('Up'); break;
			case 2: this.setDirection('Right'); break;
			case 3: this.setDirection('Down'); break;
		}
	}

	move() {
		// Уменьшаем ходы, добавляем время
		this.lifeLeft--;
		this.lifetime++;

		// Производим ход
		this.direction = this.nextDirection

		// Сделать ход
		if (this.direction == 'Right') 		{ this.x += 1; } 
		else if (this.direction == 'Left')  { this.x += -1; }
		else if (this.direction == 'Down')  { this.y += 1; }
		else if (this.direction == 'Up')    { this.y += -1; }

		// Инициализируем голову
		let head = new Block(this.x, this.y);

		// Проверяем на столкновение
		if (this.checkCollision(head) || this.lifeLeft <= 0) {
			this.dead = true;
			return
		}

		if (this.checkEat(head)) { // Если змейка съела яблоко
			this.eat(head);
		}

		// Добавляем новую часть тела
		this.trail.push(head);

		// Удаляем ненужные части тела
		if (this.trail.length > this.tail) {
			this.trail.shift();
		}
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

		this.food.move(this.trail);
	}

	draw() { // Рисуем змейку
		this.trail.forEach((item) => {
			item.draw();
		})
	}

	checkCollision(head) { // Проверка на столковение
		let selfCollision = false;

		this.trail.forEach((item) => {
			if (item.equalBlock(head)) { // Если голова столкнулась с телом
				selfCollision = true
			}
		})

		return selfCollision || (head.x < 0 || head.x > blockSize - 1 || head.y < 0 || head.y > blockSize - 1)
	}

	calcFitness() { // Вычисляем коэффицент развития ИИ
		if (this.score < 10) {
			this.fitness = Math.floor(this.lifetime * this.lifetime) * Math.pow(2, this.score); // F = life^2 * 2^score
		} else {
			this.fitness = Math.floor(this.lifetime * this.lifetime) * Math.pow(2, 10) * (this.score - 9) // F = life^2 * 2^10 * (score-9)
		}
	}

	checkEat(head) { // Проверка на столкновение с яблоком
		return head.equalBlock(this.food);
	}

	crossover(partner) {
		let child = new Snake();

		child.brain = this.brain.crossover(partner.brain);
		return child;
	}

	clone() { // Создаем змейку с схожим мозгом
		let snake = new Snake();
		snake.brain = this.brain.clone();

		return snake;
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

		let pos = new Block(this.x, this.y, 'yellow'); // Позиция блока относительно поля

		let foodIsFound = false; // Была ли задета блоком еда
		let tailIsFound = false; // Был ли задет блоком хвост

		pos.add(direction); // Добавляем смещение позиции от начальной
		let distance = 1; // Расстояние от головы змейки

		while (!(pos.x < 0 || pos.x > blockSize - 1 || pos.y < 0 || pos.y > blockSize - 1)) { // Введем цикл пока не врежимся в стенку

			if (!foodIsFound && pos.equalBlock(this.food)) { // Если встретили еду
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

class Population { // Создаем класс популяции змеек
	
	constructor(count) {
		this.gen = 1; // Поколение
		this.globalBestScore = 4; // Лучший результат когда-либо совершенный в этой симуляции
		this.globalBestFitness = 0; // Лучший фитнесс-результат когда-либо совершенный в этой симуляции

		this.currentBestScore = 4; // Действующий лучший результат
		this.currentBestSnake = 0; // Действующая лучшая змейка

		this.snakes = []; // Массив со змейками

		for (let n = 0; n < count; n++) { // Создаем n-ое количество змеек
			this.snakes.push(new Snake(this.snakes));
		}
		this.globalBestSnake = this.snakes[0].clone(); // Лучшая змейка
	}

	update() {
		for (let snake of this.snakes) {
			if (!snake.dead) {
				snake.look(); // Обзор змейки
				snake.think() // Принимаем решение, исходя из обзора 
				snake.move(); // Делаем ход

				snake.draw(); // Прорисовываем змейку
			}
		}

		this.setCurrentBest(); // Каждый раз устанавливать лучшую змейку
	}

	updateFood() {
		for (let snake of this.snakes) {
			if (!snake.dead) {
				snake.food.draw();
			}
		}
	}

	done() { // Проверяем умерли ли все змейки
		for (let snake of this.snakes) {
			if (!snake.dead) {
				return false;
			}
		}
		return true;
	}

	calcFitness() {
		for (let snake of this.snakes) {
			snake.calcFitness();
		}
	}

	naturalSelection() { // Создает новое поколение путем естественной селекции
		let newSnakes = new Population(this.snakes.length); // Создаем новых змеек

		this.setBestSnake(); // Выбираем лучшую змейку
		newSnakes.snakes[0] = this.globalBestSnake.clone();
	
		for (let i = 1; i < newSnakes.snakes.length; i++) {
			let parent1 = this.selectParent(); // Выбираем двух родителей
			let parent2 = this.selectParent();

			let child = parent1.crossover(parent2); // Кроссируем им вместе

			child.mutate(globalMutationRate); // Мутируем

			newSnakes.snakes[i] = child; // Добавляем новый змеек в массив
		}

		this.snakes = newSnakes.clone(); // Сохраняем змеек в наш массив
		this.gen++; // Инкрементируем новое поколение

		this.currentBestScore = 4;
	}

	selectParent() { // Выбор родителя
		let fitnessSum = 0;
		
		for (let i in this.snakes) {
			fitnessSum += this.snakes[i].fitness;
		}

		let rand = Math.floor(Math.random() * fitnessSum);

		let runningSum = 0;

		for (let i in this.snakes) {
			runningSum += this.snakes[i].fitness;
			if (runningSum > rand) {
				return this.snakes[i];
			}
		}

		return this.snakes[0];
	}

	setBestSnake() { // Установка лучшей змейки
		let max = 0;
		let maxIndex = 0;

		for (let i in this.snakes) {
			if (this.snakes[i].fitness > max) {
				max = this.snakes[i].fitness;
				maxIndex = i;
			}
		}

		if (max > this.globalBestFitness) {
			this.globalBestFitness = max;
			this.globalBestSnake = this.snakes[maxIndex].clone();
		}
	}

	mutate() {
		for (let i = 1; i < this.snakes.length; i++) {
			this.snakes[i].mutate(globalMutationRate);
		}
	}

	setCurrentBest() {
		if (!this.done()) {
			let max = 0;
			let maxIndex = 0;

			for (let i = 0; i < this.snakes.length; i++) {
				if (!this.snakes[i].dead && this.snakes[i].score > max) {
					max = this.snakes[i].score;
					maxIndex = i;
				}
			}

			if (max > this.currentBestScore) {
				this.currentBestScore = Math.floor(max);
			}

			if (this.snakes[this.currentBestSnake].dead || max > this.snakes[this.currentBestSnake].length + 5) {
				this.currentBestScore = maxIndex;
			}

			if (this.currentBestScore > this.globalBestScore) {
				this.globalBestScore = this.currentBestScore;
			}
		}
	}

	clone() {
		let newSnakes = Array(this.snakes.length);

		for (let i in this.snakes) {
			newSnakes[i] = this.snakes[i].clone();
		}
		return newSnakes;
	}
}

class World {

	constructor(speciesNo, popSize) {
		this.gen = 0; // Текущее поколение
		this.worldBestScore = 0;

		this.species = new Array(speciesNo) // Количество популяций змеек

		for (let i = 0; i < this.species.length; i++) {
			this.species[i] = new Population(popSize); // Инициализируем одну популяцию змеек
		}

		this.SnakesOfLegend = new Population(5); // Инициализируем 5 лучших змеек

		for (let i = 0; i < this.SnakesOfLegend.snakes.length; i++) {
			this.SnakesOfLegend.snakes[i] = new Snake();
		}

		this.topBrains = new Array(this.SnakesOfLegend.snakes.length); // Инициализируем 5 лучших нейросетей

		for (let i = 0; i < this.topBrains.length; i++) {
			this.topBrains[i] = new NeuronNet(24, 18, 4); 
		}
	}

	update() { // Обновляем каждое поколение
		for (let i = 0; i < this.species.length; i++) {
			this.species[i].update();
		}
		for (let i = 0; i < this.species.length; i++) {
			this.species[i].updateFood();
		}
	}

	geneticAlgorithm() { // Генетический алгоритм
		for (let i = 0; i < this.species.length; i++) {
			this.species[i].calcFitness(); // Вычисляем фитнесс каждой змейки
			this.species[i].naturalSelection(); // Происводим естественный отбор
		}

		this.gen++; // Сменяем поколение
		this.setTopScore(); // Устанавливаем лучший счет

		for (let i = 0; i < this.species.length; i++) {
			this.saveTopSnakes(i); // Сохраняем топ лучших змеек
		}
	}

	loadBestSnake() { // Устанавливаем лучших змеек
		for (let i = 0; i < this.SnakesOfLegend.snakes.length; i++) {
			this.SnakesOfLegend.snakes[i] = this.SnakesOfLegend.snakes.loadSnake(i);
		}
	}

	snakeFusion() { // Создает лучшую змейку из 5 лучших змеек
		this.loadBestSnake();

		for (let i = 0; i < this.SnakesOfLegend.snakes.length; i++) { 
			this.topBrains[i] = this.SnakesOfLegend.snakes[i].brain.clone(); // Сохраняем лучшие нейросети из лучших змеек
		}

		this.fusedSnake = new SuperSnake(topBrains); // Ставим лучшую змеейку
	}

	updateSuperSnake() {
		this.fusedSnake.update();
	}

	updateLegend() {
		this.legend.update();
	}

	done() {
		for (let i = 0; i < this.species.length; i++) {
			if (!this.species[i].done()) {
				return false;
			}
		}
		return true;
	}

	setTopScore() {
		let max = 0;
		let maxIndex = 0;

		for (let i = 0; i < this.species.length; i++) {
			if (this.species[i].globalBestFitness > max) {
				max = this.species[i].globalBestFitness;
				maxIndex = i;
			}
		}

		this.worldBestScore = this.species[maxIndex].globalBestScore;
	}

	saveTopSnakes() {

	}

	playLegend(snakeNo) {
		this.loadBestSnake();
		this.legend = this.SnakesOfLegend[snakeNo].clone();
		this.legendNo = snakeNo;
		this.legend.test = true;
	}
}

const blockSize = 27; // Количество блоков на поле

let globalMutationRate = 0.01;
let speed = 15;

let showAll = true;
let trainLegendSnakes = false;
let showingLegend = false;
let fusionGo = false;

var gauss_next = null;

// Init canvas
canvas = document.getElementById('game');
ctx = canvas.getContext('2d');

document.addEventListener('keydown', keyPush)
setInterval(game, 1000/speed)

let world = new World(5, 100);
let worldOfLegends = new World(5, 200);

function drawBoard() { // Рисуем поле
	// Рисуем фон
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Выводим текст
	ctx.fillStyle = 'white';
	ctx.font = '20px Comic Sans MS';
	ctx.textBaseline = 'top';

	if (trainLegendSnakes) {
		ctx.fillText(`Поколение: ${worldOfLegends.gen}`, blockSize, blockSize);
		ctx.fillText(`Лучший счет: ${worldOfLegends.worldBestScore}`, blockSize, blockSize*2);
		ctx.fillText(`Мутация: ${globalMutationRate}`, blockSize, blockSize*3);
	} else if (showingLegend) {
		ctx.fillText(`Счет: ${world.legend.tail - 4}`, blockSize, blockSize);
	} else {
		ctx.fillText(`Поколение: ${world.gen}`, blockSize, blockSize);
		ctx.fillText(`Лучший счет: ${world.worldBestScore}`, blockSize, blockSize*2);
		ctx.fillText(`Мутация: ${globalMutationRate}`, blockSize, blockSize*3);
	}
	

	if (trainLegendSnakes) { // Если мы тренируем легендарных змеек
		
		if (!worldOfLegends.done()) { // Если они живы
			worldOfLegends.update();
		
		} else {
			worldOfLegends.geneticAlgorithm(); // Если мертвы, начать процесс генетического алгоритма
		}
	
	} else if (showingLegend) { // Если мы тренируем одну легендарную змейку

		if (!world.legend.dead) { // Если она жива
			world.updateLegend();
		
		} else {
			
			if (world.legend.tail < 100) { // Если хвост больше 100
				world.playLegend(world.legendNo);
			
			} else {
				showingLegend = false; // В остальном, останавливаем тренировку
			}
		}
	
	} else if (fusionGo) { // Если мы тренируем лучшую змейку

		if (!world.fusedSnake.dead) { // Если она жива
			world.updateSuperSnake();
		
		} else {
			fusionGo = false; // В остальном, останавливаем тренировку
		}

	} else { // Если мы проводим обычное обучение

		if (!world.done()) { // Если они живы
			world.update();
		
		} else {
			world.geneticAlgorithm();
		}
	}
}

function keyPush(event) { // Key test
	switch (event.keyCode) {
		case 37: case 65: world.species[0].snakes[1].setDirection('Left'); break;
		case 38: case 87: world.species[0].snakes[1].setDirection('Up'); break;
		case 39: case 68: world.species[0].snakes[1].setDirection('Right'); break;
		case 40: case 83: world.species[0].snakes[1].setDirection('Down'); break;
	}
}

function randomGaussian(mu=0, sigma=1) { // Вычисляем случайное гауссовое число
    let gauss_now = gauss_next;
    gauss_next = null;

    if (gauss_now === null) {
		let x2pi = Math.random() * 2 * Math.PI;
		let g2rad = Math.sqrt(-2.0 * Math.log(1.0 - Math.random()));
		gauss_now  = Math.cos(x2pi) * g2rad;
		gauss_next = Math.sin(x2pi) * g2rad;
	}

    return mu + gauss_now * sigma;
}

function in_array(arr, x, y) { // Проверяем наличие блока в других блоках
	for (let item of arr) {
		if (item.equal(x, y)) {
			return true
		}
	}
	return false
}

function game() { // Игровой цикл

	drawBoard(); // Рисуем поле
}