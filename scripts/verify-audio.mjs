import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const lines = JSON.parse(await readFile(new URL('src/game/voiceLines.json', root), 'utf8'));
const missing = [];
for (const line of lines) {
  try {
    const bytes = await readFile(new URL(`public/audio/${line.id}.mp3`, root));
    const isMp3 =
      bytes.subarray(0, 3).toString() === 'ID3' ||
      (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
    if (bytes.length < 1000 || !isMp3) missing.push(line.id);
  } catch {
    missing.push(line.id);
  }
}
if (missing.length)
  throw new Error(
    `Missing or invalid recordings (${missing.length}): ${missing.join(', ')}. Generate and review audio before deployment.`,
  );
console.log(`PASS all ${lines.length} voice files present with MP3 headers`);
