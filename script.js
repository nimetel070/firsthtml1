// Wait for page to load
document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const sideToggle = document.getElementById('side-toggle');
    const startBtn = document.getElementById('start-btn');
    const status = document.getElementById('status');
    const chessboard = document.getElementById('chessboard');
    const suggestionBox = document.getElementById('suggestion-box');
    const suggestionText = document.getElementById('suggestion-text');
    const pieceIcon = document.getElementById('piece-icon');

    let chess = new Chess(); // From chess.js - starts new game
    let engine = new Worker('stockfish.js'); // AI worker (runs in background)
    let yourSide = 'w'; // 'w' white, 'b' black
    let isYourTurn = true; // Starts with white
    let selectedPiece = null; // For dragging

    // Piece symbols (Unicode for simple icons)
    const pieces = {
        'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', // Black
        'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'  // White
    };

    // Update toggle text when changed
    sideToggle.addEventListener('change', () => {
        const isWhite = sideToggle.checked;
        document.querySelector('.toggle-switch').textContent = `Play as ${isWhite ? 'White' : 'Black'} (bottom)`;
    });

    // Start button click
    startBtn.addEventListener('click', () => {
        yourSide = sideToggle.checked ? 'w' : 'b';
        isYourTurn = yourSide === 'w';
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        drawBoard();
        updateStatus();
        if (isYourTurn) suggestMove();
    });

    // Draw the 8x8 board
    function drawBoard() {
        chessboard.innerHTML = ''; // Clear
        const board = chess.board(); // Get current pieces from chess.js
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const file = 'abcdefgh'[col];
                const rank = 8 - row;
                const squareName = file + rank; // e.g., 'e4'
                const isLight = (row + col) % 2 === 0;
                square.classList.add('square', isLight ? 'light' : 'dark');
                square.dataset.square = squareName; // Store name

                // Add piece if exists
                const pieceData = board[row][col];
                if (pieceData) {
                    square.innerText = pieces[pieceData.type.toUpperCase() * (pieceData.color === 'w' ? 1 : -1)]; // Wrong, fix: use case
                    square.dataset.piece = pieceData.color + pieceData.type; // e.g., 'wp' for white pawn
                }

                // Drag events
                square.addEventListener('dragstart', handleDragStart);
                square.addEventListener('dragover', (e) => e.preventDefault());
                square.addEventListener('drop', handleDrop);

                chessboard.appendChild(square);
            }
        }
        // Flip board if you're black (you at bottom)
        if (yourSide === 'b') chessboard.style.transform = 'rotate(180deg)';
    }

    // Drag start: Select piece
    function handleDragStart(e) {
        if (!e.target.innerText) return; // No piece
        const pieceColor = e.target.dataset.piece[0]; // 'w' or 'b'
        if ((isYourTurn && pieceColor !== yourSide) || (!isYourTurn && pieceColor === yourSide)) return; // Wrong turn
        selectedPiece = e.target.dataset.square;
        e.dataTransfer.setData('text', selectedPiece);
    }

    // Drop: Make move
    function handleDrop(e) {
        const targetSquare = e.target.dataset.square || e.target.parentNode.dataset.square; // If drop on piece, get square
        if (!selectedPiece) return;

        const move = { from: selectedPiece, to: targetSquare, promotion: 'q' }; // Promote to queen
        if (chess.move(move)) {
            drawBoard(); // Update board
            isYourTurn = !isYourTurn; // Switch turn
            updateStatus();
            if (isYourTurn) suggestMove();
            checkGameOver();
        }
        selectedPiece = null;
    }

    // Suggest move with AI
    function suggestMove() {
        suggestionBox.style.display = 'block';
        suggestionText.innerText = 'Calculating...';
        pieceIcon.innerText = '';
        engine.postMessage('uci');
        engine.postMessage(`position fen ${chess.fen()}`);
        engine.postMessage('go depth 10'); // Depth 10: Quick and strong

        engine.onmessage = (e) => {
            if (e.data.startsWith('bestmove')) {
                const moveUCI = e.data.split(' ')[1];
                const from = moveUCI.slice(0, 2);
                const to = moveUCI.slice(2, 4);
                suggestionText.innerText = `${from} to ${to}`;
                // Add icon: Get piece type from from-square
                const pieceData = chess.get(from);
                if (pieceData) pieceIcon.innerText = pieces[pieceData.type.toUpperCase()]; // e.g., ♞ for knight
            }
        };
    }

    // Update turn text
    function updateStatus() {
        status.innerText = `Turn: ${isYourTurn ? 'Your Turn (use suggestion)' : "Opponent's Turn"}`;
        suggestionBox.style.display = isYourTurn ? 'block' : 'none';
    }

    // Check if game over
    function checkGameOver() {
        if (chess.game_over()) {
            status.innerText = chess.in_checkmate() ? `${yourSide === chess.turn() ? 'Opponent' : 'You'} Win!` : 'Draw!';
            suggestionBox.style.display = 'none';
        }
    }
});
