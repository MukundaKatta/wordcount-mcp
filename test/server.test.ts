import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { count } from '../src/server.js';

test('counts words, sentences, paragraphs', () => {
  const text = 'Hello world. This is a test.\n\nSecond paragraph here.';
  const r = count(text);
  assert.equal(r.words, 9);
  assert.equal(r.sentences, 3);
  assert.equal(r.paragraphs, 2);
});

test('empty input yields zeros', () => {
  const r = count('');
  assert.equal(r.words, 0);
  assert.equal(r.sentences, 0);
  assert.equal(r.paragraphs, 0);
  assert.equal(r.characters, 0);
});

test('characters vs characters_no_spaces', () => {
  const r = count('a b c');
  assert.equal(r.characters, 5);
  assert.equal(r.characters_no_spaces, 3);
});

test('reading time at 200 wpm', () => {
  // 1000 words at 200 wpm = 5 minutes
  const r = count(new Array(1000).fill('word').join(' '));
  assert.equal(r.reading_time_minutes, 5);
  assert.match(r.reading_time_display, /5 min/);
});

test('reading time at custom wpm', () => {
  const r = count(new Array(100).fill('w').join(' '), 50);
  assert.equal(r.reading_time_minutes, 2);
});

test('short text reports seconds', () => {
  const r = count('one two three');
  assert.match(r.reading_time_display, /sec/);
});

test('rejects non-positive wpm', () => {
  assert.throws(() => count('x', 0));
  assert.throws(() => count('x', -10));
});
