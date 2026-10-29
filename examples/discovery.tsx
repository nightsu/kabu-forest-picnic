import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DiscoveryFriend } from '../src/components/DiscoveryFriend';
import { ButterflyArt, FrogArt, type FrogPose } from '../src/components/PlushArt';
import '../src/plush.css';
import './motion.css';
import './discovery.css';

type Friend = 'butterfly' | 'frog';

function LegacyFriend({ item, playCount }: { item: Friend; playCount: number }) {
  return (
    <span
      key={playCount}
      className={`friend-actor friend-${item} ${playCount ? 'responding' : ''}`}
      aria-hidden="true"
    >
      <span className={`friend-motion ${playCount ? 'friend-playing' : ''}`}>
        {item === 'butterfly' ? (
          <span className="legacy-wing">
            <ButterflyArt />
          </span>
        ) : (
          <FrogArt />
        )}
      </span>
    </span>
  );
}

function DiscoveryPreview() {
  const [friend, setFriend] = useState<Friend>('butterfly');
  const [replay, setReplay] = useState(0);
  const [pose, setPose] = useState<FrogPose | 'auto'>('auto');
  function select(item: Friend) {
    setFriend(item);
    setReplay(0);
    setPose('auto');
  }
  return (
    <main>
      <p className="eyebrow">卡布的森林野餐 · 探索伙伴</p>
      <h1>小伙伴有了更多小动作</h1>
      <p>
        {friend === 'butterfly'
          ? '身体保持稳定，两侧翅膀各自扑动，沿原来的弧线飞回来。'
          : '先蹲下蓄力，伸开后腿跳起，落地时再弯腿缓冲。'}
      </p>
      <div className="actions friend-tabs">
        <button aria-pressed={friend === 'butterfly'} onClick={() => select('butterfly')}>
          小蝴蝶
        </button>
        <button aria-pressed={friend === 'frog'} onClick={() => select('frog')}>
          小青蛙
        </button>
      </div>
      <div className="comparison">
        <section className="legacy">
          <h2>原来的动作</h2>
          <div className="discovery-demo-stage">
            <LegacyFriend key={friend} item={friend} playCount={pose === 'auto' ? replay : 0} />
          </div>
          <p>
            {friend === 'butterfly' ? '整张蝴蝶一起缩放。' : '单张青蛙通过压缩、拉伸和位移跳跃。'}
          </p>
        </section>
        <section>
          <h2>细化后的动作</h2>
          <div className="discovery-demo-stage">
            {friend === 'frog' && pose !== 'auto' ? (
              <span className="friend-actor friend-frog">
                <span className="friend-motion">
                  <FrogArt pose={pose} />
                </span>
              </span>
            ) : (
              <DiscoveryFriend key={friend} item={friend} playCount={replay} />
            )}
          </div>
          <p>
            {friend === 'butterfly'
              ? '独立的翅膀和身体，保留完整的毛绒细节。'
              : '完整的蓄力、腾空和落地姿势，保留水波与影子。'}
          </p>
        </section>
      </div>
      <div className="actions">
        <button
          onClick={() => {
            setPose('auto');
            setReplay((value) => value + 1);
          }}
        >
          再玩一次
        </button>
        {friend === 'frog' && (
          <label>
            查看新姿势{' '}
            <select
              aria-label="查看新姿势"
              value={pose}
              onChange={(event) => setPose(event.target.value as FrogPose | 'auto')}
            >
              <option value="auto">完整动作</option>
              <option value="idle">原位</option>
              <option value="crouch">蓄力</option>
              <option value="leap">腾空</option>
              <option value="land">落地</option>
            </select>
          </label>
        )}
      </div>
      <p className="note">可反复点击；跟随系统的“减少动态效果”设置。</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DiscoveryPreview />
  </StrictMode>,
);
