import { renderToStaticMarkup } from 'react-dom/server';
import type { PicnicState } from '../game/model';
import { MemoryCard } from '../components/MemoryCard';

async function embedArtwork(markup: string): Promise<string> {
  const document = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const svg = document.documentElement;
  const ns = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns, 'defs');
  svg.prepend(defs);
  const images = [...svg.querySelectorAll('image')];
  const sources = [...new Set(images.map((image) => image.getAttribute('href')!))];
  // SVG-as-image cannot fetch external assets. Embed each atlas once, then reuse it.
  await Promise.all(
    sources.map(async (source, index) => {
      const response = await fetch(source);
      if (!response.ok) throw new Error('毛绒照片还没有准备好，请再试一次。');
      const blob = await response.blob();
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('图片读取失败，请再试一次。'));
        reader.readAsDataURL(blob);
      });
      const matching = images.filter((image) => image.getAttribute('href') === source);
      const embedded = matching[0]!.cloneNode() as SVGImageElement;
      const id = `memory-art-${index}`;
      embedded.setAttribute('id', id);
      embedded.setAttribute('href', data);
      defs.append(embedded);
      for (const image of matching) {
        const use = document.createElementNS(ns, 'use');
        for (const attribute of image.attributes) use.setAttribute(attribute.name, attribute.value);
        use.setAttribute('href', `#${id}`);
        image.replaceWith(use);
      }
    }),
  );
  return new XMLSerializer().serializeToString(svg);
}

export async function exportMemory(state: PicnicState, date: string): Promise<void> {
  const svg = await embedArtwork(renderToStaticMarkup(<MemoryCard state={state} date={date} />));
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('纪念照暂时没有准备好，请再试一次。'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1260;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('这个浏览器暂时不支持保存图片。');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('保存失败，请再试一次。'))),
        'image/png',
      ),
    );
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `kabu-picnic-${date.replaceAll('.', '-')}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    // Some mobile browsers start processing a download after the click returns.
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000);
  } finally {
    URL.revokeObjectURL(url);
  }
}
