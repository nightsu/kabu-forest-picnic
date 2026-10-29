/** Only alpha decides visibility; retain even the faintest fur edge. */
export function alphaBounds(pixels, width, height) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) throw new Error('Cannot pack a fully transparent sprite');
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

/** Stable shelf packing, with padding on every side of each sprite. */
export function packSprites(sprites, { width = 1536, padding = 2 } = {}) {
  const ordered = [...sprites].sort(
    (a, b) => b.height - a.height || b.width - a.width || a.name.localeCompare(b.name),
  );
  let left = padding;
  let top = padding;
  let rowHeight = 0;
  let usedWidth = 0;
  const packed = [];
  for (const sprite of ordered) {
    if (sprite.width + padding * 2 > width) throw new Error(`Sprite too wide: ${sprite.name}`);
    if (left + sprite.width + padding > width) {
      top += rowHeight + padding * 2;
      left = padding;
      rowHeight = 0;
    }
    packed.push({ ...sprite, left, top });
    usedWidth = Math.max(usedWidth, left + sprite.width + padding);
    left += sprite.width + padding * 2;
    rowHeight = Math.max(rowHeight, sprite.height);
  }
  return { width: usedWidth, height: top + rowHeight + padding, sprites: packed };
}
