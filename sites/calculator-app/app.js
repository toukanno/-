(() => {
  "use strict";

  // ===== DOM refs =====
  const displayCurrent = document.getElementById("display-current");
  const displayPrevious = document.getElementById("display-previous");
  const themeToggle = document.getElementById("theme-toggle");
  const historyToggle = document.getElementById("history-toggle");
  const historyPanel = document.getElementById("history-panel");
  const historyList = document.getElementById("history-list");
  const historyEmpty = document.getElementById("history-empty");
  const historyClear = document.getElementById("history-clear");
  const copyBtn = document.getElementById("copy-btn");
  const modeToggle = document.getElementById("mode-toggle");
  const sciPanel = document.getElementById("scientific-panel");

  // ===== State =====
  let currentInput = "0";
  let previousInput = "";
  let operator = null;
  let shouldResetDisplay = false;
  let history = [];
  let scientificMode = false;
  let lastExpression = "";

  // ===== Helpers =====
  function formatNumber(n) {
    if (n === "Error" || n === "エラー") return "エラー";
    if (typeof n === "string" && (n.includes("(") || n.includes(")"))) return n;
    const num = parseFloat(n);
    if (isNaN(num)) return n;
    if (!isFinite(num)) return "エラー";
    // Avoid floating point display issues
    const str = parseFloat(num.toPrecision(12)).toString();
    // Add commas for large integers only in display
    if (str.length > 10) {
      return parseFloat(str).toExponential(6);
    }
    return str;
  }

  function updateDisplay() {
    displayCurrent.textContent = formatNumber(currentInput);
    displayPrevious.textContent = lastExpression;
  }

  function addToHistory(expression, result) {
    history.unshift({ expression, result });
    if (history.length > 10) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = "";
    if (history.length === 0) {
      historyEmpty.classList.add("visible");
      return;
    }
    historyEmpty.classList.remove("visible");
    history.forEach((item, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<div class="expr">${item.expression}</div><div class="result">${item.result}</div>`;
      li.addEventListener("click", () => {
        currentInput = item.result.toString();
        shouldResetDisplay = true;
        updateDisplay();
        // Close history on selection
        historyPanel.classList.remove("open");
      });
      historyList.appendChild(li);
    });
  }

  // ===== Core calculation =====
  function calculate(a, op, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return "エラー";
    switch (op) {
      case "+": return numA + numB;
      case "-": return numA - numB;
      case "*": return numA * numB;
      case "/": return numB === 0 ? "エラー" : numA / numB;
      default: return numB;
    }
  }

  function scientificCalc(func, value) {
    const num = parseFloat(value);
    if (isNaN(num)) return "エラー";
    switch (func) {
      case "sin": return Math.sin(num * Math.PI / 180); // degrees
      case "cos": return Math.cos(num * Math.PI / 180);
      case "tan": {
        // Check for undefined values (90, 270, etc.)
        const mod = ((num % 360) + 360) % 360;
        if (mod === 90 || mod === 270) return "エラー";
        return Math.tan(num * Math.PI / 180);
      }
      case "log": return num <= 0 ? "エラー" : Math.log10(num);
      case "ln": return num <= 0 ? "エラー" : Math.log(num);
      case "sqrt": return num < 0 ? "エラー" : Math.sqrt(num);
      case "square": return num * num;
      case "cube": return num * num * num;
      default: return num;
    }
  }

  // ===== Actions =====
  function inputDigit(d) {
    if (shouldResetDisplay) {
      currentInput = d;
      shouldResetDisplay = false;
    } else {
      currentInput = currentInput === "0" ? d : currentInput + d;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (shouldResetDisplay) {
      currentInput = "0.";
      shouldResetDisplay = false;
      updateDisplay();
      return;
    }
    if (!currentInput.includes(".")) {
      currentInput += ".";
    }
    updateDisplay();
  }

  function handleOperator(op) {
    const opSymbols = { "+": "+", "-": "\u2212", "*": "\u00d7", "/": "\u00f7" };
    if (operator && !shouldResetDisplay) {
      const result = calculate(previousInput, operator, currentInput);
      const resultStr = typeof result === "number" ? formatNumber(result) : result;
      lastExpression = `${formatNumber(previousInput)} ${opSymbols[operator] || operator} ${formatNumber(currentInput)}`;
      previousInput = resultStr;
      currentInput = resultStr;
    } else {
      previousInput = currentInput;
    }
    operator = op;
    shouldResetDisplay = true;
    lastExpression = `${formatNumber(previousInput)} ${opSymbols[op] || op}`;
    updateDisplay();
  }

  function handleEquals() {
    if (operator === null) return;
    const opSymbols = { "+": "+", "-": "\u2212", "*": "\u00d7", "/": "\u00f7" };
    const expression = `${formatNumber(previousInput)} ${opSymbols[operator] || operator} ${formatNumber(currentInput)}`;
    const result = calculate(previousInput, operator, currentInput);
    const resultStr = typeof result === "number" ? formatNumber(result) : result;

    lastExpression = `${expression} =`;
    addToHistory(expression, resultStr);

    currentInput = resultStr;
    previousInput = "";
    operator = null;
    shouldResetDisplay = true;
    updateDisplay();
  }

  function handleClear() {
    currentInput = "0";
    previousInput = "";
    operator = null;
    shouldResetDisplay = false;
    lastExpression = "";
    updateDisplay();
  }

  function handleClearEntry() {
    currentInput = "0";
    shouldResetDisplay = false;
    updateDisplay();
  }

  function handleBackspace() {
    if (shouldResetDisplay) return;
    if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput[0] === "-")) {
      currentInput = "0";
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
  }

  function handlePercent() {
    const num = parseFloat(currentInput);
    if (isNaN(num)) return;
    if (previousInput && operator) {
      // percentage of previous value
      currentInput = (parseFloat(previousInput) * num / 100).toString();
    } else {
      currentInput = (num / 100).toString();
    }
    updateDisplay();
  }

  function handleNegate() {
    if (currentInput === "0") return;
    if (currentInput.startsWith("-")) {
      currentInput = currentInput.slice(1);
    } else {
      currentInput = "-" + currentInput;
    }
    updateDisplay();
  }

  function handleScientific(func) {
    if (func === "pi") {
      if (shouldResetDisplay || currentInput === "0") {
        currentInput = Math.PI.toString();
        shouldResetDisplay = false;
      }
      updateDisplay();
      return;
    }
    if (func === "euler") {
      if (shouldResetDisplay || currentInput === "0") {
        currentInput = Math.E.toString();
        shouldResetDisplay = false;
      }
      updateDisplay();
      return;
    }
    if (func === "leftParen" || func === "rightParen") {
      // Simple parenthesis append for expression building
      if (shouldResetDisplay) {
        currentInput = func === "leftParen" ? "(" : ")";
        shouldResetDisplay = false;
      } else {
        if (currentInput === "0" && func === "leftParen") {
          currentInput = "(";
        } else {
          currentInput += func === "leftParen" ? "(" : ")";
        }
      }
      updateDisplay();
      return;
    }

    const funcLabels = {
      sin: "sin", cos: "cos", tan: "tan",
      log: "log", ln: "ln", sqrt: "\u221a",
      square: "^2", cube: "^3"
    };

    const result = scientificCalc(func, currentInput);
    const resultStr = typeof result === "number" ? formatNumber(result) : result;
    const label = funcLabels[func] || func;

    if (func === "square" || func === "cube") {
      lastExpression = `${formatNumber(currentInput)}${label}`;
    } else {
      lastExpression = `${label}(${formatNumber(currentInput)})`;
    }

    addToHistory(lastExpression, resultStr);
    currentInput = resultStr;
    shouldResetDisplay = true;
    updateDisplay();
  }

  // ===== Button clicks =====
  document.querySelectorAll(".btn[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      const value = btn.dataset.value;

      switch (action) {
        case "digit": inputDigit(value); break;
        case "decimal": inputDecimal(); break;
        case "add": handleOperator("+"); break;
        case "subtract": handleOperator("-"); break;
        case "multiply": handleOperator("*"); break;
        case "divide": handleOperator("/"); break;
        case "equals": handleEquals(); break;
        case "clear": handleClear(); break;
        case "clearEntry": handleClearEntry(); break;
        case "backspace": handleBackspace(); break;
        case "percent": handlePercent(); break;
        case "negate": handleNegate(); break;
        case "sin":
        case "cos":
        case "tan":
        case "log":
        case "ln":
        case "sqrt":
        case "square":
        case "cube":
        case "pi":
        case "euler":
        case "leftParen":
        case "rightParen":
          handleScientific(action);
          break;
      }

      // Highlight active operator
      document.querySelectorAll(".btn.op").forEach((b) => b.classList.remove("active"));
      if (["add", "subtract", "multiply", "divide"].includes(action) && shouldResetDisplay) {
        btn.classList.add("active");
      }
    });
  });

  // ===== Keyboard support =====
  document.addEventListener("keydown", (e) => {
    // Prevent default for calculator keys
    const key = e.key;

    if (key >= "0" && key <= "9") {
      e.preventDefault();
      inputDigit(key);
      clearOpHighlight();
    } else if (key === ".") {
      e.preventDefault();
      inputDecimal();
    } else if (key === "+") {
      e.preventDefault();
      handleOperator("+");
    } else if (key === "-") {
      e.preventDefault();
      handleOperator("-");
    } else if (key === "*") {
      e.preventDefault();
      handleOperator("*");
    } else if (key === "/") {
      e.preventDefault();
      handleOperator("/");
    } else if (key === "Enter" || key === "=") {
      e.preventDefault();
      handleEquals();
      clearOpHighlight();
    } else if (key === "Backspace") {
      e.preventDefault();
      handleBackspace();
    } else if (key === "Escape") {
      e.preventDefault();
      handleClear();
      clearOpHighlight();
    } else if (key === "Delete") {
      e.preventDefault();
      handleClearEntry();
    } else if (key === "%") {
      e.preventDefault();
      handlePercent();
    } else if (key === "(") {
      e.preventDefault();
      handleScientific("leftParen");
    } else if (key === ")") {
      e.preventDefault();
      handleScientific("rightParen");
    } else if (key === "p") {
      e.preventDefault();
      handleScientific("pi");
    } else if (key === "e" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleScientific("euler");
    } else if (key === "h") {
      e.preventDefault();
      historyPanel.classList.toggle("open");
    } else if (key === "t") {
      e.preventDefault();
      toggleTheme();
    } else if (key === "s" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleSciMode();
    }
  });

  function clearOpHighlight() {
    document.querySelectorAll(".btn.op").forEach((b) => b.classList.remove("active"));
  }

  // ===== Theme toggle =====
  function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute("data-theme");
    body.setAttribute("data-theme", current === "dark" ? "light" : "dark");
  }

  themeToggle.addEventListener("click", toggleTheme);

  // ===== History toggle =====
  historyToggle.addEventListener("click", () => {
    historyPanel.classList.toggle("open");
  });

  historyClear.addEventListener("click", () => {
    history = [];
    renderHistory();
  });

  // ===== Copy button =====
  copyBtn.addEventListener("click", () => {
    const text = displayCurrent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.classList.add("copied");
      copyBtn.textContent = "\u2713";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = "\u2398";
      }, 1200);
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      copyBtn.classList.add("copied");
      copyBtn.textContent = "\u2713";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = "\u2398";
      }, 1200);
    });
  });

  // ===== Scientific mode toggle =====
  function toggleSciMode() {
    scientificMode = !scientificMode;
    sciPanel.classList.toggle("open", scientificMode);
    modeToggle.classList.toggle("active", scientificMode);
    modeToggle.textContent = scientificMode ? "標準モード" : "関数モード";
  }

  modeToggle.addEventListener("click", toggleSciMode);

  // ===== Init =====
  renderHistory();
  updateDisplay();
})();
