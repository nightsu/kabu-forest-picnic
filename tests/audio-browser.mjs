import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.BASE_URL || 'http://127.0.0.1:4174';
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || 'chrome',
});
const failures = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => failures.push(error.message));
    const external = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== new URL(base).origin) external.push(request.url());
    });
    await page.addInitScript(() => {
      const NativeAudio = window.Audio;
      window.__voiceClips = [];
      window.Audio = function (src) {
        const clip = new NativeAudio(src);
        window.__voiceClips.push(clip);
        return clip;
      };
      window.speechSynthesis.speak = () => {
        throw new Error('System TTS must not be used');
      };
    });
    await page.goto(base);
    const click = async (name) => {
      const button = page.getByRole('button', { name, exact: true });
      if (mobile) await button.tap();
      else await button.click();
    };
    await click('装入苹果');
    await page.waitForFunction(() =>
      window.__voiceClips.some((clip) => clip.currentTime > 0 && clip.duration > 0 && !clip.paused),
    );
    assert.match(
      await page.evaluate(() => window.__voiceClips.at(-1).src),
      /audio\/pack-apple\.mp3$/,
    );
    await click('装入面包');
    await page.waitForFunction(() => window.__voiceClips.at(-1)?.currentTime > 0);
    assert.equal(
      await page.evaluate(() => window.__voiceClips.filter((clip) => !clip.paused).length),
      1,
    );
    assert.equal(await page.evaluate(() => window.__voiceClips[0].paused), true);
    await click('关闭声音');
    assert.equal(await page.evaluate(() => window.__voiceClips.every((clip) => clip.paused)), true);
    const count = await page.evaluate(() => window.__voiceClips.length);
    await click('装入香蕉');
    assert.equal(await page.evaluate(() => window.__voiceClips.length), count);
    await page.reload();
    await page.getByRole('button', { name: '开启声音', exact: true }).waitFor();
    await click('取出香蕉');
    assert.equal(await page.evaluate(() => window.__voiceClips.length), 0);
    await click('开启声音');
    await click('取出苹果');
    await page.waitForFunction(() => window.__voiceClips.at(-1)?.currentTime > 0);
    assert.match(
      await page.evaluate(() => window.__voiceClips.at(-1).src),
      /audio\/unpack-apple\.mp3$/,
    );
    await page.route('**/audio/pack-banana.mp3', (route) => route.abort());
    await click('装入香蕉');
    await page.getByRole('button', { name: '取出香蕉', exact: true }).waitFor();
    await page.waitForFunction(() => Boolean(window.__voiceClips.at(-1)?.error));
    assert.equal(
      await page.evaluate(() => window.__voiceClips.filter((clip) => !clip.paused).length),
      0,
    );
    assert.deepEqual(external, [], 'Playing requests only this website, no paid TTS service');
    await context.close();
    console.log(
      `PASS native MP3 decoding, interruption, mute persistence, network failure, no external requests (${mobile ? 'touch' : 'desktop'})`,
    );
  }
  assert.deepEqual(failures, []);
} finally {
  await browser.close();
}
