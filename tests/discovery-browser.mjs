import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.ARTIFACT_DIR || 'test-results';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
});

async function trace(locator, item) {
  const result = await locator.evaluate(async (button) => {
    const actor = button.querySelector('.friend-playing');
    const scene = button.closest('.picnic-scene').getBoundingClientRect();
    const samples = [];
    const start = performance.now();
    do {
      const box = actor.getBoundingClientRect();
      const matrix = new DOMMatrix(getComputedStyle(actor).transform);
      samples.push({
        x: box.x,
        y: box.y,
        right: box.right,
        bottom: box.bottom,
        rotation: Math.abs(Math.atan2(matrix.b, matrix.a)),
      });
      await new Promise(requestAnimationFrame);
    } while (performance.now() - start < 3000);
    return {
      samples,
      scene: {
        x: scene.x,
        y: scene.y,
        right: scene.right,
        bottom: scene.bottom,
        width: scene.width,
        height: scene.height,
      },
    };
  });
  const xs = result.samples.map((sample) => sample.x);
  const ys = result.samples.map((sample) => sample.y);
  const rangeX = Math.max(...xs) - Math.min(...xs);
  const rangeY = Math.max(...ys) - Math.min(...ys);
  if (item === 'butterfly')
    assert.ok(
      rangeX >= Math.min(110, result.scene.width * 0.3),
      `Butterfly explores the scene: ${rangeX.toFixed(1)}px`,
    );
  if (item === 'frog')
    assert.ok(
      rangeY >= Math.min(70, result.scene.height * 0.2),
      `Frog makes a visible high jump: ${rangeY.toFixed(1)}px`,
    );
  if (item === 'acorn') {
    assert.ok(rangeX >= 20, `Acorn rolls out instead of turning in place: ${rangeX.toFixed(1)}px`);
    assert.ok(
      result.samples.every((sample) => sample.rotation < 1),
      'Acorn never flips upside down',
    );
  }
  assert.ok(
    result.samples.every(
      (sample) =>
        sample.x >= result.scene.x - 1 &&
        sample.right <= result.scene.right + 1 &&
        sample.y >= result.scene.y - 1 &&
        sample.bottom <= result.scene.bottom + 1,
    ),
    `${item} stays fully inside the scene throughout the motion`,
  );
  console.log(`PASS ${item}: horizontal ${rangeX.toFixed(0)}px, vertical ${rangeY.toFixed(0)}px`);
}

try {
  for (const viewport of [
    { width: 320, height: 740 },
    { width: 1280, height: 720 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base);
    await page.getByRole('button', { name: '装入苹果', exact: true }).click();
    await page.getByRole('button', { name: '出发去森林', exact: true }).click();
    for (const [item, label] of [
      ['butterfly', '找找花丛里的朋友'],
      ['frog', '看看池塘里的朋友'],
      ['acorn', '敲敲树洞'],
    ]) {
      const button = page.getByRole('button', { name: label, exact: true });
      await button.click();
      await trace(button, item);
      await button.evaluate((button) => {
        const actor = button.querySelector('.friend-actor');
        const motion = actor.querySelector('.friend-playing').getAnimations()[0];
        const time = Number(motion.effect.getTiming().duration) * 0.42;
        for (const animation of actor.getAnimations({ subtree: true })) {
          animation.pause();
          animation.currentTime = time;
        }
      });
      await page.screenshot({
        path: join(output, `discover-${item}-motion-${viewport.width}.png`),
      });
      await button.evaluate((button) => {
        for (const animation of button
          .querySelector('.friend-actor')
          .getAnimations({ subtree: true }))
          animation.finish();
      });
      await button.click();
      await trace(button, item);
    }
    await page.screenshot({ path: join(output, `discover-rest-${viewport.width}.png`) });
    await page.getByRole('button', { name: '去野餐', exact: true }).click();
    for (const [item, label] of [
      ['butterfly', '和蝴蝶玩'],
      ['frog', '和小青蛙玩'],
    ]) {
      const button = page.getByRole('button', { name: label, exact: true });
      await button.click();
      await trace(button, item);
    }
    await page.getByRole('button', { name: '把橡果送给小松鼠', exact: true }).click();
    await page.locator('[data-animal-plate="squirrel"] [data-plate-acorn]').waitFor();
    assert.deepEqual(errors, []);
    await context.close();
  }
  const reduced = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await reduced.newPage();
  await page.goto(base);
  await page.getByRole('button', { name: '装入苹果', exact: true }).click();
  await page.getByRole('button', { name: '出发去森林', exact: true }).click();
  await page.getByRole('button', { name: '找找花丛里的朋友', exact: true }).click();
  assert.equal(
    await page.locator('.friend-playing').evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );
  await reduced.close();
  console.log('PASS replayable exploration, picnic companions, gift placement, and reduced motion');
} finally {
  await browser.close();
}
