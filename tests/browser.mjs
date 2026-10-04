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
try {
  for (const viewport of [
    { width: 1440, height: 1100 },
    { width: 390, height: 844 },
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
    await page.getByRole('heading', { name: '把今天，装进野餐篮。' }).waitFor();
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
    await page.getByRole('button', { name: '出发去森林' }).click();
    await page.getByRole('button', { name: '找找花丛里的朋友' }).click();
    await page.getByRole('button', { name: '看看池塘里的朋友' }).click();
    await page.getByRole('button', { name: '敲敲树洞' }).click();
    await page.getByRole('button', { name: '去野餐' }).click();
    await page.getByRole('button', { name: '选择苹果' }).click();
    await page.getByRole('button', { name: '小熊', exact: true }).click();
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
    await page.getByRole('button', { name: '鼠尾草绿野餐毯' }).click();
    await page.getByRole('button', { name: '变成下雨天' }).click();
    await page.screenshot({
      path: join(output, `share-${viewport.width}.png`),
      fullPage: true,
    });
    await page.getByRole('button', { name: '拍张纪念照' }).click();
    await page.getByRole('heading', { name: '把这一刻，留起来。' }).waitFor();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: '保存纪念照' }).click();
    const photo = await download;
    assert.match(photo.suggestedFilename(), /\.png$/);
    await photo.saveAs(join(output, `memory-${viewport.width}.png`));
    const png = await readFile(join(output, `memory-${viewport.width}.png`));
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
  await page.getByRole('heading', { name: '沿着小路，发现惊喜。' }).waitFor();
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
  await touch.getByRole('heading', { name: '把这一刻，留起来。' }).waitFor();
  await touchContext.close();
  assert.deepEqual(failures, []);
  console.log('PASS actual touch events and optional forest exploration');
} finally {
  await browser.close();
}
