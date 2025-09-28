const chessboard = document.getElementById('chessboard');
const aiSuggestionDisplay = document.getElementById('ai-suggestion');
const resetButton = document.getElementById('reset-button');

// Unicode chess pieces
const PIECES = {
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟'
};

let board = []; // 8x8 array representing the chessboard
let selectedSquare = null;
let currentPlayer = 'white'; // 'white' or 'black'

// Hardcoded "genius" moves for the cheater (assuming white is the cheater)
// This is a simplified sequence to demonstrate the cheating
const CHEATER_MOVES = [
    { from: 'e2', to: 'e4' }, // White's first move
    { from: 'd2', to: 'd4' }, // White's second move
    { from: 'g1', to: 'f3' }, // White's third move
    { from: 'b1', to: 'c3' }, // White's fourth move
    // Add more genius moves to win the game!
    // Example: { from: 'e4', to: 'e5' }
];
let cheaterMoveIndex = 0;

// Initialize the board with standard chess starting positions
function initializeBoard() {
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    selectedSquare = null;
    currentPlayer = 'white';
    cheaterMoveIndex = 0;
    renderBoard();
    updateAiSuggestion();
}

// Render the chessboard HTML
function renderBoard() {
    chessboard.innerHTML = ''; // Clear existing board
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            const file = String.fromCharCode(97 + c); // 'a' through 'h'
            const rank = 8 - r; // '8' through '1'
            const id = `${file}${rank}`;
            square.id = id;
            square.classList.add('square', (r + c) % 2 === 0 ? 'light' : 'dark');

            const pieceCode = board[r][c];
            if (pieceCode) {
                const pieceElement = document.createElement('span');
                pieceElement.classList.add('piece');
                pieceElement.classList.add(pieceCode === pieceCode.toUpperCase() ? 'white-piece' : 'black-piece');
                pieceElement.textContent = PIECES[pieceCode];
                square.appendChild(pieceElement);
            }

            square.addEventListener('click', () => handleSquareClick(r, c, id));
            chessboard.appendChild(square);
        }
    }
}

// Handle clicks on squares
function handleSquareClick(r, c, id) {
    const piece = board[r][c];

    // If a square is already selected
    if (selectedSquare) {
        const [selectedR, selectedC] = selectedSquare.coords;

        // If clicking the same square, deselect it
        if (selectedSquare.id === id) {
            deselectSquare();
            return;
        }

        // Attempt to move the piece
        if (isValidMove(selectedR, selectedC, r, c)) {
            makeMove(selectedR, selectedC, r, c);
            deselectSquare();
            switchPlayer();
            updateAiSuggestion(); // Update AI suggestion after each move
        } else {
            // If it's not a valid move, and it's your own piece, select new piece
            // This is a simplified check. A full game would validate who owns the piece.
            if (piece && isPieceOfCurrentPlayer(piece)) {
                 deselectSquare(); // Deselect old
                 selectSquare(r, c, id, piece); // Select new
            } else {
                deselectSquare(); // Invalid move, deselect
            }
        }
    } else {
        // No square selected, try to select a piece
        if (piece && isPieceOfCurrentPlayer(piece)) {
            selectSquare(r, c, id, piece);
        }
    }
}

function selectSquare(r, c, id, piece) {
    selectedSquare = {
        coords: [r, c],
        id: id,
        piece: piece
    };
    document.getElementById(id).classList.add('selected');
    // For a real game, you would now highlight possible moves
}

function deselectSquare() {
    if (selectedSquare) {
        document.getElementById(selectedSquare.id).classList.remove('selected');
        selectedSquare = null;
    }
}

