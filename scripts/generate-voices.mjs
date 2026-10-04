import { readFile, writeFile, mkdir, access, mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const lines = JSON.parse(await readFile(join(root, 'src/game/voiceLines.json'), 'utf8'));
const model = 'qwen3-tts-instruct-flash-2026-01-26';
const voice = 'Cherry';
const instructions =
  '用自然、温暖的成年女性声音给小朋友讲绘本。普通话清楚，语速略慢，短句间轻轻停顿，亲切而轻快。卡布是小朋友的名字，读作kǎ bù。不要刻意夹嗓子，不要播音腔，也不要夸张兴奋。';
const only = process.argv
  .find((arg) => arg.startsWith('--only='))
  ?.slice(7)
  .split(',');
if (only?.some((id) => !lines.some((line) => line.id === id))) throw new Error('Unknown voice id');
const selected = only ? lines.filter((line) => only.includes(line.id)) : lines;
const pending = [];
for (const line of selected) {
  try {
    await access(join(root, `public/audio/${line.id}.mp3`));
  } catch {
    pending.push(line);
  }
}
const characters = pending.reduce((total, line) => total + [...line.text].length, 0);
console.log(
  `${pending.length} new recordings, ${characters} input characters; model ${model}, voice ${voice}.`,
);
if (!process.argv.includes('--generate')) {
  console.log(
    'Dry run only. No API calls made. Add --generate after configuring the free-tier guard and local API key.',
  );
  process.exit(0);
}
if (characters > 1000)
  throw new Error('Batch exceeds the 1000-character guard. Review the script first.');
if (process.env.DASHSCOPE_FREE_TIER_ONLY_CONFIRMED !== '1') {
  throw new Error(
    'First enable and verify free-tier-only mode for this exact model in the Beijing console, then set DASHSCOPE_FREE_TIER_ONLY_CONFIRMED=1.',
  );
}
const key = process.env.DASHSCOPE_API_KEY;
if (!key)
  throw new Error('Set DASHSCOPE_API_KEY locally; never use a VITE_ variable or commit a key.');
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
if (spawnSync(ffmpeg, ['-version'], { stdio: 'ignore' }).status !== 0)
  throw new Error('Install ffmpeg before generation.');
await mkdir(join(root, 'public/audio'), { recursive: true });
const temporary = await mkdtemp(join(tmpdir(), 'kabu-voice-'));
try {
  for (const line of pending) {
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          input: {
            text: line.text,
            voice,
            language_type: 'Chinese',
            instructions,
            optimize_instructions: true,
          },
        }),
        signal: AbortSignal.timeout(60000),
      },
    );
    const result = await response.json();
    if (!response.ok || !result.output?.audio?.url) {
      // Never log headers, credentials, or full service responses.
      throw new Error(
        `TTS stopped at ${line.id}: HTTP ${response.status}, ${result.code || 'missing_audio'}. No paid fallback or automatic retries.`,
      );
    }
    const source = new URL(result.output.audio.url);
    // Some legacy DashScope responses still return an HTTP OSS link.
    // Use the same Alibaba storage path over HTTPS without sending API credentials.
    if (source.protocol === 'http:' && source.hostname.endsWith('.aliyuncs.com'))
      source.protocol = 'https:';
    if (source.protocol !== 'https:') throw new Error('Expected an HTTPS audio download');
    const audio = await fetch(source, { signal: AbortSignal.timeout(60000) });
    if (!audio.ok) throw new Error(`Audio download failed: HTTP ${audio.status}`);
    const wav = join(temporary, 'source.wav');
    const mp3 = join(temporary, 'voice.mp3');
    await writeFile(wav, Buffer.from(await audio.arrayBuffer()));
    const conversion = spawnSync(
      ffmpeg,
      [
        '-y',
        '-v',
        'error',
        '-i',
        wav,
        '-af',
        'loudnorm=I=-19:TP=-2:LRA=7',
        '-ar',
        '44100',
        '-ac',
        '1',
        '-c:a',
        'libmp3lame',
        '-b:a',
        '128k',
        mp3,
      ],
      { encoding: 'utf8' },
    );
    if (conversion.status !== 0) throw new Error(`Audio conversion failed at ${line.id}`);
    await writeFile(join(root, `public/audio/${line.id}.mp3`), await readFile(mp3));
    console.log(
      `Saved ${line.id}.mp3 (${result.usage?.characters ?? [...line.text].length} characters)`,
    );
  }
  await writeFile(
    join(root, 'public/audio/credits.json'),
    JSON.stringify(
      {
        provider: 'Alibaba Cloud Model Studio',
        model,
        voice,
        instructions,
        format: 'MP3 mono 44100 Hz 128 kbps, normalized to -19 LUFS',
        generatedAt: new Date().toISOString(),
        documentation: 'https://help.aliyun.com/zh/model-studio/qwen-tts-api',
      },
      null,
      2,
    ) + '\n',
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
