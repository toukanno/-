(() => {
  "use strict";

  // === Character sets ===
  const CHARSETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;':\",./<>?~`",
  };

  const AMBIGUOUS = /[0O1lI|`]/g;

  // === DOM references ===
  const $ = (sel) => document.querySelector(sel);
  const passwordOutput = $("#password-output");
  const btnCopy = $("#btn-copy");
  const btnGenerate = $("#btn-generate");
  const btnGenerateMulti = $("#btn-generate-multi");
  const btnClearHistory = $("#btn-clear-history");
  const lengthSlider = $("#length-slider");
  const lengthValue = $("#length-value");
  const strengthFill = $("#strength-fill");
  const strengthLabel = $("#strength-label");
  const crackTimeEl = $("#crack-time");
  const copyFeedback = $("#copy-feedback");
  const multiSection = $("#multi-passwords");
  const multiList = $("#multi-list");
  const historyList = $("#history-list");

  const optUppercase = $("#opt-uppercase");
  const optLowercase = $("#opt-lowercase");
  const optNumbers = $("#opt-numbers");
  const optSymbols = $("#opt-symbols");
  const optExcludeAmbiguous = $("#opt-exclude-ambiguous");

  // === State ===
  const HISTORY_KEY = "pw-gen-history";
  const MAX_HISTORY = 10;

  // === Helpers ===
  function getCharPool() {
    let pool = "";
    if (optUppercase.checked) pool += CHARSETS.uppercase;
    if (optLowercase.checked) pool += CHARSETS.lowercase;
    if (optNumbers.checked) pool += CHARSETS.numbers;
    if (optSymbols.checked) pool += CHARSETS.symbols;
    if (optExcludeAmbiguous.checked) {
      pool = pool.replace(AMBIGUOUS, "");
    }
    return pool;
  }

  function generatePassword(length) {
    const pool = getCharPool();
    if (pool.length === 0) return "";

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let password = "";
    for (let i = 0; i < length; i++) {
      password += pool[array[i] % pool.length];
    }
    return password;
  }

  // === Strength calculation ===
  function calcStrength(password) {
    if (!password) return { score: 0, label: "", color: "transparent", percent: 0 };

    const length = password.length;
    const pool = getCharPool();
    const poolSize = pool.length || 1;

    // Entropy in bits
    const entropy = length * Math.log2(poolSize);

    let score, label, color;
    if (entropy < 30) {
      score = 1;
      label = "弱い";
      color = "#ff4757";
    } else if (entropy < 50) {
      score = 2;
      label = "普通";
      color = "#ffa502";
    } else if (entropy < 70) {
      score = 3;
      label = "強い";
      color = "#00cc6a";
    } else {
      score = 4;
      label = "非常に強い";
      color = "#00ff88";
    }

    const percent = Math.min(100, (entropy / 90) * 100);
    return { score, label, color, percent, entropy };
  }

  // === Crack time estimation ===
  function estimateCrackTime(password) {
    if (!password) return "";

    const pool = getCharPool();
    const poolSize = pool.length || 1;
    const length = password.length;

    // Assume 10 billion guesses per second (modern GPU cluster)
    const guessesPerSecond = 1e10;
    const combinations = Math.pow(poolSize, length);
    const seconds = combinations / guessesPerSecond / 2; // average case

    if (seconds < 1) return "解読時間: 一瞬";
    if (seconds < 60) return `解読時間: ${Math.round(seconds)}秒`;
    if (seconds < 3600) return `解読時間: ${Math.round(seconds / 60)}分`;
    if (seconds < 86400) return `解読時間: ${Math.round(seconds / 3600)}時間`;
    if (seconds < 86400 * 365) return `解読時間: ${Math.round(seconds / 86400)}日`;
    if (seconds < 86400 * 365 * 1e3) return `解読時間: ${Math.round(seconds / (86400 * 365))}年`;
    if (seconds < 86400 * 365 * 1e6) return `解読時間: ${Math.round(seconds / (86400 * 365 * 1e3))}千年`;
    if (seconds < 86400 * 365 * 1e9) return `解読時間: ${Math.round(seconds / (86400 * 365 * 1e6))}百万年`;
    if (seconds < 86400 * 365 * 1e12) return `解読時間: ${Math.round(seconds / (86400 * 365 * 1e9))}十億年`;
    return "解読時間: 宇宙の寿命以上";
  }

  // === UI updates ===
  function updateStrength(password) {
    const { label, color, percent } = calcStrength(password);
    strengthFill.style.width = `${percent}%`;
    strengthFill.style.backgroundColor = color;
    strengthLabel.textContent = label;
    strengthLabel.style.color = color;
    crackTimeEl.textContent = estimateCrackTime(password);
  }

  function updateLengthDisplay() {
    lengthValue.textContent = lengthSlider.value;
  }

  // === History ===
  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function addToHistory(password) {
    const history = loadHistory();
    history.unshift({
      password,
      time: Date.now(),
    });
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    saveHistory(history);
    renderHistory();
  }

  function clearHistory() {
    saveHistory([]);
    renderHistory();
  }

  function renderHistory() {
    const history = loadHistory();
    historyList.innerHTML = "";

    if (history.length === 0) {
      const li = document.createElement("li");
      li.className = "history-empty";
      li.textContent = "履歴はありません";
      historyList.appendChild(li);
      return;
    }

    history.forEach((entry) => {
      const li = document.createElement("li");
      li.title = "クリックしてコピー";

      const pwSpan = document.createElement("span");
      pwSpan.className = "history-pw";
      pwSpan.textContent = entry.password;

      const timeSpan = document.createElement("span");
      timeSpan.className = "history-time";
      const date = new Date(entry.time);
      timeSpan.textContent = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

      li.appendChild(pwSpan);
      li.appendChild(timeSpan);

      li.addEventListener("click", () => {
        copyToClipboard(entry.password);
      });

      historyList.appendChild(li);
    });
  }

  // === Clipboard ===
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      copyFeedback.classList.add("show");
      setTimeout(() => copyFeedback.classList.remove("show"), 1500);
    });
  }

  // === Copy button SVG for multi-list ===
  function createCopyButton(password) {
    const btn = document.createElement("button");
    btn.className = "btn-icon";
    btn.title = "コピー";
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      copyToClipboard(password);
    });
    return btn;
  }

  // === Generate single ===
  function handleGenerate() {
    const length = parseInt(lengthSlider.value, 10);
    const password = generatePassword(length);

    if (!password) {
      passwordOutput.value = "文字種を1つ以上選択してください";
      btnCopy.disabled = true;
      updateStrength("");
      return;
    }

    passwordOutput.value = password;
    btnCopy.disabled = false;
    updateStrength(password);
    addToHistory(password);
    multiSection.hidden = true;
  }

  // === Generate multiple ===
  function handleGenerateMulti() {
    const length = parseInt(lengthSlider.value, 10);
    const pool = getCharPool();

    if (pool.length === 0) {
      passwordOutput.value = "文字種を1つ以上選択してください";
      btnCopy.disabled = true;
      updateStrength("");
      return;
    }

    multiList.innerHTML = "";
    const passwords = [];

    for (let i = 0; i < 5; i++) {
      const pw = generatePassword(length);
      passwords.push(pw);

      const li = document.createElement("li");
      const span = document.createElement("span");
      span.className = "pw-text";
      span.textContent = pw;
      li.appendChild(span);
      li.appendChild(createCopyButton(pw));
      multiList.appendChild(li);
    }

    // Show first one in main display
    passwordOutput.value = passwords[0];
    btnCopy.disabled = false;
    updateStrength(passwords[0]);
    multiSection.hidden = false;

    // Add all to history
    passwords.forEach((pw) => addToHistory(pw));
  }

  // === Event listeners ===
  lengthSlider.addEventListener("input", updateLengthDisplay);

  btnGenerate.addEventListener("click", handleGenerate);
  btnGenerateMulti.addEventListener("click", handleGenerateMulti);

  btnCopy.addEventListener("click", () => {
    if (passwordOutput.value) {
      copyToClipboard(passwordOutput.value);
    }
  });

  btnClearHistory.addEventListener("click", clearHistory);

  // Prevent unchecking all character options
  [optUppercase, optLowercase, optNumbers, optSymbols].forEach((opt) => {
    opt.addEventListener("change", () => {
      const anyChecked =
        optUppercase.checked ||
        optLowercase.checked ||
        optNumbers.checked ||
        optSymbols.checked;
      if (!anyChecked) {
        opt.checked = true;
      }
    });
  });

  // === Init ===
  updateLengthDisplay();
  renderHistory();
})();
