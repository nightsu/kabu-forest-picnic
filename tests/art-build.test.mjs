import { test } from 'vite-plus/test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { buildArtwork } from '../scripts/lib/build-artwork.mjs';

test('art build ships only referenced sprites, restores their frame and rebuilds from clean sources', async () => {
  const root = await mkdtemp(join(tmpdir(), 'kabu-art-test-'));
  try {
    const sourceDir = join(root, 'source');
    const outputDir = join(root, 'output');
    await mkdir(sourceDir);
    const pixels = Buffer.alloc(12 * 8 * 4);
    // A semitransparent edge and an opaque colored center, surrounded by empty space.
    for (const [x, y, alpha] of [
      [2, 2, 1],
      [3, 3, 255],
      [4, 4, 255],
    ]) {
      const offset = (y * 12 + x) * 4;
      pixels.set([100, 150, 200, alpha], offset);
    }
    await sharp(pixels, { raw: { width: 12, height: 8, channels: 4 } })
      .png()
      .toFile(join(sourceDir, 'source.png'));
    const recipe = {
      groups: { props: { toy: { source: 'source.png', crop: [1, 1, 6, 6], anchor: 3 } } },
    };
    const result = await buildArtwork({ recipe, sourceDir, outputDir });
    assert.equal(result.sprites.toy.anchor, 3);
    assert.deepEqual(result.sprites.toy.size, [6, 6]);
    assert.deepEqual(result.sprites.toy.offset, [1, 1]);
    assert.deepEqual(result.sprites.toy.region.slice(2), [3, 3]);
    const sheet = await sharp(join(outputDir, 'props.webp'))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const [x, y] = result.sprites.toy.region;
    assert.equal(sheet.data[(y * sheet.info.width + x) * 4 + 3], 1);
    assert.equal(sheet.data[((y + 1) * sheet.info.width + x + 1) * 4 + 3], 255);
    const first = await readFile(join(outputDir, 'props.webp'));
    await rm(outputDir, { recursive: true });
    await buildArtwork({ recipe, sourceDir, outputDir });
    assert.deepEqual(await readFile(join(outputDir, 'props.webp')), first);
    assert.deepEqual((await readdir(outputDir)).sort(), ['artwork.ts', 'props.webp']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
