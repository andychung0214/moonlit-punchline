import { JOKE_CATEGORIES, JOKES } from '../data/jokes.js';
import { createAudioController } from './audio.js';
import { validateJokes } from './joke-engine.js';
import { createProfileStore } from './storage.js';
import { createApp } from './ui.js';

function getStorage(windowRef) {
  try {
    return windowRef.localStorage;
  } catch {
    return undefined;
  }
}

export function bootstrap(documentRef = document, windowRef = window) {
  const shell = documentRef.querySelector('#app-shell');
  if (!shell) {
    throw new Error('找不到應用程式掛載點');
  }
  const validation = validateJokes(JOKES, new Set(JOKE_CATEGORIES.map(({ id }) => id)));
  if (!validation.valid) {
    shell.innerHTML = `
      <section class="error-panel">
        <h1 tabindex="-1">題庫房門暫時打不開</h1>
        <p>題庫資料不完整，請重新載入或聯絡網站維護者。</p>
      </section>
    `;
    shell.querySelector('h1')?.focus();
    return null;
  }

  const AudioContextClass = windowRef.AudioContext || windowRef.webkitAudioContext;
  const app = createApp({
    document: documentRef,
    jokes: JOKES,
    categories: JOKE_CATEGORIES,
    store: createProfileStore(getStorage(windowRef)),
    audio: createAudioController(AudioContextClass),
    clipboard: windowRef.navigator?.clipboard
  });
  shell.dataset.ready = 'true';
  return app;
}

if (typeof document !== 'undefined') {
  bootstrap();
}
