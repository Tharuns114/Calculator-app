// Redesigned calculator logic with separate expression and result display
const displayEl = document.getElementById('display');
const exprEl = document.getElementById('expr');

let expression = ''; // full expression shown in exprEl
let current = '';    // current entry shown in displayEl

function updateBoth() {
  exprEl.textContent = expression.trim() === '' ? '' : expression;
  displayEl.textContent = current === '' ? '0' : current;
}

function lastCharOf(str) {
  return str.slice(-1);
}

function isOperator(ch) {
  return ['+','-','*','/'].includes(ch);
}

function pushValue(val) {
  // If a previous calculation finished and user types a number, start new entry
  if (expression !== '' && !/[+\-*/]$/.test(expression) && current === expression) {
    expression = '';
    current = '';
  }

  // Prevent multiple leading zeros
  if (current === '0' && val === '0') return;
  if (current === '0' && val !== '.') current = val; // replace leading zero

  // Prevent multiple dots
  if (val === '.' && current.includes('.')) return;

  current += val;
  updateBoth();
}

function pushOperator(op) {
  if (!current && !expression) {
    // allow negative first number
    if (op === '-') {
      current = '-';
      updateBoth();
      return;
    }
    return;
  }

  // If current exists, append it to expression
  if (current) {
    expression += current;
    current = '';
  }

  // Replace trailing operator if user presses another operator
  if (isOperator(lastCharOf(expression))) {
    expression = expression.slice(0, -1) + op;
  } else {
    expression += op;
  }

  updateBoth();
}

function clearAll() {
  expression = '';
  current = '';
  updateBoth();
}

function deleteLast() {
  if (current) {
    current = current.slice(0, -1);
  } else if (expression) {
    // remove last char from expression
    expression = expression.slice(0, -1);
  }
  updateBoth();
}

function applyPercent() {
  try {
    if (current) {
      const val = safeEval(current);
      current = String(val / 100);
    } else if (expression) {
      const val = safeEval(expression);
      expression = String(val / 100);
      current = expression;
      expression = '';
    }
    updateBoth();
  } catch {
    showError();
  }
}

function computeResult() {
  try {
    // Build final expression
    let exp = expression + (current || '');
    if (!exp) return;
    const val = safeEval(exp);
    // Show result in current and move expression to show full calc
    expression = exp + ' =';
    current = String(val);
    updateBoth();
  } catch {
    showError();
  }
}

function showError() {
  displayEl.textContent = 'Error';
  setTimeout(() => { clearAll(); }, 900);
}

// Minimal safe evaluator: only allows digits, operators, parentheses and dots
function safeEval(expr) {
  expr = expr.replace(/\u00D7/g, '*').replace(/\u00F7/g, '/');
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('Invalid characters');
  // Disallow consecutive operators except for unary minus after operator or '('
  if (/[+\/*]{2,}/.test(expr)) throw new Error('Invalid sequence');
  const fn = new Function('return (' + expr + ')');
  const result = fn();
  if (!isFinite(result)) throw new Error('Math error');
  return Math.round(result * 1e12) / 1e12;
}

/* Click handling */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const val = btn.dataset.value;
    if (action === 'clear') return clearAll();
    if (action === 'delete') return deleteLast();
    if (action === 'equals') return computeResult();
    if (action === 'percent') return applyPercent();
    if (val && isOperator(val)) return pushOperator(val);
    if (val) return pushValue(val);
  });
});

/* Keyboard support */
document.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k >= '0' && k <= '9') return pushValue(k);
  if (['+', '-', '*', '/'].includes(k)) return pushOperator(k);
  if (k === '.' ) return pushValue('.');
  if (k === 'Enter' || k === '=') { e.preventDefault(); return computeResult(); }
  if (k === 'Backspace') return deleteLast();
  if (k === 'Escape') return clearAll();
});

/* Initialize */
updateBoth();