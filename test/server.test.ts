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

test('empty text reports zero reading time', () => {
  assert.equal(count('').reading_time_display, '0 sec');
  assert.equal(count('   \n  ').reading_time_display, '0 sec');
});

test('whole hours omit trailing zero minutes', () => {
  // 200 wpm * 120 min = 24000 words -> exactly 2 hours
  const r = count(new Array(24000).fill('w').join(' '));
  assert.equal(r.reading_time_display, '2 hr');
});

test('hours include remaining minutes', () => {
  // 200 wpm * 125 min = 25000 words -> 2 hr 5 min
  const r = count(new Array(25000).fill('w').join(' '));
  assert.equal(r.reading_time_display, '2 hr 5 min');
});

test('counts a single sentence with no trailing whitespace', () => {
  const r = count('Just one sentence here.');
  assert.equal(r.words, 4);
  assert.equal(r.sentences, 1);
  assert.equal(r.paragraphs, 1);
});
