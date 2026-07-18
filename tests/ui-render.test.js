import test from 'node:test';
import assert from 'node:assert/strict';
import { renderChallenge, renderLobby, renderResults } from '../scripts/ui.js';

const question = {
  id: 'test-001',
  question: '哪一題最冷？',
  answer: '這一題',
  choices: [
    { text: '第一題', correct: false },
    { text: '這一題', correct: true },
    { text: '下一題', correct: false },
    { text: '上一題', correct: false }
  ],
  region: '測試地區',
  note: '因為它正在接受測試。'
};

const challenge = {
  questions: Array.from({ length: 10 }, () => question),
  index: 0,
  score: 120,
  streak: 1,
  bestStreak: 1,
  correctCount: 1,
  answered: false,
  selectedAnswer: null,
  lastAnswerCorrect: null,
  finished: false
};

test('大廳提供兩個模式入口與本機紀錄摘要', () => {
  const html = renderLobby({
    profile: { bestScore: 620, bestStreak: 4, favorites: ['one', 'two'] },
    audioSupported: true
  });
  assert.match(html, /data-action="open-challenge"/);
  assert.match(html, /data-action="open-gallery"/);
  assert.match(html, /620/);
  assert.match(html, /收藏.*2/s);
});

test('挑戰畫面提供題號、四個答案與即時回饋關聯', () => {
  const html = renderChallenge(challenge);
  assert.match(html, /第 1 題／共 10 題/);
  assert.equal((html.match(/data-answer=/g) ?? []).length, 4);
  assert.match(html, /aria-describedby="answer-feedback"/);
});

test('作答後顯示文字結果、註解與下一題操作', () => {
  const html = renderChallenge({
    ...challenge,
    answered: true,
    selectedAnswer: '這一題',
    lastAnswerCorrect: true
  });
  assert.match(html, /答對了/);
  assert.match(html, /因為它正在接受測試/);
  assert.match(html, /data-action="next-question"/);
  assert.match(html, /disabled/);
});

test('結算畫面顯示三項成績與重新挑戰', () => {
  const html = renderResults({
    ...challenge,
    score: 920,
    correctCount: 8,
    bestStreak: 5,
    finished: true
  });
  assert.match(html, /920/);
  assert.match(html, /8.*10/s);
  assert.match(html, /最高連勝.*5/s);
  assert.match(html, /data-action="restart"/);
});
