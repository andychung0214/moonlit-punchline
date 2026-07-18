import test from 'node:test';
import assert from 'node:assert/strict';
import { copyShareText, formatShareText } from '../scripts/share.js';

const joke = { question: '什麼最冷？', answer: '這個答案。' };

test('分享文字包含問題答案與站名', () => {
  assert.equal(
    formatShareText(joke),
    '什麼最冷？\n答案：這個答案。\n—— 月下冷梗旅店'
  );
});

test('剪貼簿成功與拒絕皆回傳可用結果', async () => {
  let written = '';
  const success = await copyShareText('冷笑話', {
    writeText: async (text) => {
      written = text;
    }
  });
  assert.deepEqual(success, { copied: true, text: '冷笑話' });
  assert.equal(written, '冷笑話');

  const failure = await copyShareText('手動複製', {
    writeText: async () => {
      throw new Error('denied');
    }
  });
  assert.deepEqual(failure, { copied: false, text: '手動複製' });
});
