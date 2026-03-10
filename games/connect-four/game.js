// Connect Four - Game Logic

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const RED = 1;
const YELLOW = 2;

let board = [];
let currentPlayer = RED;
let gameOver = false;
let mode = '2p'; // '2p' or 'ai'
let scores = { red: 0, yellow: 0, draw: 0 };
let animating = false;

// DOM elements
const boardEl = document.getElementById('board');
const hoverRowEl = document.getElementById('hover-row');
const statusEl = document.getElementById('status');
const scoreRedEl = document.getElementById('score-red');
const scoreYellowEl = document.getElementById('score-yellow');
const scoreDrawEl = document.getElementById('score-draw');

function init() {
  buildBoard();
  buildHoverRow();
  newGame();
}

function buildBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => onColumnClick(c));
      const piece = document.createElement('div');
      piece.classList.add('piece');
      cell.appendChild(piece);
      boardEl.appendChild(cell);
    }
  }
}

function buildHoverRow() {
  hoverRowEl.innerHTML = '';
  for (let c = 0; c < COLS; c++) {
    const indicator = document.createElement('div');
    indicator.classList.add('hover-indicator');
    indicator.addEventListener('mouseenter', () => showHover(c));
    indicator.addEventListener('mouseleave', () => hideHover(c));
    indicator.addEventListener('click', () => onColumnClick(c));
    hoverRowEl.appendChild(indicator);
  }
}

function showHover(col) {
  if (gameOver || animating) return;
  const indicator = hoverRowEl.children[col];
  indicator.classList.add('show');
  if (currentPlayer === YELLOW) {
    indicator.classList.add('yellow-turn');
  } else {
    indicator.classList.remove('yellow-turn');
  }
}

function hideHover(col) {
  const indicator = hoverRowEl.children[col];
  indicator.classList.remove('show');
}

function newGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  currentPlayer = RED;
  gameOver = false;
  animating = false;
  updateStatus();
  renderBoard();
}

function renderBoard() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = boardEl.children[r * COLS + c];
      const piece = cell.querySelector('.piece');
      piece.className = 'piece';
      cell.classList.remove('disabled');
      if (board[r][c] === RED) {
        piece.classList.add('red', 'drop');
      } else if (board[r][c] === YELLOW) {
        piece.classList.add('yellow', 'drop');
      }
    }
  }
}

function setMode(m) {
  mode = m;
  document.getElementById('btn-2p').classList.toggle('active', m === '2p');
  document.getElementById('btn-ai').classList.toggle('active', m === 'ai');
  newGame();
}

function onColumnClick(col) {
  if (gameOver || animating) return;
  if (mode === 'ai' && currentPlayer === YELLOW) return;

  dropPiece(col);
}

function dropPiece(col) {
  const row = getAvailableRow(col);
  if (row === -1) return;

  animating = true;
  board[row][col] = currentPlayer;

  const cell = boardEl.children[row * COLS + col];
  const piece = cell.querySelector('.piece');
  piece.className = 'piece';
  piece.classList.add(currentPlayer === RED ? 'red' : 'yellow');

  // Force reflow before adding animation class
  piece.offsetHeight;
  piece.classList.add('drop');

  hideHover(col);

  setTimeout(() => {
    animating = false;
    const winCells = checkWin(row, col);
    if (winCells) {
      handleWin(winCells);
      return;
    }

    if (checkDraw()) {
      handleDraw();
      return;
    }

    currentPlayer = currentPlayer === RED ? YELLOW : RED;
    updateStatus();

    if (mode === 'ai' && currentPlayer === YELLOW && !gameOver) {
      animating = true;
      setTimeout(() => {
        const aiCol = aiMove();
        animating = false;
        dropPiece(aiCol);
      }, 400);
    }
  }, 450);
}

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) return r;
  }
  return -1;
}

