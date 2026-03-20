/* ===== Pomodoro Timer App ===== */
(function () {
  "use strict";

  // ---- Constants ----
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 105; // r=105 in SVG
  const STORAGE_KEY_SETTINGS = "pomodoro_settings";
  const STORAGE_KEY_STATS = "pomodoro_stats";

  // ---- Default settings ----
  const DEFAULTS = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    volume: 70,
  };

  // ---- Mode labels ----
  const MODE_LABELS = {
    pomodoro: "作業",
    shortBreak: "短い休憩",
    longBreak: "長い休憩",
  };

  // ---- State ----
  let settings = loadSettings();
  let stats = loadStats();
  let currentMode = "pomodoro";
  let totalSeconds = settings.pomodoro * 60;
  let remainingSeconds = totalSeconds;
  let timerInterval = null;
  let isRunning = false;
  let sessionCount = 0; // completed pomodoros in current cycle (0-3)

  // ---- DOM references ----
  const timerDisplay = document.getElementById("timer-display");
  const timerLabel = document.getElementById("timer-label");
  const progressCircle = document.querySelector(".timer-progress");
  const btnStart = document.getElementById("btn-start");
  const btnPause = document.getElementById("btn-pause");
  const btnReset = document.getElementById("btn-reset");
  const modeTabs = document.querySelectorAll(".mode-tab");
  const sessionDots = document.querySelectorAll(".session-dot");
  const sessionCountEl = document.getElementById("session-count");
  const taskInput = document.getElementById("task-input");
  const statPomodoros = document.getElementById("stat-pomodoros");
  const statMinutes = document.getElementById("stat-minutes");
  const btnSettings = document.getElementById("btn-settings");
  const settingsPanel = document.getElementById("settings-panel");
  const btnSaveSettings = document.getElementById("btn-save-settings");
  const settingPomodoro = document.getElementById("setting-pomodoro");
  const settingShort = document.getElementById("setting-short");
  const settingLong = document.getElementById("setting-long");
  const settingVolume = document.getElementById("setting-volume");

  // ---- LocalStorage helpers ----
  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS));
      return saved ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function loadStats() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_STATS)) || {};
      const key = todayKey();
      if (!saved[key]) saved[key] = { pomodoros: 0, minutes: 0 };
      return saved;
    } catch {
      const key = todayKey();
      return { [key]: { pomodoros: 0, minutes: 0 } };
    }
  }

  function saveStats() {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }

  function todayStats() {
    const key = todayKey();
    if (!stats[key]) stats[key] = { pomodoros: 0, minutes: 0 };
    return stats[key];
  }

  // ---- Audio notification (Web Audio API) ----
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const vol = ctx.createGain();
      vol.gain.value = settings.volume / 100;
      vol.connect(ctx.destination);

      // Three ascending beeps
      [0, 0.25, 0.5].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 660 + i * 220;
        osc.connect(vol);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.18);
      });
    } catch {
      // Audio not available; silently skip
    }
  }

  // ---- Timer display helpers ----
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
    const fraction = 1 - remainingSeconds / totalSeconds;
    const offset = fraction * CIRCLE_CIRCUMFERENCE;
    progressCircle.style.strokeDashoffset = offset;
    document.title = `${formatTime(remainingSeconds)} - ${MODE_LABELS[currentMode]}`;
  }

  function updateProgressColor() {
    progressCircle.classList.remove("short-break", "long-break");
    if (currentMode === "shortBreak") progressCircle.classList.add("short-break");
    if (currentMode === "longBreak") progressCircle.classList.add("long-break");
  }

  function updateSessionDots() {
    sessionDots.forEach((dot, i) => {
      dot.classList.toggle("filled", i < sessionCount);
    });
    sessionCountEl.textContent = sessionCount;
  }

  function updateStats() {
    const ts = todayStats();
    statPomodoros.textContent = ts.pomodoros;
    statMinutes.textContent = ts.minutes;
  }

  // ---- Mode switching ----
  function setMode(mode) {
    if (isRunning) stopTimer();

    currentMode = mode;
    const durations = {
      pomodoro: settings.pomodoro,
      shortBreak: settings.shortBreak,
      longBreak: settings.longBreak,
    };
    totalSeconds = durations[mode] * 60;
    remainingSeconds = totalSeconds;

    timerLabel.textContent = MODE_LABELS[mode];

    modeTabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.mode === mode);
    });

    updateProgressColor();
    updateDisplay();
    resetButtons();
  }

  // ---- Timer control ----
  function startTimer() {
    if (isRunning) return;
    isRunning = true;

    btnStart.disabled = true;
    btnPause.disabled = false;

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateDisplay();

      if (remainingSeconds <= 0) {
        stopTimer();
        onTimerComplete();
      }
    }, 1000);
  }

  function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function pauseTimer() {
    stopTimer();
    btnStart.disabled = false;
    btnPause.disabled = true;
  }

  function resetTimer() {
    stopTimer();
    remainingSeconds = totalSeconds;
    updateDisplay();
    resetButtons();
  }

  function resetButtons() {
    btnStart.disabled = false;
    btnPause.disabled = true;
  }

  function onTimerComplete() {
    playBeep();

    if (currentMode === "pomodoro") {
      // Record completed pomodoro
      sessionCount++;
      const ts = todayStats();
      ts.pomodoros++;
      ts.minutes += settings.pomodoro;
      saveStats();
      updateSessionDots();
      updateStats();

      // Decide next mode
      if (sessionCount >= 4) {
        sessionCount = 0;
        updateSessionDots();
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      // After break, go back to pomodoro
      setMode("pomodoro");
    }

    resetButtons();
  }

  // ---- Settings ----
  function populateSettingsUI() {
    settingPomodoro.value = settings.pomodoro;
    settingShort.value = settings.shortBreak;
    settingLong.value = settings.longBreak;
    settingVolume.value = settings.volume;
  }

  function applySettings() {
    settings.pomodoro = clamp(parseInt(settingPomodoro.value, 10) || 25, 1, 120);
    settings.shortBreak = clamp(parseInt(settingShort.value, 10) || 5, 1, 30);
    settings.longBreak = clamp(parseInt(settingLong.value, 10) || 15, 1, 60);
    settings.volume = clamp(parseInt(settingVolume.value, 10) || 70, 0, 100);
    saveSettings();
    setMode(currentMode); // re-apply duration
    settingsPanel.classList.add("hidden");
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  // ---- Event listeners ----
  btnStart.addEventListener("click", startTimer);
  btnPause.addEventListener("click", pauseTimer);
  btnReset.addEventListener("click", resetTimer);

  modeTabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });

  btnSettings.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
    if (!settingsPanel.classList.contains("hidden")) {
      populateSettingsUI();
    }
  });

  btnSaveSettings.addEventListener("click", applySettings);

  // Save task name to localStorage on change
  taskInput.addEventListener("input", () => {
    localStorage.setItem("pomodoro_task", taskInput.value);
  });

  // ---- Keyboard shortcut: Space to toggle start/pause ----
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space") {
      e.preventDefault();
      if (isRunning) pauseTimer();
      else startTimer();
    }
  });

  // ---- Init ----
  function init() {
    // Restore task name
    const savedTask = localStorage.getItem("pomodoro_task");
    if (savedTask) taskInput.value = savedTask;

    // Set initial SVG dasharray
    progressCircle.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
    progressCircle.style.strokeDashoffset = 0;

    populateSettingsUI();
    updateSessionDots();
    updateStats();
    setMode("pomodoro");
  }

  init();
})();
