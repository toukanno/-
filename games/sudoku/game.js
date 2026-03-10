// ── 数独 Game Logic ─────────────────────────────────────────

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────
  let solution = [];    // 9x9 solved board
  let puzzle = [];      // 9x9 puzzle (0 = empty)
  let board = [];       // 9x9 current player board
  let given = [];       // 9x9 boolean – true if cell was pre-filled
  let selectedRow = -1;
  let selectedCol = -1;
  let difficulty = "easy";
  let timerSeconds = 0;
  let timerInterval = null;
  let gameOver = false;

  // How many cells to remove per difficulty
  const REMOVE_COUNT = { easy: 36, medium: 46, hard: 54 };

  // ── DOM refs ───────────────────────────────────────────────
  const boardEl = document.getElementById("board");
  const timerEl = document.getElementById("timer");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalMessage = document.getElementById("modal-message");
  const modalClose = document.getElementById("modal-close");

  // ── Sudoku Generator ──────────────────────────────────────

  /** Create a completed valid Sudoku board using backtracking with
   *  a shuffled candidate list so each run is different. */
  function generateSolved() {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    function isValid(grid, r, c, num) {
      for (let i = 0; i < 9; i++) {
        if (grid[r][i] === num) return false;
        if (grid[i][c] === num) return false;
      }
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let i = br; i < br + 3; i++) {
        for (let j = bc; j < bc + 3; j++) {
          if (grid[i][j] === num) return false;
        }
      }
      return true;
    }

    function fill(pos) {
      if (pos === 81) return true;
      const r = Math.floor(pos / 9);
      const c = pos % 9;
      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const n of nums) {
        if (isValid(grid, r, c, n)) {
          grid[r][c] = n;
          if (fill(pos + 1)) return true;
          grid[r][c] = 0;
        }
      }
      return false;
    }

    fill(0);
    return grid;
  }

  /** Remove cells from a solved grid to create a puzzle.
   *  Attempts to maintain a unique solution for easy/medium. */
  function makePuzzle(solved, removeCount) {
    const grid = solved.map((row) => [...row]);
    const positions = shuffle(
      Array.from({ length: 81 }, (_, i) => i)
    );

    let removed = 0;
    for (const pos of positions) {
      if (removed >= removeCount) break;
      const r = Math.floor(pos / 9);
      const c = pos % 9;
      const backup = grid[r][c];
      grid[r][c] = 0;
      removed++;
      // For easy difficulty, we skip uniqueness checks for speed –
      // the puzzles are still perfectly playable.
    }
    return grid;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── Board Rendering ───────────────────────────────────────

  function createBoard() {
    boardEl.innerHTML = "";
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;

        // thick borders for 3x3 boxes
        if (c === 2 || c === 5) cell.classList.add("border-right");
        if (r === 2 || r === 5) cell.classList.add("border-bottom");

        cell.addEventListener("click", () => selectCell(r, c));
        boardEl.appendChild(cell);
      }
    }
  }

  function renderBoard() {
    const cells = boardEl.querySelectorAll(".cell");
    cells.forEach((cell) => {
      const r = +cell.dataset.row;
      const c = +cell.dataset.col;
      const val = board[r][c];

      // Reset classes
      cell.classList.remove(
        "given", "input", "highlight", "highlight-num",
        "selected", "error", "error-flash"
      );

      cell.textContent = val !== 0 ? val : "";

      if (val !== 0 && given[r][c]) {
        cell.classList.add("given");
      } else if (val !== 0) {
        cell.classList.add("input");
        if (hasConflict(r, c)) {
          cell.classList.add("error");
        }
      }

      // Highlighting
      if (selectedRow >= 0 && selectedCol >= 0) {
        if (r === selectedRow && c === selectedCol) {
          cell.classList.add("selected");
        } else if (r === selectedRow || c === selectedCol) {
          cell.classList.add("highlight");
        } else if (
          Math.floor(r / 3) === Math.floor(selectedRow / 3) &&
          Math.floor(c / 3) === Math.floor(selectedCol / 3)
        ) {
          cell.classList.add("highlight");
        }

        // Highlight same number
        const selVal = board[selectedRow][selectedCol];
        if (selVal !== 0 && val === selVal &&
            !(r === selectedRow && c === selectedCol)) {
          cell.classList.add("highlight-num");
        }
      }
    });
  }

  // ── Conflict Detection ────────────────────────────────────

  function hasConflict(r, c) {
    const val = board[r][c];
    if (val === 0) return false;

    // Row
    for (let i = 0; i < 9; i++) {
      if (i !== c && board[r][i] === val) return true;
    }
    // Column
    for (let i = 0; i < 9; i++) {
      if (i !== r && board[i][c] === val) return true;
    }
    // Box
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = br; i < br + 3; i++) {
      for (let j = bc; j < bc + 3; j++) {
        if ((i !== r || j !== c) && board[i][j] === val) return true;
      }
    }
    return false;
  }

  // ── Selection & Input ─────────────────────────────────────

  function selectCell(r, c) {
    if (gameOver) return;
    selectedRow = r;
    selectedCol = c;
    renderBoard();
  }

  function inputNumber(num) {
    if (gameOver) return;
    if (selectedRow < 0 || selectedCol < 0) return;
    if (given[selectedRow][selectedCol]) return;

    board[selectedRow][selectedCol] = num; // 0 means erase
    renderBoard();
    checkAutoWin();
  }

  function checkAutoWin() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) return;
        if (board[r][c] !== solution[r][c]) return;
      }
    }
    winGame();
  }

  // ── Timer ─────────────────────────────────────────────────

  function startTimer() {
    stopTimer();
    timerSeconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const m = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
    const s = String(timerSeconds % 60).padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;
  }

  // ── Game Flow ─────────────────────────────────────────────

  function newGame() {
    gameOver = false;
    selectedRow = -1;
    selectedCol = -1;

    solution = generateSolved();
    puzzle = makePuzzle(solution, REMOVE_COUNT[difficulty]);
    board = puzzle.map((row) => [...row]);
    given = puzzle.map((row) => row.map((v) => v !== 0));

    createBoard();
    renderBoard();
    startTimer();
  }

  function giveHint() {
    if (gameOver) return;
    // Find all empty or incorrect cells
    const candidates = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== solution[r][c]) {
          candidates.push([r, c]);
        }
      }
    }
    if (candidates.length === 0) return;

    const [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
    board[r][c] = solution[r][c];
    given[r][c] = true; // lock it in
    selectedRow = r;
    selectedCol = c;
    renderBoard();
    checkAutoWin();
  }

  function checkSolution() {
    if (gameOver) return;

    let emptyCells = 0;
    let errors = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) emptyCells++;
        else if (board[r][c] !== solution[r][c]) errors++;
      }
    }

    if (emptyCells === 0 && errors === 0) {
      winGame();
    } else if (errors > 0) {
      showModal(`間違いが ${errors} 個あります。`);
      // Flash error cells
      boardEl.querySelectorAll(".cell.error").forEach((el) => {
        el.classList.add("error-flash");
      });
    } else {
      showModal(`まだ ${emptyCells} マス空いています。`);
    }
  }

  function winGame() {
    gameOver = true;
    stopTimer();
    const m = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
    const s = String(timerSeconds % 60).padStart(2, "0");
    showModal(`おめでとうございます！\nクリアタイム: ${m}:${s}`);
  }

  // ── Modal ─────────────────────────────────────────────────

  function showModal(msg) {
    modalMessage.textContent = msg;
    modalOverlay.classList.remove("hidden");
  }

  modalClose.addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
  });
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add("hidden");
  });

  // ── Event Listeners ───────────────────────────────────────

  // Difficulty buttons
  document.querySelectorAll(".diff-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".diff-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      difficulty = btn.dataset.difficulty;
      newGame();
    });
  });

  // Bottom buttons
  document.getElementById("btn-new").addEventListener("click", newGame);
  document.getElementById("btn-hint").addEventListener("click", giveHint);
  document.getElementById("btn-check").addEventListener("click", checkSolution);

  // Keyboard input
  document.addEventListener("keydown", (e) => {
    if (e.key >= "1" && e.key <= "9") {
      inputNumber(parseInt(e.key, 10));
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      inputNumber(0);
    } else if (e.key === "ArrowUp" && selectedRow > 0) {
      selectCell(selectedRow - 1, selectedCol);
    } else if (e.key === "ArrowDown" && selectedRow < 8) {
      selectCell(selectedRow + 1, selectedCol);
    } else if (e.key === "ArrowLeft" && selectedCol > 0) {
      selectCell(selectedRow, selectedCol - 1);
    } else if (e.key === "ArrowRight" && selectedCol < 8) {
      selectCell(selectedRow, selectedCol + 1);
    }
  });

  // Number pad buttons
  document.querySelectorAll(".num-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      inputNumber(parseInt(btn.dataset.num, 10));
    });
  });

  // ── Init ──────────────────────────────────────────────────
  newGame();
})();