// Basic move validation (very simplified for demonstration)
function isValidMove(fromR, fromC, toR, toC) {
    const piece = board[fromR][fromC];
    if (!piece) return false;

    // For demonstration, let's just allow pawns to move one square forward
    // This is NOT a complete chess validation!
    if (piece.toLowerCase() === 'p') {
        const direction = (piece === 'P') ? -1 : 1; // White pawns move up (decreasing rank), black move down
        const startRank = (piece === 'P') ? 6 : 1; // White pawns start on rank 2 (index 6), black on rank 7 (index 1)

        // Single step forward
        if (toC === fromC && toR === fromR + direction && !board[toR][toC]) {
            return true;
        }
        // Initial double step forward
        if (toC === fromC && fromR === startRank && toR === fromR + (2 * direction) && !board[toR][toC] && !board[fromR + direction][fromC]) {
            return true;
        }
        // Basic capture (diagonal) - extremely simplified, only if target has a piece
        if (Math.abs(toC - fromC) === 1 && toR === fromR + direction && board[toR][toC] && isOpponentPiece(board[toR][toC], piece)) {
             return true;
        }
    }
    // All other pieces or complex moves would need specific rules here
    // For now, let's allow any move if it matches a hardcoded cheater move
    if (currentPlayer === 'white') { // Assuming white is the cheater
        const currentMove = CHEATER_MOVES[cheaterMoveIndex];
        if (currentMove) {
            const fromId = `${String.fromCharCode(97 + fromC)}${8 - fromR}`;
            const toId = `${String.fromCharCode(97 + toC)}${8 - toR}`;
            if (currentMove.from === fromId && currentMove.to === toId) {
                return true; // It's a valid cheater move
            }
        }
    }

    // For black, we'll allow any move for demonstration simplicity after they make a move
    // In a real game, this would be full validation.
    if (currentPlayer === 'black' && piece) {
        // Placeholder for real black move validation. For now, we allow any single step.
        // This is extremely lenient to allow black to move.
        if (Math.abs(toR - fromR) <= 2 && Math.abs(toC - fromC) <= 2 && (toR !== fromR || toC !== fromC)) {
            return true;
        }
    }

    return false; // Default to false if not a recognized valid move
}


function isPieceOfCurrentPlayer(pieceCode) {
    if (currentPlayer === 'white') {
        return pieceCode === pieceCode.toUpperCase(); // Uppercase for white
    } else {
        return pieceCode === pieceCode.toLowerCase(); // Lowercase for black
    }
}

function isOpponentPiece(targetPiece, movingPiece) {
    if (!targetPiece) return false;
    const isMovingPieceWhite = movingPiece === movingPiece.toUpperCase();
    const isTargetPieceWhite = targetPiece === targetPiece.toUpperCase();
    return isMovingPieceWhite !== isTargetPieceWhite;
}


function makeMove(fromR, fromC, toR, toC) {
    board[toR][toC] = board[fromR][fromC]; // Move piece
    board[fromR][fromC] = ''; // Clear original square
    renderBoard();

    // If the cheater (white) just made a move, advance the cheaterMoveIndex
    if (currentPlayer === 'white') {
        cheaterMoveIndex++;
    }
}

function switchPlayer() {
    currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
}

// Update the AI suggestion bar
function updateAiSuggestion() {
    aiSuggestionDisplay.classList.remove('visible'); // Hide initially with low opacity

    // Only show suggestions for the cheater (white)
    if (currentPlayer === 'white') {
        const nextCheaterMove = CHEATER_MOVES[cheaterMoveIndex];
        if (nextCheaterMove) {
            const pieceCode = board[8 - parseInt(nextCheaterMove.from[1])][nextCheaterMove.from.charCodeAt(0) - 97];
            if (pieceCode) {
                 const pieceLogo = PIECES[pieceCode];
                 aiSuggestionDisplay.textContent = `${pieceLogo}, ${nextCheaterMove.from}, ${nextCheaterMove.to}`;
                 // Make it visible with a delay for the opacity transition
                 setTimeout(() => {
                    aiSuggestionDisplay.classList.add('visible');
                 }, 100); // Short delay to ensure class is removed before adding again
            } else {
                 aiSuggestionDisplay.textContent = `AI: No piece at ${nextCheaterMove.from}`; // Should not happen with correct data
                 aiSuggestionDisplay.classList.add('visible');
            }
        } else {
            aiSuggestionDisplay.textContent = 'AI: No more genius moves defined.';
            aiSuggestionDisplay.classList.add('visible');
        }
    } else {
        aiSuggestionDisplay.textContent = 'Opponent\'s Turn...'; // No suggestion for black
        // Keep opponent's turn message visible with full opacity
        setTimeout(() => {
            aiSuggestionDisplay.classList.add('visible');
        }, 100);
    }
}

// Reset game button
resetButton.addEventListener('click', initializeBoard);

// Initial setup
initializeBoard();
