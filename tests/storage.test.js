import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PROFILE,
  createProfileStore,
  normalizeProfile,
  toggleFavorite
} from '../scripts/storage.js';

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
}

test('正常讀寫並正規化紀錄', () => {
  const store = createProfileStore(createStorage(), 'test-profile');
  assert.deepEqual(store.load(), DEFAULT_PROFILE);
  const profile = { ...DEFAULT_PROFILE, bestScore: 620, favorites: ['zh-pun-001'] };
  assert.equal(store.save(profile), true);
  assert.deepEqual(store.load(), profile);
  assert.equal(store.persistent, true);
});

test('損壞資料回到預設值', () => {
  const store = createProfileStore(createStorage({ broken: '{oops' }), 'broken');
  assert.deepEqual(store.load(), DEFAULT_PROFILE);
});

test('寫入失敗時改用記憶體模式', () => {
  const failingStorage = {
    getItem: () => null,
    setItem: () => {
      throw new Error('blocked');
    },
    removeItem: () => {
      throw new Error('blocked');
    }
  };
  const store = createProfileStore(failingStorage, 'test-profile');
  assert.equal(store.save({ ...DEFAULT_PROFILE, bestScore: 300 }), false);
  assert.equal(store.persistent, false);
  assert.equal(store.load().bestScore, 300);
});

test('收藏切換不修改原紀錄', () => {
  const initial = normalizeProfile({ favorites: ['one'] });
  const added = toggleFavorite(initial, 'two');
  const removed = toggleFavorite(added, 'one');
  assert.deepEqual(initial.favorites, ['one']);
  assert.deepEqual(added.favorites, ['one', 'two']);
  assert.deepEqual(removed.favorites, ['two']);
});
