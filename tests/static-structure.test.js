import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('入口包含語意掛載點與無障礙回饋區', () => {
  assert.match(html, /id="app-shell"/);
  assert.match(html, /id="live-region"[^>]*aria-live="polite"/);
  assert.match(html, /id="toast-region"[^>]*aria-live="polite"/);
});

test('入口包含 SEO、結構化資料及相對資源', () => {
  assert.match(html, /property="og:title"/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /(?:src|href)="\//);
});
