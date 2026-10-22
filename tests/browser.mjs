import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
});
const base = process.env.BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.ARTIFACT_DIR || 'test-results';
await mkdir(output, { recursive: true });
const failures = [];
async function assertOneScreen(page) {
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1),
    true,
    'The game fits one screen without vertical scrolling',
  );
  assert.equal(
    await page.locator('.blanket-options').count(),
    0,
    'No blanket controls during the picnic',
  );
  const dock = await page.locator('.journey-actions').boundingBox();
  for (const food of await page.locator('.food-option').all()) {
    const box = await food.boundingBox();
    assert.ok(box.y >= 0 && box.y + box.height <= dock.y, 'Every food is visible above navigation');
  }
}
try {
  for (const viewport of [
    { width: 1440, height: 1100 },
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
    { width: 768, height: 1024 },
  ]) {
    const context = await browser.newContext({
      viewport,
      acceptDownloads: true,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => failures.push(error.message));
    await page.goto(base);
    await page.getByRole('heading', { name: '装好篮子' }).waitFor();
    await assertOneScreen(page);
    assert.equal(
      await page.locator('.step-number').count(),
      0,
      'Journey uses pictures instead of numbers',
    );
    const nextBox = await page.getByRole('button', { name: '出发去森林' }).boundingBox();
    assert.ok(
      nextBox.width >= 96 && nextBox.height >= 80,
      'Picture navigation has a large touch target',
    );
    assert.equal(await page.getByRole('button', { name: '出发去森林' }).isDisabled(), true);
    await page.getByRole('button', { name: '装入苹果' }).click();
    await page.getByRole('button', { name: '装入面包' }).click();
    await page.reload();
    assert.equal(await page.getByRole('button', { name: '取出苹果' }).count(), 1);
    await page.waitForFunction(() => {
      const scene = document.querySelector('.picnic-scene');
      return scene && getComputedStyle(scene.parentElement).opacity === '1';
    });
    await page.screenshot({ path: join(output, `pack-${viewport.width}.png`), fullPage: true });
    for (const food of ['香蕉', '草莓', '胡萝卜', '水壶']) {
      await page.getByRole('button', { name: `装入${food}`, exact: true }).click();
    }
    await page
      .locator('.scene-basket')
      .screenshot({ path: join(output, `basket-six-${viewport.width}.png`) });
    for (const food of ['香蕉', '草莓', '胡萝卜', '水壶']) {
      await page.getByRole('button', { name: `取出${food}`, exact: true }).click();
    }
    await page.getByRole('button', { name: '出发去森林' }).click();
    await page.getByRole('button', { name: '找找花丛里的朋友' }).waitFor();
    await page.waitForFunction(() => {
      const scene = document.querySelector('.picnic-scene');
      return scene && getComputedStyle(scene.parentElement).opacity === '1';
    });
    const backBox = await page.getByRole('button', { name: '回去看看', exact: true }).boundingBox();
    const forestNextBox = await page
      .getByRole('button', { name: '去野餐', exact: true })
      .boundingBox();
    assert.ok(
      Math.abs(forestNextBox.y - nextBox.y) < 2,
      'Forward stays at the same viewport height between chapters',
    );
    assert.ok(Math.abs(backBox.y - nextBox.y) < 2, 'Back and forward share fixed anchors');
    assert.ok(backBox.width >= 96 && backBox.height >= 80, 'Back is also a large picture button');
    assert.equal(await page.getByRole('button', { name: '回去看看', exact: true }).innerText(), '');
    await page.screenshot({ path: join(output, `forest-${viewport.width}.png`), fullPage: true });
    await page.getByRole('button', { name: '找找花丛里的朋友' }).click();
    await page.getByRole('button', { name: '找找花丛里的朋友' }).click();
    assert.equal(await page.locator('.discovery-butterfly .friend-playing').count(), 1);
    await page.getByRole('button', { name: '看看池塘里的朋友' }).click();
    await page.getByRole('button', { name: '敲敲树洞' }).click();
    await page.getByRole('button', { name: '去野餐' }).click();
    const picnicNextBox = await page.getByRole('button', { name: '拍张纪念照' }).boundingBox();
    assert.ok(Math.abs(picnicNextBox.y - nextBox.y) < 2, 'Picnic keeps the same navigation anchor');
    await page.getByRole('button', { name: '和蝴蝶玩', exact: true }).click();
    await assertOneScreen(page);
    await page.getByRole('button', { name: '和小青蛙玩', exact: true }).click();
    await page.getByRole('button', { name: '把橡果送给小松鼠' }).click();
    assert.equal(await page.getByRole('button', { name: '看看小松鼠的橡果' }).count(), 1);
    await page.getByRole('button', { name: '小兔', exact: true }).click();
    assert.equal(await page.locator('.animal-rabbit .animal-playing').count(), 1);
    assert.equal(
      await page
        .locator('.animal-rabbit .animal-playing')
        .evaluate((el) => getComputedStyle(el).animationName),
      'none',
      'Reduced-motion preference disables the new gestures',
    );
    await page.reload();
    await page.getByRole('button', { name: '看看小松鼠的橡果' }).waitFor();
    await page.getByRole('button', { name: '选择苹果' }).click();
    await page.getByRole('button', { name: '小熊', exact: true }).click();
    await page.locator('.animal-bear [data-gesture="eat"]').waitFor();
    assert.equal(await page.getByRole('button', { name: '苹果已分享' }).isDisabled(), true);
    await page.getByRole('button', { name: '选择面包' }).click();
    await page.getByRole('button', { name: '小兔', exact: true }).click();
    // Motion's transform must not overwrite CSS centering after a tap/hover.
    await page.mouse.move(0, 0);
    await page.waitForFunction(() =>
      [...document.querySelectorAll('.animal')].every(
        (el) => !el.style.transform || el.style.transform === 'none',
      ),
    );
    const centered = await page.locator('.animal-bear').evaluate((el) => {
      const box = el.getBoundingClientRect();
      const parent = el.offsetParent.getBoundingClientRect();
      const expected = parent.x + parseFloat(getComputedStyle(el).left) + 1;
      return Math.abs(box.x + box.width / 2 - expected) < 2;
    });
    assert.equal(centered, true, 'Animals stay centered on their scene anchors after interaction');
    await page.getByRole('button', { name: '变成下雨天' }).click();
    const shelter = await page.locator('.umbrella').boundingBox();
    for (const animal of ['rabbit', 'bear', 'squirrel']) {
      const friend = await page.locator(`.animal-${animal}`).boundingBox();
      assert.ok(
        shelter.y + shelter.height / 3 <= friend.y + friend.height * 0.15,
        'Canopy stays above the heads on short screens',
      );
      assert.ok(
        shelter.x <= friend.x && shelter.x + shelter.width >= friend.x + friend.width,
        'Canopy spans all picnic friends',
      );
    }
    await page.screenshot({
      path: join(output, `share-${viewport.width}.png`),
      fullPage: true,
    });
    await page.getByRole('button', { name: '拍张纪念照' }).click();
    await page.getByRole('heading', { name: '留下回忆' }).waitFor();
    await page.getByRole('img', { name: '卡布的野餐纪念照' }).waitFor();
    await assertOneScreen(page);
    const photoNextBox = await page.getByRole('button', { name: '再去野餐' }).boundingBox();
    assert.ok(Math.abs(photoNextBox.y - nextBox.y) < 2, 'Photo keeps the same navigation anchor');
    assert.equal(await page.locator('[data-memory-discovery]').count(), 3);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: '保存纪念照' }).click();
    const photo = await download;
    assert.match(photo.suggestedFilename(), /\.png$/);
    await photo.saveAs(join(output, `memory-${viewport.width}.png`));
    const png = await readFile(join(output, `memory-${viewport.width}.png`));
    assert.ok(png.length > 200_000, 'The exported photo contains embedded textured artwork');
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1800);
    assert.equal(png.readUInt32BE(20), 1260);
    await page.getByRole('button', { name: '给大人的小纸条' }).click();
    assert.equal(await page.getByRole('dialog').isVisible(), true);
    await page.getByRole('button', { name: '知道啦' }).click();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      'No horizontal overflow',
    );
    await page.screenshot({
      path: join(output, `photo-${viewport.width}.png`),
      fullPage: true,
    });
    await page.getByRole('button', { name: '再去野餐' }).click();
    assert.equal(await page.getByRole('button', { name: '出发去森林' }).isDisabled(), true);
    await context.close();
    console.log(`PASS full picnic, reload, photo export, restart at ${viewport.width}px`);
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', (error) => failures.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Storage unavailable');
    };
  });
  await page.goto(base);
  await page.getByRole('button', { name: '装入苹果' }).click();
  await page.getByRole('button', { name: '出发去森林' }).click();
  await page.getByRole('heading', { name: '走进森林' }).waitFor();
  assert.deepEqual(failures, []);
  await context.close();
  console.log('PASS storage-unavailable fallback and no browser errors');
  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const touch = await touchContext.newPage();
  touch.on('pageerror', (error) => failures.push(error.message));
  await touch.goto(base);
  for (const name of ['装入水壶', '出发去森林', '去野餐', '选择水壶', '小松鼠', '拍张纪念照']) {
    await touch.getByRole('button', { name, exact: true }).tap();
  }
  await touch.getByRole('heading', { name: '留下回忆' }).waitFor();
  await touch.getByRole('button', { name: '再坐一会儿' }).tap();
  assert.equal(await touch.locator('.companion').count(), 0);
  await touch.getByRole('button', { name: '回去看看' }).tap();
  for (const name of [
    '找找花丛里的朋友',
    '看看池塘里的朋友',
    '敲敲树洞',
    '去野餐',
    '和蝴蝶玩',
    '和小青蛙玩',
    '把橡果送给小松鼠',
  ]) {
    await touch.getByRole('button', { name, exact: true }).tap();
  }
  await touch.getByRole('button', { name: '看看小松鼠的橡果' }).waitFor();
  await touch.getByRole('button', { name: '小兔', exact: true }).focus();
  await touch.keyboard.press('Enter');
  for (const animal of ['rabbit', 'bear', 'squirrel']) {
    const button = touch.locator(`.animal-${animal}`);
    const before = await button.boundingBox();
    await button.focus();
    await touch.keyboard.press('Enter');
    const sprite = button.locator('svg[data-gesture="greet"]');
    await sprite.waitFor();
    await touch.waitForFunction(
      (animal) =>
        document.querySelector(`.animal-${animal} [data-pose]`)?.getAttribute('data-pose') === '1',
      animal,
    );
    await button.screenshot({ path: join(output, `gesture-${animal}-wave.png`) });
    await touch.waitForFunction(
      (animal) =>
        document.querySelector(`.animal-${animal} [data-pose]`)?.getAttribute('data-pose') === '2',
      animal,
    );
    await button.screenshot({ path: join(output, `gesture-${animal}-reply.png`) });
    await touch.waitForFunction(
      (animal) =>
        document.querySelector(`.animal-${animal} [data-pose]`)?.getAttribute('data-pose') === '0',
      animal,
    );
    const after = await button.boundingBox();
    assert.ok(
      Math.abs(before.x - after.x) < 1 && Math.abs(before.y - after.y) < 1,
      'Gestures keep the character anchored',
    );
    assert.equal(
      await button.locator('.animal-playing').evaluate((el) => getComputedStyle(el).animationName),
      'none',
      'The gesture changes limbs and facial poses, not the whole-body CSS rotation',
    );
  }
  await touchContext.close();
  assert.deepEqual(failures, []);
  console.log('PASS touch companions, keyboard gestures, reduced motion, and optional exploration');
} finally {
  await browser.close();
}
