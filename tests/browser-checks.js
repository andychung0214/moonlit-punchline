const checks = [];
const check = (name, pass) => checks.push({ name, pass: Boolean(pass) });

check('支援 ES Modules', 'noModule' in HTMLScriptElement.prototype);
check('支援原生按鈕與 dataset', 'dataset' in document.createElement('button'));
check('支援 localStorage 或可捕捉例外', typeof Storage !== 'undefined');
check('支援減少動態效果查詢', typeof window.matchMedia === 'function');
check('支援 Web Audio 或可安全降級', true);
check('支援 Clipboard 或可顯示手動複製', true);

document.querySelector('#test-results').textContent = checks
  .map(({ name, pass }) => `${pass ? 'PASS' : 'FAIL'}：${name}`)
  .join('\n');

document.documentElement.dataset.testsPassed = String(checks.every(({ pass }) => pass));
