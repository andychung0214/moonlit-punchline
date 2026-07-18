import { createAudioController } from '../scripts/audio.js';
import { copyShareText } from '../scripts/share.js';

const checks = [];
const check = (name, pass) => checks.push({ name, pass: Boolean(pass) });
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

async function runInteractionSmokeTest() {
  localStorage.removeItem('moonlit-punchline-profile');
  const frame = document.createElement('iframe');
  frame.title = '遊戲互動煙霧測試';
  frame.hidden = true;
  frame.src = '../index.html';
  document.body.append(frame);
  await new Promise((resolve, reject) => {
    frame.addEventListener('load', resolve, { once: true });
    frame.addEventListener('error', reject, { once: true });
  });

  const frameDocument = frame.contentDocument;
  frameDocument.querySelector('[data-action="open-challenge"]').click();
  await nextFrame();
  for (let index = 0; index < 10; index += 1) {
    frameDocument.querySelector('[data-action="answer"]').click();
    await nextFrame();
    frameDocument.querySelector('[data-action="next-question"]').click();
    await nextFrame();
  }
  check('可完成十題並顯示結算', Boolean(frameDocument.querySelector('#results-title')));
  frameDocument.querySelector('[data-action="toggle-result-favorite"]').click();
  await nextFrame();
  check(
    '結算頁可收藏最後一題',
    frameDocument.querySelector('[data-action="toggle-result-favorite"]')?.getAttribute('aria-pressed') === 'true'
  );

  frameDocument.querySelector('[data-action="go-lobby"]').click();
  await nextFrame();
  frameDocument.querySelector('[data-action="open-gallery"]').click();
  await nextFrame();
  frameDocument.querySelector('[data-action="flip-card"]').click();
  await nextFrame();
  check('放映室可翻牌', Boolean(frameDocument.querySelector('#gallery-answer')));
  check(
    '本機紀錄已保存',
    JSON.parse(localStorage.getItem('moonlit-punchline-profile')).favorites.length === 1
  );
  frame.remove();
  localStorage.removeItem('moonlit-punchline-profile');
}

check('支援 ES Modules', 'noModule' in HTMLScriptElement.prototype);
check('支援原生按鈕與 dataset', 'dataset' in document.createElement('button'));
check('支援 localStorage 或可捕捉例外', typeof Storage !== 'undefined');
check('支援減少動態效果查詢', typeof window.matchMedia === 'function');

const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audio = createAudioController(AudioContextClass);
check('Web Audio 支援檢測正確', audio.supported === Boolean(AudioContextClass));
const audioFallback = createAudioController(undefined);
check('Web Audio 不支援時安全降級', audioFallback.play('correct') === false);

const clipboardFallback = await copyShareText('冷笑話', undefined);
check(
  'Clipboard 不支援時提供手動複製內容',
  clipboardFallback.copied === false && clipboardFallback.text === '冷笑話'
);

try {
  await runInteractionSmokeTest();
} catch (error) {
  check(`互動煙霧測試：${error.message}`, false);
}

document.querySelector('#test-results').textContent = checks
  .map(({ name, pass }) => `${pass ? 'PASS' : 'FAIL'}：${name}`)
  .join('\n');

document.documentElement.dataset.testsPassed = String(checks.every(({ pass }) => pass));
