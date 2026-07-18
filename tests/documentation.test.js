import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('README 涵蓋必要交付說明', async () => {
  const readme = await read('README.md');
  for (const heading of [
    '遊戲介紹',
    '特色',
    '操作方式',
    '安裝與執行',
    '專案結構',
    '測試方式',
    '靜態網站部署',
    '已知限制',
    '授權'
  ]) {
    assert.match(readme, new RegExp(`## ${heading}`), `README 缺少「${heading}」`);
  }
});

test('貢獻規範包含分支、題庫與繁中提交要求', async () => {
  const contributing = await read('CONTRIBUTING.md');
  assert.match(contributing, /feature\/xxx/);
  assert.match(contributing, /三個干擾選項/);
  assert.match(contributing, /繁體中文/);
  assert.match(contributing, /Conventional Commits/);
});

test('專案採 MIT License', async () => {
  const license = await read('LICENSE');
  assert.match(license, /MIT License/);
  assert.match(license, /Copyright \(c\) 2026/);
});
