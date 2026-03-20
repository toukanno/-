(function () {
  "use strict";

  // --- DOM refs ---
  const boardEl = document.getElementById("board");
  const moveCountEl = document.getElementById("move-count");
  const timerEl = document.getElementById("timer");
  const bestMovesEl = document.getElementById("best-moves");
  const bestTimeEl = document.getElementById("best-time");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const winOverlay = document.getElementById("win-overlay");
  const winStats = document.getElementById("win-stats");
  const winClose = document.getElementById("win-close");
  const sizeBtns = document.querySelectorAll(".size-btn");

  // --- State ---
  let size = 4;
  let tiles = []; // 1-d array, 0 = empty
  let moves = 0;
  let seconds = 0;
  let timerInterval = null;
  let started = false;
  let won = false;

  // --- Helpers ---
  function goalState() {
    const g = [];
    for (let i = 1; i < size * size; i++) g.push(i);
    g.push(0);
    return g;
  }

  function isSolved() {
    const g = goalState();
    return tiles.every((v, i) => v === g[i]);
  }

  // Count inversions (ignoring empty tile)
  function countInversions(arr) {
    let inv = 0;
    const nums = arr.filter((v) => v !== 0);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        if (nums[i] > nums[j]) inv++;
      }
    }
    return inv;
  }

  function isSolvable(arr) {
    const inv = countInversions(arr);
    if (size % 2 === 1) {
      // Odd grid: solvable when inversions are even
      return inv % 2 === 0;
    }
    // Even grid: solvable when (inversions + row of blank from bottom) is even
    const blankIdx = arr.indexOf(0);
    const blankRowFromBottom = size - Math.floor(blankIdx / size);
    return (inv + blankRowFromBottom) % 2 === 0;
  }

  function shuffle() {
    const n = size * size;
    do {
      tiles = goalState();
      // Fisher-Yates
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
    } while (!isSolvable(tiles) || isSolved());
  }

  // --- Timer ---
  function startTimer() {
    if (timerInterval) return;
    seconds = 0;
    timerEl.textContent = "00:00";
    timerInterval = setInterval(() => {
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function formatTime(s) {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  }

  // --- Best records ---
  function storageKey() {
    return `puzzle-15-best-${size}`;
  }

  function loadBest() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return null;
  }

  function saveBest(movesVal, timeVal) {
    const prev = loadBest() || { moves: Infinity, time: Infinity };
    const updated = {
      moves: Math.min(prev.moves, movesVal),
      time: Math.min(prev.time, timeVal),
    };
    localStorage.setItem(storageKey(), JSON.stringify(updated));
  }

  function displayBest() {
    const best = loadBest();
    if (best) {
      bestMovesEl.textContent = best.moves === Infinity ? "-" : best.moves;
      bestTimeEl.textContent =
        best.time === Infinity ? "-" : formatTime(best.time);
    } else {
      bestMovesEl.textContent = "-";
      bestTimeEl.textContent = "-";
    }
  }

  // --- Rendering ---
  function render() {
    boardEl.innerHTML = "";
    const gap = 4; // px, matches CSS --tile-gap
    const totalGap = gap * 2; // padding on board
    // Tile size will be calculated via CSS custom properties
    boardEl.style.setProperty("--grid-size", size);

    tiles.forEach((val, idx) => {
      if (val === 0) return;
      const row = Math.floor(idx / size);
      const col = idx % size;

      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.value = val;
      tile.textContent = val;

      // Check if tile is in correct position
      if (val === idx + 1) tile.classList.add("correct");

      // Size and position via calc
      const tileSize = `calc((100% - ${totalGap}px - ${(size - 1) * gap}px) / ${size})`;
      tile.style.width = tileSize;
      tile.style.height = tileSize;
      tile.style.left = `calc(${gap}px + ${col} * (${tileSize} + ${gap}px))`;
      tile.style.top = `calc(${gap}px + ${row} * (${tileSize} + ${gap}px))`;
      tile.style.fontSize = size <= 3 ? "1.8rem" : size <= 4 ? "1.4rem" : "1.1rem";

      tile.addEventListener("click", () => handleTileClick(idx));
      boardEl.appendChild(tile);
    });
  }

  // --- Movement ---
  function emptyIndex() {
    return tiles.indexOf(0);
  }

  function getNeighbors(idx) {
    const row = Math.floor(idx / size);
    const col = idx % size;
    const neighbors = [];
    if (row > 0) neighbors.push(idx - size); // up
    if (row < size - 1) neighbors.push(idx + size); // down
    if (col > 0) neighbors.push(idx - 1); // left
    if (col < size - 1) neighbors.push(idx + 1); // right
    return neighbors;
  }

  function moveTile(tileIdx) {
    const empty = emptyIndex();
    if (!getNeighbors(empty).includes(tileIdx)) return false;

    [tiles[empty], tiles[tileIdx]] = [tiles[tileIdx], tiles[empty]];
    moves++;
    moveCountEl.textContent = moves;

    if (!started) {
      started = true;
      startTimer();
    }

    render();

    if (isSolved()) {
      won = true;
      stopTimer();
      saveBest(moves, seconds);
      displayBest();
      showWin();
    }

    return true;
  }

  function handleTileClick(idx) {
    if (won) return;
    moveTile(idx);
  }

  // --- Arrow keys ---
  // Arrow moves the blank space, so arrow-right means blank goes right
  // which means the tile to the right of blank slides left into blank
  document.addEventListener("keydown", (e) => {
    if (won) return;
    const empty = emptyIndex();
    const row = Math.floor(empty / size);
    const col = empty % size;
    let target = -1;

    switch (e.key) {
      case "ArrowUp":
        if (row < size - 1) target = empty + size;
        break;
      case "ArrowDown":
        if (row > 0) target = empty - size;
        break;
      case "ArrowLeft":
        if (col < size - 1) target = empty + 1;
        break;
      case "ArrowRight":
        if (col > 0) target = empty - 1;
        break;
      default:
        return;
    }

    if (target >= 0) {
      e.preventDefault();
      moveTile(target);
    }
  });

  // --- Win celebration ---
  function showWin() {
    winStats.innerHTML = `手数: <strong>${moves}</strong><br>タイム: <strong>${formatTime(seconds)}</strong>`;
    winOverlay.classList.remove("hidden");
    spawnConfetti();
  }

  winClose.addEventListener("click", () => {
    winOverlay.classList.add("hidden");
  });

  function spawnConfetti() {
    const colors = ["#e94560", "#ffd460", "#44bd32", "#0097e6", "#8c7ae6", "#e1b12c"];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement("div");
      el.className = "confetti";
      el.style.left = Math.random() * 100 + "vw";
      el.style.top = -10 + "px";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = 1.5 + Math.random() * 2 + "s";
      el.style.animationDelay = Math.random() * 0.8 + "s";
      el.style.width = 6 + Math.random() * 8 + "px";
      el.style.height = 6 + Math.random() * 8 + "px";
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
  }

  // --- Shuffle button ---
  shuffleBtn.addEventListener("click", () => {
    stopTimer();
    won = false;
    started = false;
    moves = 0;
    seconds = 0;
    moveCountEl.textContent = "0";
    timerEl.textContent = "00:00";
    winOverlay.classList.add("hidden");
    shuffle();
    render();
  });

  // --- Size selector ---
  sizeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      size = parseInt(btn.dataset.size, 10);
      stopTimer();
      won = false;
      started = false;
      moves = 0;
      seconds = 0;
      moveCountEl.textContent = "0";
      timerEl.textContent = "00:00";
      winOverlay.classList.add("hidden");
      displayBest();
      shuffle();
      render();
    });
  });

  // --- Init ---
  shuffle();
  render();
  displayBest();
})();
