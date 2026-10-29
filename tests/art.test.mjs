import { test } from 'vite-plus/test';
import assert from 'node:assert/strict';
import { alphaBounds, packSprites } from '../scripts/lib/atlas.mjs';

test('transparent trimming retains faint edge pixels and their original offset', () => {
  const pixels = Buffer.alloc(6 * 5 * 4);
  pixels[(1 * 6 + 2) * 4 + 3] = 1;
  pixels[(3 * 6 + 4) * 4 + 3] = 255;
  assert.deepEqual(alphaBounds(pixels, 6, 5), { left: 2, top: 1, width: 3, height: 3 });
  assert.throws(() => alphaBounds(Buffer.alloc(16), 2, 2), /transparent/i);
});

test('packing is deterministic, preserves sprite dimensions and leaves transparent gutters', () => {
  const sprites = [
    { name: 'wide', width: 70, height: 30 },
    { name: 'tall', width: 28, height: 65 },
    { name: 'small', width: 25, height: 20 },
  ];
  const packed = packSprites(sprites, { width: 110, padding: 2 });
  assert.deepEqual(packed, packSprites([...sprites].reverse(), { width: 110, padding: 2 }));
  assert.equal(packed.sprites.length, sprites.length);
  for (const sprite of packed.sprites) {
    const source = sprites.find((item) => item.name === sprite.name);
    assert.equal(sprite.width, source.width);
    assert.equal(sprite.height, source.height);
    assert.ok(sprite.left >= 2 && sprite.top >= 2);
    assert.ok(sprite.left + sprite.width + 2 <= packed.width);
    assert.ok(sprite.top + sprite.height + 2 <= packed.height);
    for (const other of packed.sprites.filter((item) => item !== sprite)) {
      assert.ok(
        sprite.left + sprite.width + 4 <= other.left ||
          other.left + other.width + 4 <= sprite.left ||
          sprite.top + sprite.height + 4 <= other.top ||
          other.top + other.height + 4 <= sprite.top,
        `${sprite.name} and ${other.name} need a gutter`,
      );
    }
  }
  assert.throws(
    () => packSprites([{ name: 'too-wide', width: 111, height: 1 }], { width: 110 }),
    /wide/i,
  );
});
