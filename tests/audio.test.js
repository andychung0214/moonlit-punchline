import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioController } from '../scripts/audio.js';

test('缺少 AudioContext 時安全停用', () => {
  const audio = createAudioController(undefined);
  assert.equal(audio.supported, false);
  assert.equal(audio.setEnabled(true), false);
  assert.equal(audio.play('correct'), false);
});

test('未啟用前不建立 AudioContext', () => {
  let instances = 0;
  class FakeAudioContext {
    constructor() {
      instances += 1;
      this.currentTime = 0;
      this.destination = {};
    }
    resume() {}
    createOscillator() {
      return { connect() {}, frequency: { setValueAtTime() {} }, start() {}, stop() {}, type: '' };
    }
    createGain() {
      return {
        connect() {},
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }
      };
    }
  }

  const audio = createAudioController(FakeAudioContext);
  assert.equal(audio.supported, true);
  assert.equal(audio.play('flip'), false);
  assert.equal(instances, 0);
  assert.equal(audio.setEnabled(true), true);
  assert.equal(audio.play('flip'), true);
  assert.equal(instances, 1);
});
