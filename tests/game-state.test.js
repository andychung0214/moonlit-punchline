import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceGame, answerCurrent, createGame } from '../scripts/game-state.js';

const jokes = Array.from({ length: 12 }, (_, index) => ({
  id: `game-${String(index + 1).padStart(3, '0')}`,
  category: 'game',
  question: `問題 ${index + 1}`,
  answer: `正解 ${index + 1}`,
  distractors: [`錯甲 ${index}`, `錯乙 ${index}`, `錯丙 ${index}`],
  region: '測試',
  note: '測試註解',
  difficulty: 1
}));

test('建立十題遊戲且初始狀態完整', () => {
  const state = createGame(jokes, () => 0.4);
  assert.equal(state.questions.length, 10);
  assert.equal(state.index, 0);
  assert.equal(state.score, 0);
  assert.equal(state.answered, false);
  assert.equal(state.finished, false);
});

test('答對依連勝加分且答錯歸零', () => {
  const initial = createGame(jokes, () => 0.4);
  const first = answerCurrent(initial, initial.questions[0].answer);
  assert.deepEqual({ score: first.score, streak: first.streak }, { score: 120, streak: 1 });
  const next = advanceGame(first);
  const second = answerCurrent(next, '錯誤答案');
  assert.equal(second.score, 120);
  assert.equal(second.streak, 0);
  assert.equal(second.correctCount, 1);
});

test('同一題不能重複作答且最後一題後結算', () => {
  let state = createGame(jokes, () => 0.1);
  const answered = answerCurrent(state, state.questions[0].answer);
  assert.deepEqual(answerCurrent(answered, state.questions[0].answer), answered);

  state = answered;
  while (!state.finished) {
    state = advanceGame(state);
    if (!state.finished) {
      state = answerCurrent(state, state.questions[state.index].answer);
    }
  }
  assert.equal(state.index, 9);
  assert.equal(state.correctCount, 10);
  assert.ok(state.bestStreak >= 1);
});
