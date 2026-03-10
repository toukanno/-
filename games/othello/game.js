// Othello / Reversi Game
(function () {
  'use strict';

  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;
  const SIZE = 8;
  const DIRECTIONS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  let board = [];
  let currentPlayer = BLACK;
  let gameOver = false;
  let aiMode = false;
  let animating = false;

  // DOM elements
  const boardEl = document.getElementById('board');
  const blackCountEl = document.getElementById('black-count');
  const whiteCountEl = document.getElementById('white-count');
  const turnIndicatorEl = document.getElementById('turn-indicator');
  const messageEl = document.getElementById('message');
  const newGameBtn = document.getElementById('new-game-btn');
  const modeRadios = document.querySelectorAll('input[name="mode"]');

  // Initialize
  function init() {
    board = [];
    for (let r = 0; r < SIZE; r++) {
      board[r] = [];
      for (let c = 0; c < SIZE; c++) {
        board[r][c] = EMPTY;
      }
    }
    // Starting position
    board[3][3] = WHITE;
    board[3][4] = BLACK;
    board[4][3] = BLACK;
    board[4][4] = WHITE;

    currentPlayer = BLACK;
    gameOver = false;
    animating = false;
    messageEl.textContent = '';

    aiMode = document.querySelector('input[name="mode"]:checked').value === 'ai';

    renderBoard();
    updateUI();
  }

  // Render the board
  function renderBoard() {
    boardEl.innerHTML = '';
    const validMoves = getValidMoves(board, currentPlayer);

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        if (board[r][c] !== EMPTY) {
          const piece = document.createElement('div');
          piece.className = 'piece ' + (board[r][c] === BLACK ? 'black' : 'white');
          cell.appendChild(piece);
        }

        if (!gameOver && validMoves.some(m => m[0] === r && m[1] === c)) {
          cell.classList.add('valid-move');
        }

        cell.addEventListener('click', () => onCellClick(r, c));
        boardEl.appendChild(cell);
      }
    }
  }

  // Handle cell click
  function onCellClick(row, col) {
    if (gameOver || animating) return;
    if (aiMode && currentPlayer === WHITE) return; // AI's turn

    const flips = getFlips(board, row, col, currentPlayer);
    if (flips.length === 0) return;

    makeMove(row, col, flips);
  }

  // Place a piece and animate flips
  function makeMove(row, col, flips) {
    animating = true;
    board[row][col] = currentPlayer;

    // Render board with new piece (placed animation)
    renderBoard();
    const cellIndex = row * SIZE + col;
    const placedPiece = boardEl.children[cellIndex].querySelector('.piece');
    if (placedPiece) {
      placedPiece.classList.add('placed');
    }

    // Animate flips after a short delay
    setTimeout(() => {
      const flipClass = currentPlayer === BLACK ? 'flip-to-black' : 'flip-to-white';
      flips.forEach(([fr, fc]) => {
        board[fr][fc] = currentPlayer;
        const idx = fr * SIZE + fc;
        const piece = boardEl.children[idx].querySelector('.piece');
        if (piece) {
          piece.className = 'piece ' + flipClass;
        }
      });

      // After flip animation completes
      setTimeout(() => {
        advanceTurn();
        animating = false;
      }, 520);
    }, 150);
  }

  // Advance to next turn, handling passes and game over
  function advanceTurn() {
    const opponent = currentPlayer === BLACK ? WHITE : BLACK;
    const opponentMoves = getValidMoves(board, opponent);
    const currentMoves = getValidMoves(board, currentPlayer);

    if (opponentMoves.length > 0) {
      currentPlayer = opponent;
      renderBoard();
      updateUI();

      // If AI mode and it's white's turn, trigger AI
      if (aiMode && currentPlayer === WHITE && !gameOver) {
        setTimeout(aiMove, 400);
      }
    } else if (currentMoves.length > 0) {
      // Opponent must pass
      const passName = opponent === BLACK ? '黒' : '白';
      messageEl.textContent = passName + 'はパスです';
      // Current player goes again
      renderBoard();
      updateUI();

      if (aiMode && currentPlayer === WHITE && !gameOver) {
        setTimeout(aiMove, 400);
      }
    } else {
      // Both players have no moves - game over
      gameOver = true;
      renderBoard();
      updateUI();
      announceWinner();
    }
  }

  // AI move (greedy: pick the move that flips the most pieces, with corner/edge preference)
  function aiMove() {
    if (gameOver || animating) return;

    const moves = getValidMoves(board, WHITE);
    if (moves.length === 0) return;

    // Weight corners and edges higher
    let bestMove = null;
    let bestScore = -1;

    for (const [r, c] of moves) {
      const flips = getFlips(board, r, c, WHITE);
      let score = flips.length;

      // Corner bonus
      if ((r === 0 || r === 7) && (c === 0 || c === 7)) {
        score += 50;
      }
      // Edge bonus
      else if (r === 0 || r === 7 || c === 0 || c === 7) {
        score += 5;
      }
      // Penalize cells adjacent to corners (C-squares and X-squares)
      if (isAdjacentToCorner(r, c)) {
        score -= 10;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = [r, c];
      }
    }

    if (bestMove) {
      const flips = getFlips(board, bestMove[0], bestMove[1], WHITE);
      makeMove(bestMove[0], bestMove[1], flips);
    }
  }

  function isAdjacentToCorner(r, c) {
    const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
    for (const [cr, cc] of corners) {
      if (board[cr][cc] === EMPTY) { // Only penalize if corner is empty
        if (Math.abs(r - cr) <= 1 && Math.abs(c - cc) <= 1 && !(r === cr && c === cc)) {
          return true;
        }
      }
    }
    return false;
  }

  // Get all valid moves for a player
  function getValidMoves(b, player) {
    const moves = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === EMPTY && getFlips(b, r, c, player).length > 0) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  }

  // Get list of pieces that would be flipped by placing at (row, col)
  function getFlips(b, row, col, player) {
    if (b[row][col] !== EMPTY) return [];

    const opponent = player === BLACK ? WHITE : BLACK;
    const allFlips = [];

    for (const [dr, dc] of DIRECTIONS) {
      const lineFlips = [];
      let r = row + dr;
      let c = col + dc;

      while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && b[r][c] === opponent) {
        lineFlips.push([r, c]);
        r += dr;
        c += dc;
      }

      if (lineFlips.length > 0 && r >= 0 && r < SIZE && c >= 0 && c < SIZE && b[r][c] === player) {
        allFlips.push(...lineFlips);
      }
    }

    return allFlips;
  }

  // Count pieces
  function countPieces() {
    let black = 0, white = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === BLACK) black++;
        else if (board[r][c] === WHITE) white++;
      }
    }
    return { black, white };
  }

  // Update score and turn indicator
  function updateUI() {
    const counts = countPieces();
    blackCountEl.textContent = counts.black;
    whiteCountEl.textContent = counts.white;

    turnIndicatorEl.classList.remove('black-turn', 'white-turn');
    if (!gameOver) {
      if (currentPlayer === BLACK) {
        turnIndicatorEl.textContent = '黒の番';
        turnIndicatorEl.classList.add('black-turn');
      } else {
        turnIndicatorEl.textContent = '白の番';
        turnIndicatorEl.classList.add('white-turn');
      }
    } else {
      turnIndicatorEl.textContent = 'ゲーム終了';
    }
  }

  // Announce the winner
  function announceWinner() {
    const counts = countPieces();
    let msg;
    if (counts.black > counts.white) {
      msg = '黒の勝ち! (' + counts.black + ' - ' + counts.white + ')';
    } else if (counts.white > counts.black) {
      msg = '白の勝ち! (' + counts.white + ' - ' + counts.black + ')';
    } else {
      msg = '引き分け! (' + counts.black + ' - ' + counts.white + ')';
    }
    messageEl.textContent = msg;
  }

  // Event listeners
  newGameBtn.addEventListener('click', init);
  modeRadios.forEach(radio => {
    radio.addEventListener('change', init);
  });

  // Start
  init();
})();
