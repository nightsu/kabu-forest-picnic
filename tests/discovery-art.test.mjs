import { test } from 'vite-plus/test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ButterflyArt, FrogArt } from '../src/components/PlushArt';

test('butterfly response preserves a separate body while animating both complete wings', () => {
  const markup = renderToStaticMarkup(createElement(ButterflyArt, { animated: true }));
  for (const part of ['left-wing', 'right-wing', 'body']) {
    assert.ok(markup.includes(`data-butterfly-part="${part}"`), `Missing independent ${part}`);
  }
  assert.equal(
    markup.includes('class="butterfly-wings"'),
    false,
    'Do not squash the whole butterfly',
  );
});

test('frog response has actual leg poses while still photos use only the original idle sprite', () => {
  const response = renderToStaticMarkup(createElement(FrogArt, { animated: true }));
  for (const pose of ['idle', 'crouch', 'leap', 'land']) {
    assert.ok(response.includes(`data-frog-pose="${pose}"`), `Missing complete ${pose} pose`);
  }
  const photo = renderToStaticMarkup(createElement(FrogArt));
  assert.ok(photo.includes('data-frog-pose="idle"'));
  assert.equal(
    photo.includes('data-frog-pose="leap"'),
    false,
    'Still photos must not stack animation frames',
  );
});
