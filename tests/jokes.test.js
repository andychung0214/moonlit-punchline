import test from 'node:test';
import assert from 'node:assert/strict';
import { JOKE_CATEGORIES, JOKES } from '../data/jokes.js';
import { EXTRA_JOKES } from '../data/extra-jokes.js';

test('擴充題目提供來源且不可變，並納入遊戲題庫', () => {
  assert.equal(EXTRA_JOKES.length, 57);
  for (const joke of EXTRA_JOKES) {
    assert.ok(joke.source.trim());
    assert.ok(joke.note.includes(joke.source));
    assert.ok(Object.isFrozen(joke));
    assert.ok(Object.isFrozen(joke.distractors));
    assert.ok(JOKES.includes(joke));
  }
});

test('題庫擴充至 129 題且保留六類與原有 ID', () => {
  assert.equal(JOKE_CATEGORIES.length, 6);
  assert.equal(JOKES.length, 129);
  for (const category of JOKE_CATEGORIES) {
    assert.equal(
      JOKES.filter((joke) => joke.category === category.id).length,
      category.id === 'zh-pun' ? 55 : category.id === 'wordplay' ? 26 : 12,
      `${category.id} 題數必須符合擴充規格`
    );
  }
  for (const category of JOKE_CATEGORIES) {
    for (let number = 1; number <= 12; number += 1) {
      assert.ok(JOKES.some(({ id }) => id === `${category.id}-${String(number).padStart(3, '0')}`));
    }
  }
  assert.ok(JOKES.some(({ answer }) => answer.includes('OK 蹦')));
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
