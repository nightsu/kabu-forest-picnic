import { useEffect, useRef } from 'react';
import { Sprout } from './Illustrations';

export function ParentNote({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="parent-note"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="parent-note-title"
    >
      <div className="note-content">
        <Sprout />
        <span className="eyebrow">A NOTE FOR GROWN-UPS</span>
        <h2 id="parent-note-title">陪她，慢慢玩。</h2>
        <p>这里没有分数，也没有倒计时。卡布可以把所有食物给同一位朋友，也可以随时停下来。</p>
        <p>可以轻轻问一句：“你想请谁吃一点？”然后把选择留给她。一次小小的野餐，玩几分钟就很好。</p>
        <div className="note-details">
          <strong>声音与记录</strong>
          <p>
            点击对话气泡可以重听。语音使用设备提供的中文声音，是否可用取决于设备设置；系统语音服务可能需要联网。画面和文字提示始终可用。
          </p>
          <p>进度只存在这个浏览器里。无需登录，没有广告或分析追踪，也不会上传纪念照。</p>
        </div>
        <button className="primary-button" onClick={onClose}>
          知道啦
        </button>
      </div>
    </dialog>
  );
}
