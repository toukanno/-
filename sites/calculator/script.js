const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

let currentInput = '0';
let expression = '';
let lastOperator = '';
let shouldResetInput = false;

function updateDisplay() {
    resultEl.textContent = currentInput;
    expressionEl.textContent = expression;
}

function inputNumber(value) {
    if (shouldResetInput) {
        currentInput = value;
        shouldResetInput = false;
    } else {
        currentInput = currentInput === '0' ? value : currentInput + value;
    }
    updateDisplay();
}

function inputDecimal() {
    if (shouldResetInput) {
        currentInput = '0.';
        shouldResetInput = false;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

function inputOperator(operator) {
    const symbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
    const symbol = symbols[operator];

    if (expression && !shouldResetInput) {
        calculate();
    }

    expression = currentInput + ' ' + symbol + ' ';
    lastOperator = operator;
    shouldResetInput = true;
    updateDisplay();
}

function calculate() {
    if (!lastOperator || shouldResetInput) return;

    const prev = parseFloat(expression.split(' ')[0]);
    const current = parseFloat(currentInput);
    let result;

    switch (lastOperator) {
        case 'add':      result = prev + current; break;
        case 'subtract': result = prev - current; break;
        case 'multiply': result = prev * current; break;
        case 'divide':
            if (current === 0) {
                currentInput = 'エラー';
                expression = '';
                lastOperator = '';
                shouldResetInput = true;
                updateDisplay();
                return;
            }
            result = prev / current;
            break;
        default: return;
    }

    const displayExpression = expression + currentInput + ' =';
    expression = '';
    lastOperator = '';
    currentInput = formatResult(result);
    shouldResetInput = true;
    expressionEl.textContent = displayExpression;
    resultEl.textContent = currentInput;
}

function formatResult(num) {
    if (Number.isInteger(num)) return num.toString();
    const rounded = parseFloat(num.toFixed(10));
    return rounded.toString();
}

function clearAll() {
    currentInput = '0';
    expression = '';
    lastOperator = '';
    shouldResetInput = false;
    updateDisplay();
}

function backspace() {
    if (shouldResetInput) return;
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
    updateDisplay();
}

function percent() {
    currentInput = formatResult(parseFloat(currentInput) / 100);
    updateDisplay();
}

document.querySelector('.buttons').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    if (btn.dataset.value) {
        inputNumber(btn.dataset.value);
    } else {
        switch (btn.dataset.action) {
            case 'clear':     clearAll(); break;
            case 'backspace': backspace(); break;
            case 'percent':   percent(); break;
            case 'decimal':   inputDecimal(); break;
            case 'equals':    calculate(); break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':    inputOperator(btn.dataset.action); break;
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') inputNumber(e.key);
    else if (e.key === '.') inputDecimal();
    else if (e.key === '+') inputOperator('add');
    else if (e.key === '-') inputOperator('subtract');
    else if (e.key === '*') inputOperator('multiply');
    else if (e.key === '/') { e.preventDefault(); inputOperator('divide'); }
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape') clearAll();
    else if (e.key === '%') percent();
});
