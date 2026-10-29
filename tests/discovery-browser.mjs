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
  await locator.locator('.friend-playing').waitFor();
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
    const motionRequests = [];
    page.on('request', (request) => {
      if (/\/motion(?:-[\w-]+)?\.webp(?:\?.*)?$/.test(request.url()))
        motionRequests.push(request.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base);
    assert.deepEqual(
      motionRequests,
      [],
      'Optional detailed motion artwork is not loaded on the first screen',
    );
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
      if (item === 'butterfly') {
        const parts = await button.locator('[data-butterfly-part]').evaluateAll((elements) =>
          elements.map((element) => ({
            part: element.getAttribute('data-butterfly-part'),
            transform: getComputedStyle(element).transform,
          })),
        );
        assert.equal(parts.length, 3, 'Both complete wings and the body are present');
        assert.equal(
          parts.find((part) => part.part === 'body').transform,
          'none',
          'Flapping does not squash the body',
        );
        assert.notEqual(parts[0].transform, parts[1].transform, 'Wings move independently');
      }
      if (item === 'frog') {
        for (const [fraction, expected] of [
          [0.12, 'crouch'],
          [0.42, 'leap'],
          [0.74, 'land'],
          [0.98, 'idle'],
        ]) {
          await button.evaluate((button, fraction) => {
            for (const animation of button
              .querySelector('.friend-actor')
              .getAnimations({ subtree: true })) {
              animation.pause();
              animation.currentTime = fraction * 1400;
            }
          }, fraction);
          const visible = await button
            .locator('[data-frog-pose]')
            .evaluateAll((poses) =>
              poses
                .filter((pose) => getComputedStyle(pose).opacity === '1')
                .map((pose) => pose.getAttribute('data-frog-pose')),
            );
          assert.deepEqual(visible, [expected], 'Exactly one complete frog pose is visible');
        }
        await button.evaluate((button) => {
          for (const animation of button
            .querySelector('.friend-actor')
            .getAnimations({ subtree: true }))
            animation.currentTime = 588;
        });
      }
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
      const distorted = await button.locator('svg[width][height]').evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              Math.abs(
                parseFloat(getComputedStyle(element).width) - Number(element.getAttribute('width')),
              ) > 0.1 ||
              Math.abs(
                parseFloat(getComputedStyle(element).height) -
                  Number(element.getAttribute('height')),
              ) > 0.1,
          )
          .map((element) => ({
            width: element.getAttribute('width'),
            height: element.getAttribute('height'),
            cssWidth: getComputedStyle(element).width,
            cssHeight: getComputedStyle(element).height,
          })),
      );
      assert.deepEqual(
        distorted,
        [],
        'Picnic companion styling must preserve every nested sprite placement',
      );
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
  assert.equal(await page.locator('[data-butterfly-part]').count(), 3);
  for (const wing of await page.locator('.butterfly-wing').all()) {
    assert.equal(await wing.evaluate((el) => getComputedStyle(el).animationName), 'none');
  }
  await page.getByRole('button', { name: '看看池塘里的朋友', exact: true }).click();
  await page.locator('.frog-poses').waitFor();
  const reducedPoses = await page
    .locator('[data-frog-pose]')
    .evaluateAll((poses) =>
      poses
        .filter((pose) => getComputedStyle(pose).opacity === '1')
        .map((pose) => pose.getAttribute('data-frog-pose')),
    );
  assert.deepEqual(reducedPoses, ['idle'], 'Reduced motion keeps one stable frog pose');
  await reduced.close();
  const fallback = await browser.newContext();
  const offlineArt = await fallback.newPage();
  const fallbackErrors = [];
  offlineArt.on('pageerror', (error) => fallbackErrors.push(error.message));
  await offlineArt.route(/\/motion(?:-[\w-]+)?\.webp(?:\?.*)?$/, (route) => route.abort());
  await offlineArt.goto(base);
  await offlineArt.getByRole('button', { name: '装入苹果', exact: true }).click();
  await offlineArt.getByRole('button', { name: '出发去森林', exact: true }).click();
  await offlineArt.getByRole('button', { name: '找找花丛里的朋友', exact: true }).click();
  await offlineArt.locator('.discovery-butterfly .friend-playing').waitFor();
  assert.equal(
    await offlineArt.locator('[data-butterfly-part]').count(),
    0,
    'Failed detailed art falls back to the original intact butterfly',
  );
  await offlineArt.getByRole('button', { name: '看看池塘里的朋友', exact: true }).click();
  await offlineArt.locator('.discovery-frog .friend-playing').waitFor();
  assert.equal(await offlineArt.locator('.frog-poses').count(), 0);
  assert.deepEqual(fallbackErrors, [], 'Missing optional motion art never breaks the game');
  await fallback.close();
  console.log('PASS replayable exploration, picnic companions, gift placement, and reduced motion');
} finally {
  await browser.close();
}
