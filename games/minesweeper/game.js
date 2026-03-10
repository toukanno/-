(() => {
    'use strict';

    const LEVELS = {
        beginner:     { cols: 9,  rows: 9,  mines: 10 },
        intermediate: { cols: 16, rows: 16, mines: 40 },
        expert:       { cols: 30, rows: 16, mines: 99 },
    };

    const SMILEY = { normal: '\u{1F642}', pressed: '\u{1F62E}', win: '\u{1F60E}', lose: '\u{1F635}' };

    let level = 'beginner';
    let cols, rows, totalMines;
    let board;          // 2D array: { mine, revealed, flagged, adjacentMines }
    let gameOver;
    let gameWon;
    let firstClick;
    let flagCount;
    let revealedCount;
    let timerInterval;
    let seconds;

    const boardEl    = document.getElementById('board');
    const mineCtEl   = document.getElementById('mine-counter');
    const timerEl    = document.getElementById('timer');
    const smileyEl   = document.getElementById('smiley');
    const messageEl  = document.getElementById('message');
    const diffBtns   = document.querySelectorAll('.diff-btn');

    // ---- Initialisation ----

    function init() {
        const cfg = LEVELS[level];
        cols = cfg.cols;
        rows = cfg.rows;
        totalMines = cfg.mines;

        gameOver = false;
        gameWon = false;
        firstClick = true;
        flagCount = 0;
        revealedCount = 0;
        seconds = 0;
        clearInterval(timerInterval);
        timerInterval = null;

        board = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                mine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0,
            }))
        );

        smileyEl.textContent = SMILEY.normal;
        messageEl.textContent = '';
        updateMineCounter();
        timerEl.textContent = '000';

        renderBoard();
    }

    function placeMines(safeR, safeC) {
        // Exclude the 3x3 area around the first click
        const forbidden = new Set();
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = safeR + dr;
                const nc = safeC + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    forbidden.add(nr * cols + nc);
                }
            }
        }

        let placed = 0;
        while (placed < totalMines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (!board[r][c].mine && !forbidden.has(r * cols + c)) {
                board[r][c].mine = true;
                placed++;
            }
        }

        // Compute adjacency counts
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].mine) continue;
                let count = 0;
                forNeighbours(r, c, (nr, nc) => {
                    if (board[nr][nc].mine) count++;
                });
                board[r][c].adjacentMines = count;
            }
        }
    }

    // ---- Rendering ----

    function renderBoard() {
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${cols}, auto)`;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.r = r;
                cell.dataset.c = c;

                cell.addEventListener('click', onLeftClick);
                cell.addEventListener('contextmenu', onRightClick);

                // Touch: long press to flag
                let longTimer = null;
                let moved = false;
                cell.addEventListener('touchstart', (e) => {
                    moved = false;
                    longTimer = setTimeout(() => {
                        e.preventDefault();
                        toggleFlag(r, c);
                        longTimer = null;
                    }, 400);
                }, { passive: false });
                cell.addEventListener('touchmove', () => { moved = true; clearTimeout(longTimer); });
                cell.addEventListener('touchend', (e) => {
                    if (longTimer !== null) {
                        clearTimeout(longTimer);
                        // Short tap – treat as left click
                    }
                });

                boardEl.appendChild(cell);
            }
        }
    }

    function updateCell(r, c) {
        const idx = r * cols + c;
        const el = boardEl.children[idx];
        const cell = board[r][c];

        el.className = 'cell';
        el.textContent = '';
        el.removeAttribute('data-num');

        if (cell.revealed) {
            el.classList.add('revealed');
            if (cell.mine) {
                el.textContent = '\u{1F4A3}';
                if (cell.hitMine) el.classList.add('mine-hit');
            } else if (cell.adjacentMines > 0) {
                el.textContent = cell.adjacentMines;
                el.dataset.num = cell.adjacentMines;
            }
        } else if (cell.flagged) {
            el.classList.add('flagged');
            // Wrong flag on game over
            if (gameOver && !gameWon && !cell.mine) {
                el.textContent = '\u274C';
                el.classList.add('revealed');
            }
        }
    }

    function updateMineCounter() {
        const remaining = totalMines - flagCount;
        const str = Math.abs(remaining).toString().padStart(3, '0');
        mineCtEl.textContent = remaining < 0 ? '-' + str.slice(1) : str;
    }

    // ---- Game logic ----

    function onLeftClick(e) {
        e.preventDefault();
        if (gameOver) return;
        const r = +this.dataset.r;
        const c = +this.dataset.c;
        revealCell(r, c);
    }

    function onRightClick(e) {
        e.preventDefault();
        if (gameOver) return;
        const r = +this.dataset.r;
        const c = +this.dataset.c;
        toggleFlag(r, c);
    }

    function revealCell(r, c) {
        const cell = board[r][c];
        if (cell.revealed || cell.flagged) return;

        if (firstClick) {
            firstClick = false;
            placeMines(r, c);
            startTimer();
        }

        cell.revealed = true;
        revealedCount++;

        if (cell.mine) {
            cell.hitMine = true;
            endGame(false);
            return;
        }

        updateCell(r, c);

        // Cascade reveal for empty cells
        if (cell.adjacentMines === 0) {
            forNeighbours(r, c, (nr, nc) => {
                revealCell(nr, nc);
            });
        }

        checkWin();
    }

    function toggleFlag(r, c) {
        const cell = board[r][c];
        if (cell.revealed) return;

        cell.flagged = !cell.flagged;
        flagCount += cell.flagged ? 1 : -1;
        updateMineCounter();
        updateCell(r, c);
    }

    function checkWin() {
        const safeCells = rows * cols - totalMines;
        if (revealedCount === safeCells) {
            endGame(true);
        }
    }

    function endGame(won) {
        gameOver = true;
        gameWon = won;
        clearInterval(timerInterval);

        if (won) {
            smileyEl.textContent = SMILEY.win;
            messageEl.textContent = '\u{1F389} \u30AF\u30EA\u30A2\uFF01\u304A\u3081\u3067\u3068\u3046\uFF01';
            // Auto-flag remaining mines
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (board[r][c].mine && !board[r][c].flagged) {
                        board[r][c].flagged = true;
                        flagCount++;
                        updateCell(r, c);
                    }
                }
            }
            updateMineCounter();
        } else {
            smileyEl.textContent = SMILEY.lose;
            messageEl.textContent = '\u{1F4A5} \u30B2\u30FC\u30E0\u30AA\u30FC\u30D0\u30FC\u2026';
            // Reveal all mines
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = board[r][c];
                    if (cell.mine && !cell.revealed) {
                        cell.revealed = true;
                        updateCell(r, c);
                    }
                    // Mark wrong flags
                    if (cell.flagged && !cell.mine) {
                        updateCell(r, c);
                    }
                }
            }
        }
    }

    // ---- Timer ----

    function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            seconds++;
            if (seconds > 999) seconds = 999;
            timerEl.textContent = seconds.toString().padStart(3, '0');
        }, 1000);
    }

    // ---- Helpers ----

    function forNeighbours(r, c, fn) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    fn(nr, nc);
                }
            }
        }
    }

    // ---- Event listeners ----

    smileyEl.addEventListener('click', init);

    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            level = btn.dataset.level;
            init();
        });
    });

    // Prevent context menu on board
    boardEl.addEventListener('contextmenu', e => e.preventDefault());

    // Start
    init();
})();