function checkWin(row, col) {
  const player = board[row][col];
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (const [dr, dc] of directions) {
    let cells = [[row, col]];

    // Check forward
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        cells.push([r, c]);
      } else break;
    }

    // Check backward
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        cells.push([r, c]);
      } else break;
    }

    if (cells.length >= 4) return cells;
  }

  return null;
}

function checkDraw() {
  return board[0].every(cell => cell !== EMPTY);
}

function handleWin(winCells) {
  gameOver = true;
  const winner = currentPlayer === RED ? '赤' : '黄';

  if (currentPlayer === RED) {
    scores.red++;
    scoreRedEl.textContent = scores.red;
  } else {
    scores.yellow++;
    scoreYellowEl.textContent = scores.yellow;
  }

  statusEl.textContent = `${winner}の勝ち！`;
  statusEl.className = 'status win ' + (currentPlayer === RED ? 'red-turn' : 'yellow-turn');

  // Highlight winning pieces
  for (const [r, c] of winCells) {
    const cell = boardEl.children[r * COLS + c];
    const piece = cell.querySelector('.piece');
    piece.classList.add('winning');
  }

  disableBoard();
}

function handleDraw() {
  gameOver = true;
  scores.draw++;
  scoreDrawEl.textContent = scores.draw;
  statusEl.textContent = '引き分け！';
  statusEl.className = 'status';
  disableBoard();
}

function disableBoard() {
  for (let i = 0; i < boardEl.children.length; i++) {
    boardEl.children[i].classList.add('disabled');
  }
}

function updateStatus() {
  if (gameOver) return;
  const name = currentPlayer === RED ? '赤' : '黄';
  statusEl.textContent = `${name}のターン`;
  statusEl.className = 'status ' + (currentPlayer === RED ? 'red-turn' : 'yellow-turn');
}

// ----- AI -----

function aiMove() {
  // 1. Win if possible
  for (let c = 0; c < COLS; c++) {
    const r = getAvailableRow(c);
    if (r === -1) continue;
    board[r][c] = YELLOW;
    if (checkWin(r, c)) {
      board[r][c] = EMPTY;
      return c;
    }
    board[r][c] = EMPTY;
  }

  // 2. Block opponent win
  for (let c = 0; c < COLS; c++) {
    const r = getAvailableRow(c);
    if (r === -1) continue;
    board[r][c] = RED;
    if (checkWin(r, c)) {
      board[r][c] = EMPTY;
      return c;
    }
    board[r][c] = EMPTY;
  }

  // 3. Avoid moves that give opponent a win
  const safeCols = [];
  for (let c = 0; c < COLS; c++) {
    const r = getAvailableRow(c);
    if (r === -1) continue;
    // Check if placing here lets opponent win above
    board[r][c] = YELLOW;
    let givesWin = false;
    if (r - 1 >= 0) {
      board[r - 1][c] = RED;
      if (checkWin(r - 1, c)) givesWin = true;
      board[r - 1][c] = EMPTY;
    }
    board[r][c] = EMPTY;
    if (!givesWin) safeCols.push(c);
  }

  const candidates = safeCols.length > 0 ? safeCols : getAvailableCols();

  // 4. Prefer center columns
  const scored = candidates.map(c => {
    let score = 0;
    // Center preference
    score += (3 - Math.abs(c - 3)) * 3;
    // Count adjacent friendly pieces
    const r = getAvailableRow(c);
    if (r !== -1) {
      board[r][c] = YELLOW;
      score += countThreats(r, c, YELLOW) * 2;
      board[r][c] = EMPTY;
    }
    return { col: c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  // Pick from top moves with some randomness
  const topScore = scored[0].score;
  const topMoves = scored.filter(s => s.score >= topScore - 1);
  return topMoves[Math.floor(Math.random() * topMoves.length)].col;
}

function getAvailableCols() {
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === EMPTY) cols.push(c);
  }
  return cols;
}

function countThreats(row, col, player) {
  let threats = 0;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) count++;
      else break;
    }
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) count++;
      else break;
    }
    if (count >= 3) threats++;
  }
  return threats;
}

// Start
init();
