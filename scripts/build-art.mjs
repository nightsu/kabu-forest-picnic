import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildArtwork } from './lib/build-artwork.mjs';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const sourceDir = new URL('art/source/', root);
const outputDir = new URL('src/assets/plush/', root);
const recipeText = await readFile(new URL('art/recipe.json', root), 'utf8');
const recipe = JSON.parse(recipeText);
const sources = await readdir(sourceDir);
const hash = createHash('sha256').update(recipeText).update(JSON.stringify(sharp.versions));
for (const file of [
  'scripts/lib/atlas.mjs',
  'scripts/lib/build-artwork.mjs',
  'scripts/build-art.mjs',
])
  hash.update(await readFile(new URL(file, root)));
for (const source of sources.sort())
  hash.update(source).update(await readFile(new URL(source, sourceDir)));
const fingerprint = hash.digest('hex');
const outputs = [
  'artwork.ts',
  'landscape.webp',
  ...Object.keys(recipe.groups).map((group) => `${group}.webp`),
];
try {
  if ((await readFile(new URL('.fingerprint', outputDir), 'utf8')) === fingerprint) {
    await Promise.all(outputs.map((file) => stat(new URL(file, outputDir))));
    console.log('Artwork is up to date.');
    process.exit(0);
  }
} catch {
  /* A fresh checkout or changed source needs a rebuild. */
}
await rm(outputDir, { recursive: true, force: true });
await buildArtwork({
  recipe,
  sourceDir: fileURLToPath(sourceDir),
  outputDir: fileURLToPath(outputDir),
});
await mkdir(outputDir, { recursive: true });
await writeFile(new URL('.fingerprint', outputDir), fingerprint);
const before = (await Promise.all(sources.map((file) => stat(new URL(file, sourceDir))))).reduce(
  (sum, entry) => sum + entry.size,
  0,
);
const after = (
  await Promise.all(
    outputs.filter((file) => file.endsWith('.webp')).map((file) => stat(new URL(file, outputDir))),
  )
).reduce((sum, entry) => sum + entry.size, 0);
console.log(
  `Artwork: ${before.toLocaleString()} → ${after.toLocaleString()} bytes (${(100 - (after / before) * 100).toFixed(1)}% smaller); original resolution and alpha retained.`,
);
