import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildChoices,
  filterJokes,
  sampleUnique,
  validateJokes
} from '../scripts/joke-engine.js';

const fixtureJokes = Array.from({ length: 12 }, (_, index) => ({
  id: `fixture-${String(index + 1).padStart(3, '0')}`,
  category: index % 2 ? 'odd' : 'even',
  question: `問題 ${index + 1}`,
  answer: `答案 ${index + 1}`,
  distractors: [`甲 ${index}`, `乙 ${index}`, `丙 ${index}`],
  region: '測試',
  note: '測試註解',
  difficulty: 1
}));

test('抽取指定數量且不重複，也不修改原陣列', () => {
  const before = [...fixtureJokes];
  const sampled = sampleUnique(fixtureJokes, 10, () => 0.25);
  assert.equal(sampled.length, 10);
  assert.equal(new Set(sampled.map(({ id }) => id)).size, 10);
  assert.deepEqual(fixtureJokes, before);
});

test('答案選項恰有四個且只有一個正解', () => {
  const choices = buildChoices(fixtureJokes[0], () => 0.5);
  assert.equal(choices.length, 4);
  assert.equal(new Set(choices.map(({ text }) => text)).size, 4);
  assert.equal(choices.filter(({ correct }) => correct).length, 1);
  assert.equal(choices.find(({ correct }) => correct).text, fixtureJokes[0].answer);
});

test('依分類與收藏清單篩選題目', () => {
  assert.ok(filterJokes(fixtureJokes, 'odd', []).every(({ category }) => category === 'odd'));
  assert.deepEqual(
    filterJokes(fixtureJokes, 'favorites', [fixtureJokes[2].id]).map(({ id }) => id),
    [fixtureJokes[2].id]
  );
  assert.equal(filterJokes(fixtureJokes, 'all', []).length, fixtureJokes.length);
});

test('驗證器回報重複 ID 與錯誤選項', () => {
  const invalid = [
    fixtureJokes[0],
    { ...fixtureJokes[0], question: '另一題', distractors: ['甲', '乙', fixtureJokes[0].answer] }
  ];
  const result = validateJokes(invalid, new Set(['even', 'odd']));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('重複 ID')));
  assert.ok(result.errors.some((error) => error.includes('正確答案')));
});

test('驗證器拒絕空白或非字串干擾選項', () => {
  const invalid = [
    { ...fixtureJokes[0], distractors: ['甲', '  ', 42] }
  ];
  const result = validateJokes(invalid, new Set(['even', 'odd']));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('不可空白字串')));
});
