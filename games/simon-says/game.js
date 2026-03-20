(() => {
  "use strict";

  // ---- DOM Elements ----
  const pads = {
    green: document.getElementById("pad-green"),
    red: document.getElementById("pad-red"),
    yellow: document.getElementById("pad-yellow"),
    blue: document.getElementById("pad-blue"),
  };
  const startBtn = document.getElementById("start-btn");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("high-score");
  const statusEl = document.getElementById("status");
  const overlay = document.getElementById("overlay");
  const finalScoreEl = document.getElementById("final-score");
  const newRecordEl = document.getElementById("new-record");
  const restartBtn = document.getElementById("restart-btn");

  // ---- Audio (Web Audio API) ----
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  const FREQUENCIES = {
    green: 392.00,  // G4
    red: 329.63,    // E4
    yellow: 261.63, // C4
    blue: 440.00,   // A4
  };

  const ERROR_FREQ = 110; // low buzz for wrong answer

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration) {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playErrorTone() {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = ERROR_FREQ;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  }

  // ---- Game State ----
  const COLORS = ["green", "red", "yellow", "blue"];
  let sequence = [];
  let playerIndex = 0;
  let round = 0;
  let playing = false;   // true while computer is showing sequence
  let accepting = false; // true while waiting for player input
  let highScore = parseInt(localStorage.getItem("simon-high-score")) || 0;

  highScoreEl.textContent = highScore;

  // ---- Speed Curve ----
  function getInterval() {
    // Starts at 600ms, decreases to a floor of 250ms
    return Math.max(250, 600 - round * 25);
  }

  function getLitDuration() {
    return getInterval() * 0.55;
  }

  // ---- Visual Helpers ----
  function lightUp(color) {
    const pad = pads[color];
    pad.classList.add("lit");
    setTimeout(() => pad.classList.remove("lit"), getLitDuration());
  }

  function setPadsDisabled(disabled) {
    for (const pad of Object.values(pads)) {
      if (disabled) {
        pad.classList.add("disabled");
      } else {
        pad.classList.remove("disabled");
      }
    }
  }

  // ---- Core Game Logic ----
  function addToSequence() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    sequence.push(color);
  }

  function playSequence() {
    playing = true;
    accepting = false;
    setPadsDisabled(true);
    statusEl.textContent = "見てください...";
    let i = 0;
    const interval = getInterval();

    const timer = setInterval(() => {
      if (i >= sequence.length) {
        clearInterval(timer);
        playing = false;
        accepting = true;
        setPadsDisabled(false);
        playerIndex = 0;
        statusEl.textContent = "あなたの番です!";
        return;
      }
      const color = sequence[i];
      lightUp(color);
      playTone(FREQUENCIES[color], getLitDuration() / 1000);
      i++;
    }, interval);
  }

  function nextRound() {
    round++;
    scoreEl.textContent = round;
    addToSequence();
    setTimeout(() => playSequence(), 500);
  }

  function startGame() {
    sequence = [];
    round = 0;
    playerIndex = 0;
    scoreEl.textContent = "0";
    overlay.classList.add("hidden");
    startBtn.disabled = true;
    nextRound();
  }

  function gameOver() {
    accepting = false;
    setPadsDisabled(true);
    playErrorTone();

    // Flash all pads
    for (const pad of Object.values(pads)) {
      pad.classList.add("lit");
    }
    setTimeout(() => {
      for (const pad of Object.values(pads)) {
        pad.classList.remove("lit");
      }
    }, 600);

    let isNewRecord = false;
    if (round > highScore) {
      highScore = round;
      localStorage.setItem("simon-high-score", highScore);
      highScoreEl.textContent = highScore;
      isNewRecord = true;
    }

    setTimeout(() => {
      finalScoreEl.textContent = round;
      if (isNewRecord) {
        newRecordEl.classList.remove("hidden");
      } else {
        newRecordEl.classList.add("hidden");
      }
      overlay.classList.remove("hidden");
      startBtn.disabled = false;
      statusEl.textContent = "スタートを押してください";
    }, 800);
  }

  function handlePadClick(color) {
    if (!accepting) return;

    lightUp(color);
    playTone(FREQUENCIES[color], getLitDuration() / 1000);

    if (color !== sequence[playerIndex]) {
      gameOver();
      return;
    }

    playerIndex++;

    if (playerIndex === sequence.length) {
      accepting = false;
      setPadsDisabled(true);
      statusEl.textContent = "正解!";
      setTimeout(() => nextRound(), 800);
    }
  }

  // ---- Event Listeners ----
  for (const [color, pad] of Object.entries(pads)) {
    pad.addEventListener("click", () => handlePadClick(color));
  }

  startBtn.addEventListener("click", () => {
    ensureAudio();
    startGame();
  });

  restartBtn.addEventListener("click", () => {
    ensureAudio();
    startGame();
  });

  // ---- Keyboard support (G, R, Y, B) ----
  const KEY_MAP = { g: "green", r: "red", y: "yellow", b: "blue" };

  document.addEventListener("keydown", (e) => {
    const color = KEY_MAP[e.key.toLowerCase()];
    if (color && accepting) {
      handlePadClick(color);
    }
    if (e.key === " " || e.key === "Enter") {
      if (!startBtn.disabled) {
        ensureAudio();
        startGame();
      }
    }
  });
})();
