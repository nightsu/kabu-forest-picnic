import { renderToStaticMarkup } from 'react-dom/server';
import type { PicnicState } from '../game/model';
import { MemoryCard } from '../components/MemoryCard';

export async function exportMemory(state: PicnicState, date: string): Promise<void> {
  const svg = renderToStaticMarkup(<MemoryCard state={state} date={date} />);
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
