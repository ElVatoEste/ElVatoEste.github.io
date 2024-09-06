document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.querySelector('#game-board');
    const startButton = document.querySelector('#start-button');
    const message = document.createElement('div'); // Crear el mensaje de fin de juego
    const width = 10; // Ancho del tablero
    let timerId;
    let currentPosition = 4;
    let currentRotation = 0;
    let gameStarted = false; // Nueva variable para controlar si el juego ha comenzado


    // Crear el tablero
    let squares = Array.from(Array(200), () => {
        const square = document.createElement('div');
        square.classList.add('grid-block');
        gameBoard.appendChild(square);
        return square;
    });

    // Añadir el mensaje al DOM
    message.style.display = 'none';
    message.style.color = 'white';
    message.style.textAlign = 'center';
    message.style.marginTop = '20px';
    message.innerText = 'Juego terminado. Redirigiendo...';
    document.body.appendChild(message);

    // Tetrominos en sus formas
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    // Colores para cada tetromino
    const colors = ['orange', 'red', 'purple', 'yellow', 'cyan'];

    const tetrominos = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    let current = tetrominos[randomTetromino][currentRotation];
    let currentColor = colors[randomTetromino]; // Asignar color al tetromino

    // Dibujar el tetromino
    function draw() {
        if (gameStarted) {
            current.forEach(index => {
                if (squares[currentPosition + index]) {
                    squares[currentPosition + index].classList.add('tetromino');
                    squares[currentPosition + index].style.backgroundColor = currentColor; // Aplicar color
                }
            });
        }
    }

    // Borrar el tetromino
    function undraw() {
        current.forEach(index => {
            if (squares[currentPosition + index]) {
                squares[currentPosition + index].classList.remove('tetromino');
                squares[currentPosition + index].style.backgroundColor = ''; // Quitar color
            }
        });
    }

    // Verificar colisiones con el borde inferior o piezas congeladas
    function checkCollision() {
        return current.some(index =>
            currentPosition + index + width >= squares.length || // Fondo del tablero
            squares[currentPosition + index + width].classList.contains('taken') // Otra pieza congelada
        );
    }

    // Hacer que se mueva hacia abajo
    function moveDown() {
        if (!checkCollision()) {
            undraw();
            currentPosition += width;
            draw();
        } else {
            freeze();
        }
    }

    // Congelar tetromino cuando llegue al fondo o colisione con otra pieza
    function freeze() {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'));
        removeFullLines(); // Verificar y eliminar líneas completas
        // Empezar un nuevo tetromino
        randomTetromino = Math.floor(Math.random() * tetrominos.length);
        currentRotation = 0;
        current = tetrominos[randomTetromino][currentRotation];
        currentColor = colors[randomTetromino]; // Cambiar color con nuevo tetromino
        currentPosition = 4;

        // Verificar si el nuevo tetromino colisiona inmediatamente
        if (checkGameOver()) {
            endGame();
        } else {
            draw();
        }
    }

    // Eliminar líneas completas
    function removeFullLines() {
        for (let i = 0; i < squares.length; i += width) {
            const row = Array.from({ length: width }, (_, k) => i + k);
            if (row.every(index => squares[index].classList.contains('taken'))) {
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = ''; // Quitar color
                });
                const removedSquares = squares.splice(i, width);
                squares = removedSquares.concat(squares); // Añadir los cuadrados eliminados al principio del array
                squares.forEach(cell => gameBoard.appendChild(cell)); // Reagregar todo el tablero
            }
        }
    }

    // Verificar si el juego ha terminado
    function checkGameOver() {
        // Verificar si la nueva pieza colisiona inmediatamente con bloques "taken"
        return current.some(index => squares[currentPosition + index].classList.contains('taken'));
    }

    // Terminar el juego y mostrar mensaje, luego redirigir
    function endGame() {
        message.style.display = 'block'; // Mostrar mensaje de "Juego terminado"
        clearInterval(timerId); // Detener el juego
        setTimeout(() => {
            window.location.href = 'https://vatodev.xyz'; // Redirigir después de 2 segundos
        }, 2000);
    }

    // Mover a la izquierda, a menos que esté en el borde o bloqueado
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    // Mover a la derecha, a menos que esté en el borde o bloqueado
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }
    // Verificar si la posición actual es válida (dentro del tablero y sin colisiones)
    function isValidPosition() {
        return current.every(index => {
            const newPosition = currentPosition + index;
            const isWithinWidth = newPosition % width >= 0 && newPosition % width < width;
            const isWithinHeight = newPosition >= 0 && newPosition < squares.length;
            const noCollision = !squares[newPosition].classList.contains('taken');
            return isWithinWidth && isWithinHeight && noCollision;
        });
    }

    // Rotar el tetromino
    function rotate() {
        undraw();
        const previousRotation = currentRotation;
        currentRotation++;
        if (currentRotation === tetrominos[randomTetromino].length) {
            currentRotation = 0;
        }
        current = tetrominos[randomTetromino][currentRotation];

        // Mover pieza hacia dentro del tablero si está en el borde
        if (!isValidPosition()) {
            // Comprobar si se sale por el borde izquierdo
            while (current.some(index => (currentPosition + index) % width < 0)) {
                currentPosition += 1; // Mover hacia la derecha
            }

            // Comprobar si se sale por el borde derecho
            while (current.some(index => (currentPosition + index) % width >= width)) {
                currentPosition -= 1; // Mover hacia la izquierda
            }

            // Si aún no es válida, revertir la rotación
            if (!isValidPosition()) {
                currentRotation = previousRotation;
                current = tetrominos[randomTetromino][currentRotation];
            }
        }

        draw();
    }



    // Control del teclado
    function control(e) {
        if (gameStarted) { // Solo permitir los controles si el juego ha comenzado
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 40) {
                moveDown();
            }
        }
    }
    document.addEventListener('keydown', control);

    // Iniciar el juego cuando se presione el botón "Iniciar Juego"
    startButton.addEventListener('click', () => {
        if (!timerId) {
            gameStarted = true; // El juego ha comenzado
            draw();
            timerId = setInterval(moveDown, 1000);
        }
    });
});
