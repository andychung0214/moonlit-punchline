import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const tokens = await readFile(new URL('../styles/tokens.css', import.meta.url), 'utf8');

function token(name) {
  const match = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  assert.ok(match, `找不到色彩 token --${name}`);
  return match[1];
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test('主要與次要文字色在和紙背景符合 WCAG AA', () => {
  const paper = token('color-paper');
  assert.ok(contrast(token('color-ink'), paper) >= 4.5);
  assert.ok(contrast(token('color-spring'), paper) >= 4.5);
});

test('和紙文字在冬夜背景符合 WCAG AA', () => {
  assert.ok(contrast(token('color-paper'), token('color-night')) >= 4.5);
});
