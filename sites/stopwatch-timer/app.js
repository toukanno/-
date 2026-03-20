/* ==========================================================
   ストップウォッチ & タイマー  –  app.js
   ========================================================== */

(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const tabStopwatch = $('#tabStopwatch');
  const tabTimer = $('#tabTimer');
  const panelStopwatch = $('#stopwatch');
  const panelTimer = $('#timer');

  // Stopwatch
  const swDisplay = $('#stopwatchDisplay');
  const btnStartStop = $('#stopwatchStartStop');
  const btnLap = $('#stopwatchLap');
  const btnReset = $('#stopwatchReset');
  const lapsBody = $('#lapsBody');
  const lapsContainer = $('#lapsContainer');

  // Timer
  const timerSetup = $('#timerSetup');
  const timerDisplayContainer = $('#timerDisplayContainer');
  const timerDisplay = $('#timerDisplay');
  const btnTimerStartPause = $('#timerStartPause');
  const btnTimerReset = $('#timerReset');
  const wheelHours = $('#wheelHours');
  const wheelMinutes = $('#wheelMinutes');
  const wheelSeconds = $('#wheelSeconds');
  const progressFill = $('#progressFill');

  // Fullscreen
  const fullscreenBtn = $('#fullscreenBtn');
  const appEl = $('#app');

  // ── Tabs ──────────────────────────────────────────────────
  function switchTab(target) {
    $$('.tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.target === target);
      t.setAttribute('aria-selected', t.dataset.target === target);
    });
    $$('.panel').forEach((p) => {
      p.classList.toggle('active', p.id === target);
    });
  }

  tabStopwatch.addEventListener('click', () => switchTab('stopwatch'));
  tabTimer.addEventListener('click', () => switchTab('timer'));

  // ── Fullscreen ────────────────────────────────────────────
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      (appEl.requestFullscreen || appEl.webkitRequestFullscreen || Function.prototype)
        .call(appEl)
        .catch(() => {});
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || Function.prototype)
        .call(document)
        .catch(() => {});
    }
  });

  document.addEventListener('fullscreenchange', updateFullscreenIcon);
  document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

  function updateFullscreenIcon() {
    const isFS = !!document.fullscreenElement;
    $('.icon-expand').classList.toggle('hidden', isFS);
    $('.icon-compress').classList.toggle('hidden', !isFS);
  }

  // ══════════════════════════════════════════════════════════
  //  STOPWATCH
  // ══════════════════════════════════════════════════════════
  let swRunning = false;
  let swStartTime = 0;
  let swElapsed = 0; // accumulated ms
  let swRAF = null;
  const laps = []; // each entry: { split: ms, total: ms }

  function formatTime(ms, showMs) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const centis = Math.floor((ms % 1000) / 10);
    const base =
      String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(s).padStart(2, '0');
    if (showMs) {
      return base + '<span class="ms">.' + String(centis).padStart(2, '0') + '</span>';
    }
    return base;
  }

  function swTick() {
    const now = performance.now();
    const current = swElapsed + (now - swStartTime);
    swDisplay.innerHTML = formatTime(current, true);
    swRAF = requestAnimationFrame(swTick);
  }

  function swStart() {
    swRunning = true;
    swStartTime = performance.now();
    btnStartStop.textContent = 'ストップ';
    btnStartStop.classList.add('running');
    btnLap.disabled = false;
    btnReset.disabled = true;
    swTick();
  }

  function swStop() {
    swRunning = false;
    swElapsed += performance.now() - swStartTime;
    cancelAnimationFrame(swRAF);
    btnStartStop.textContent = 'スタート';
    btnStartStop.classList.remove('running');
    btnLap.disabled = true;
    btnReset.disabled = false;
    // final display update
    swDisplay.innerHTML = formatTime(swElapsed, true);
  }

  function swReset() {
    swElapsed = 0;
    laps.length = 0;
    swDisplay.innerHTML = formatTime(0, true);
    lapsBody.innerHTML = '';
    btnReset.disabled = true;
    btnLap.disabled = true;
  }

  function swLap() {
    const current = swElapsed + (performance.now() - swStartTime);
    const prevTotal = laps.length > 0 ? laps[laps.length - 1].total : 0;
    const split = current - prevTotal;
    laps.push({ split, total: current });
    renderLaps();
  }

  function formatPlain(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return (
      String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(s).padStart(2, '0') + '.' +
      String(centis).padStart(2, '0')
    );
  }

  function renderLaps() {
    // find fastest / slowest split (only when >=2 laps)
    let fastestIdx = -1;
    let slowestIdx = -1;
    if (laps.length >= 2) {
      let minSplit = Infinity;
      let maxSplit = -Infinity;
      laps.forEach((l, i) => {
        if (l.split < minSplit) { minSplit = l.split; fastestIdx = i; }
        if (l.split > maxSplit) { maxSplit = l.split; slowestIdx = i; }
      });
    }

    let html = '';
    for (let i = laps.length - 1; i >= 0; i--) {
      const lap = laps[i];
      let cls = '';
      if (i === fastestIdx) cls = 'fastest';
      else if (i === slowestIdx) cls = 'slowest';
      html +=
        '<tr class="' + cls + '">' +
        '<td class="lap-num">#' + (i + 1) + '</td>' +
        '<td>' + formatPlain(lap.split) + '</td>' +
        '<td>' + formatPlain(lap.total) + '</td>' +
        '</tr>';
    }
    lapsBody.innerHTML = html;
    lapsContainer.scrollTop = 0;
  }

  btnStartStop.addEventListener('click', () => {
    if (swRunning) swStop();
    else swStart();
  });
  btnLap.addEventListener('click', swLap);
  btnReset.addEventListener('click', swReset);

  // ══════════════════════════════════════════════════════════
  //  TIMER
  // ══════════════════════════════════════════════════════════
  let tmRunning = false;
  let tmTotalMs = 0; // the full duration set by user
  let tmRemainingMs = 0;
  let tmLastTick = 0;
  let tmRAF = null;
  let tmAlarmPlaying = false;

  // Wheel values
  const wheels = { hours: 0, minutes: 5, seconds: 0 };

  function updateWheelDisplay() {
    wheelHours.textContent = String(wheels.hours).padStart(2, '0');
    wheelMinutes.textContent = String(wheels.minutes).padStart(2, '0');
    wheelSeconds.textContent = String(wheels.seconds).padStart(2, '0');
  }

  $$('.wheel-arrow').forEach((btn) => {
    let intervalId = null;

    function step() {
      const key = btn.dataset.wheel;
      const dir = btn.dataset.dir === 'up' ? 1 : -1;
      const max = key === 'hours' ? 23 : 59;
      wheels[key] = (wheels[key] + dir + max + 1) % (max + 1);
      updateWheelDisplay();
    }

    btn.addEventListener('click', step);

    // Long-press repeat
    btn.addEventListener('pointerdown', () => {
      intervalId = setTimeout(() => {
        intervalId = setInterval(step, 80);
      }, 400);
    });
    const cancel = () => {
      clearTimeout(intervalId);
      clearInterval(intervalId);
    };
    btn.addEventListener('pointerup', cancel);
    btn.addEventListener('pointerleave', cancel);
    btn.addEventListener('pointercancel', cancel);
  });

  // Presets
  $$('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.dataset.minutes, 10);
      wheels.hours = 0;
      wheels.minutes = mins;
      wheels.seconds = 0;
      updateWheelDisplay();
    });
  });

  // Progress ring circumference
  const CIRCUMFERENCE = 2 * Math.PI * 90; // r=90

  function setProgress(fraction) {
    // fraction: 0 = full, 1 = empty
    const offset = CIRCUMFERENCE * fraction;
    progressFill.style.strokeDashoffset = offset;
  }

  function formatTimer(ms) {
    if (ms < 0) ms = 0;
    const totalSec = Math.ceil(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return (
      String(h).padStart(2, '0') + ':' +
      String(m).padStart(2, '0') + ':' +
      String(s).padStart(2, '0')
    );
  }

  function tmTick() {
    const now = performance.now();
    const delta = now - tmLastTick;
    tmLastTick = now;
    tmRemainingMs -= delta;

    if (tmRemainingMs <= 0) {
      tmRemainingMs = 0;
      tmRunning = false;
      cancelAnimationFrame(tmRAF);
      timerDisplay.textContent = '00:00:00';
      setProgress(1);
      triggerAlarm();
      btnTimerStartPause.textContent = 'ストップ';
      btnTimerStartPause.classList.add('running');
      return;
    }

    timerDisplay.textContent = formatTimer(tmRemainingMs);
    setProgress(1 - tmRemainingMs / tmTotalMs);
    tmRAF = requestAnimationFrame(tmTick);
  }

  function tmStart() {
    if (tmAlarmPlaying) {
      stopAlarm();
      return;
    }

    if (tmRemainingMs <= 0) {
      // Fresh start from wheels
      const totalSec = wheels.hours * 3600 + wheels.minutes * 60 + wheels.seconds;
      if (totalSec === 0) return;
      tmTotalMs = totalSec * 1000;
      tmRemainingMs = tmTotalMs;
    }

    tmRunning = true;
    tmLastTick = performance.now();
    timerSetup.classList.add('hidden');
    timerDisplayContainer.classList.remove('hidden');
    timerDisplay.textContent = formatTimer(tmRemainingMs);
    setProgress(1 - tmRemainingMs / tmTotalMs);
    btnTimerStartPause.textContent = 'ポーズ';
    btnTimerStartPause.classList.add('running');
    tmTick();
  }

  function tmPause() {
    tmRunning = false;
    cancelAnimationFrame(tmRAF);
    btnTimerStartPause.textContent = '再開';
    btnTimerStartPause.classList.remove('running');
  }

  function tmReset() {
    tmRunning = false;
    tmRemainingMs = 0;
    tmTotalMs = 0;
    cancelAnimationFrame(tmRAF);
    stopAlarm();
    timerDisplay.classList.remove('alarm');
    timerSetup.classList.remove('hidden');
    timerDisplayContainer.classList.add('hidden');
    btnTimerStartPause.textContent = 'スタート';
    btnTimerStartPause.classList.remove('running');
    setProgress(0);
  }

  btnTimerStartPause.addEventListener('click', () => {
    if (tmAlarmPlaying) {
      stopAlarm();
      tmReset();
      return;
    }
    if (tmRunning) tmPause();
    else tmStart();
  });
  btnTimerReset.addEventListener('click', tmReset);

  // ── Audio Alarm (Web Audio API) ───────────────────────────
  let audioCtx = null;
  let alarmOscillator = null;
  let alarmGain = null;
  let alarmTimeout = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function triggerAlarm() {
    tmAlarmPlaying = true;
    timerDisplay.classList.add('alarm');
    btnTimerStartPause.textContent = 'ストップ';
    btnTimerStartPause.classList.add('running');

    const ctx = getAudioCtx();

    // Create a repeating beep pattern
    alarmGain = ctx.createGain();
    alarmGain.connect(ctx.destination);
    alarmGain.gain.value = 0;

    alarmOscillator = ctx.createOscillator();
    alarmOscillator.type = 'sine';
    alarmOscillator.frequency.value = 880;
    alarmOscillator.connect(alarmGain);
    alarmOscillator.start();

    // Beep pattern: on/off every 200ms
    let beepOn = true;
    function toggleBeep() {
      if (!tmAlarmPlaying) return;
      if (beepOn) {
        alarmGain.gain.setTargetAtTime(0.4, ctx.currentTime, 0.01);
        alarmOscillator.frequency.setTargetAtTime(880, ctx.currentTime, 0.01);
      } else {
        alarmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.01);
      }
      beepOn = !beepOn;
      alarmTimeout = setTimeout(toggleBeep, 200);
    }
    toggleBeep();

    // Auto-stop after 30 seconds
    setTimeout(() => {
      if (tmAlarmPlaying) stopAlarm();
    }, 30000);
  }

  function stopAlarm() {
    tmAlarmPlaying = false;
    timerDisplay.classList.remove('alarm');
    clearTimeout(alarmTimeout);
    if (alarmOscillator) {
      try { alarmOscillator.stop(); } catch (e) { /* already stopped */ }
      alarmOscillator = null;
    }
    if (alarmGain) {
      alarmGain.disconnect();
      alarmGain = null;
    }
  }

  // ── Keyboard shortcuts ────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (panelStopwatch.classList.contains('active')) {
        btnStartStop.click();
      } else {
        btnTimerStartPause.click();
      }
    }
    if (e.key === 'l' || e.key === 'L') {
      if (panelStopwatch.classList.contains('active') && swRunning) {
        swLap();
      }
    }
    if (e.key === 'r' || e.key === 'R') {
      if (panelStopwatch.classList.contains('active')) {
        if (!swRunning) swReset();
      } else {
        tmReset();
      }
    }
    if (e.key === 'f' || e.key === 'F') {
      fullscreenBtn.click();
    }
  });

  // ── Init ──────────────────────────────────────────────────
  updateWheelDisplay();
  setProgress(0);
})();
