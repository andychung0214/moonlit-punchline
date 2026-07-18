import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGalleryState,
  renderChallenge,
  renderGallery,
  renderLobby,
  renderResults
} from '../scripts/ui.js';

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
    audioSupported: true,
    categories: [
      { name: '華語諧音' },
      { name: '文字遊戲' },
      { name: '動植物冷知笑' },
      { name: '食物與日常' },
      { name: '世界冷梗' },
      { name: '荒謬邏輯' }
    ]
  });
  assert.match(html, /data-action="open-challenge"/);
  assert.match(html, /data-action="open-gallery"/);
  assert.match(html, /620/);
  assert.match(html, /收藏.*2/s);
  assert.match(html, /玩法/);
  assert.match(html, /華語諧音/);
  assert.match(html, /荒謬邏輯/);
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

test('答錯選項同時提供文字結果且惡意題庫文字會跳脫', () => {
  const unsafeQuestion = {
    ...question,
    question: '<img src=x onerror=alert(1)>',
    choices: [
      { text: '第一題', correct: false },
      ...question.choices.slice(1)
    ]
  };
  const html = renderChallenge({
    ...challenge,
    questions: Array.from({ length: 10 }, () => unsafeQuestion),
    answered: true,
    selectedAnswer: '第一題',
    lastAnswerCorrect: false
  });
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
  assert.match(html, /你的答案 · 錯誤/);
  assert.match(html, /正確答案/);
});

test('結算畫面顯示三項成績與重新挑戰', () => {
  const html = renderResults(
    {
      ...challenge,
      score: 920,
      correctCount: 8,
      bestStreak: 5,
      finished: true
    },
    { favorites: [] }
  );
  assert.match(html, /920/);
  assert.match(html, /8.*10/s);
  assert.match(html, /最高連勝.*5/s);
  assert.match(html, /data-action="restart"/);
  assert.match(html, /data-action="toggle-result-favorite"/);
  assert.match(html, /aria-pressed="false"/);
});

const galleryJokes = [
  { ...question, category: 'zh-pun' },
  { ...question, id: 'test-002', question: '第二題？', answer: '第二個答案', category: 'world' }
];
const categories = [
  { id: 'zh-pun', name: '華語諧音', room: '壹之間' },
  { id: 'world', name: '世界冷梗', room: '伍之間' }
];

test('放映室初始狀態收起答案並提供分類與收藏篩選', () => {
  const gallery = createGalleryState(galleryJokes, { favorites: [] });
  const html = renderGallery({
    gallery,
    categories,
    profile: { favorites: [] },
    audioSupported: true
  });
  assert.equal(gallery.revealed, false);
  assert.doesNotMatch(html, /因為它正在接受測試/);
  assert.match(html, /data-category="all"/);
  assert.match(html, /data-category="favorites"/);
  assert.match(html, /data-action="flip-card"/);
});

test('翻牌後顯示答案、註解、地區與收藏狀態', () => {
  const gallery = { ...createGalleryState(galleryJokes, { favorites: ['test-001'] }), revealed: true };
  const html = renderGallery({
    gallery,
    categories,
    profile: { favorites: ['test-001'] },
    audioSupported: true
  });
  assert.match(html, /這一題/);
  assert.match(html, /因為它正在接受測試/);
  assert.match(html, /測試地區/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /data-action="copy-joke"/);
});

test('收藏篩選沒有題目時顯示可操作空狀態', () => {
  const gallery = {
    ...createGalleryState(galleryJokes, { favorites: [] }),
    category: 'favorites',
    visibleJokes: []
  };
  const html = renderGallery({
    gallery,
    categories,
    profile: { favorites: [] },
    audioSupported: false
  });
  assert.match(html, /還沒有收藏/);
  assert.match(html, /data-category="all"/);
});
