import test from 'node:test';
import assert from 'node:assert/strict';
import { JOKE_CATEGORIES, JOKES } from '../data/jokes.js';

test('題庫為六類各十二題', () => {
  assert.equal(JOKE_CATEGORIES.length, 6);
  assert.equal(JOKES.length, 72);
  for (const category of JOKE_CATEGORIES) {
    assert.equal(
      JOKES.filter((joke) => joke.category === category.id).length,
      12,
      `${category.id} 必須有 12 題`
    );
  }
});

test('每題符合資料契約與唯一性', () => {
  const ids = new Set();
  const questions = new Set();
  const categoryIds = new Set(JOKE_CATEGORIES.map(({ id }) => id));

  for (const joke of JOKES) {
    assert.ok(/^[-a-z]+-\d{3}$/.test(joke.id), `${joke.id} ID 格式錯誤`);
    assert.ok(!ids.has(joke.id), `${joke.id} 重複`);
    assert.ok(!questions.has(joke.question), `${joke.question} 重複`);
    ids.add(joke.id);
    questions.add(joke.question);
    assert.ok(categoryIds.has(joke.category));
    for (const field of ['question', 'answer', 'region', 'note']) {
      assert.equal(typeof joke[field], 'string');
      assert.ok(joke[field].trim().length > 0, `${joke.id} 的 ${field} 不可空白`);
    }
    assert.ok([1, 2, 3].includes(joke.difficulty));
    assert.equal(joke.distractors.length, 3);
    assert.equal(new Set(joke.distractors).size, 3);
    assert.ok(joke.distractors.every((item) => item.trim().length > 0));
    assert.ok(!joke.distractors.includes(joke.answer));
  }
});
