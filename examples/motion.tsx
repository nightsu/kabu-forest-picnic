import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useReducedMotion } from 'motion/react';
import originalUrl from '../art/source/friends-silver.webp';
import recipe from '../art/recipe.json';
import { sprites } from '../src/assets/plush/artwork';
import { PlushSprite, type AnimalGesture } from '../src/components/PlushArt';
import './motion.css';

type Pose = 0 | 1 | 2 | 3;
const poseNames = ['squirrel0', 'squirrel1', 'squirrel2', 'squirrel3'] as const;

function SquirrelFrame({ pose, original }: { pose: Pose; original: boolean }) {
  const name = poseNames[pose];
  const source = recipe.groups.friends[name];
  const sprite = sprites[name];
  const size = original ? source.crop.slice(2) : sprite.size;
  const anchor = original ? source.anchor : sprite.anchor;
  const placement = {
    x: 80 - anchor * 0.52,
    y: 193 - size[1]! * 0.52,
    width: size[0]! * 0.52,
    height: size[1]! * 0.52,
  };
  return (
    <svg viewBox="0 0 160 200" role="img" aria-label="小松鼠的完整动作" data-pose={pose}>
      <ellipse cx="80" cy="191" rx="49" ry="5" fill="#37593c" opacity=".13" />
      {original ? (
        <svg viewBox={source.crop.join(' ')} overflow="hidden" {...placement}>
          <image href={originalUrl} width={1448} height={1086} />
        </svg>
      ) : (
        <PlushSprite name={name} {...placement} />
      )}
    </svg>
  );
}

function MotionPreview() {
  const reducedMotion = useReducedMotion();
  const [play, setPlay] = useState<{ gesture: AnimalGesture; count: number } | null>(null);
  const [pose, setPose] = useState<Pose>(0);
  useEffect(() => {
    if (!play) return;
    const sequence: Pose[] = reducedMotion
      ? [play.gesture === 'eat' ? 3 : 1, 0]
      : play.gesture === 'eat'
        ? [3, 2, 3, 2, 3, 0]
        : [1, 2, 1, 2, 1, 0];
    const timers = sequence.map((frame, index) =>
      window.setTimeout(() => setPose(frame), index * (reducedMotion ? 700 : 230)),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [play, reducedMotion]);

  function respond(gesture: AnimalGesture) {
    setPlay((previous) => ({ gesture, count: (previous?.count ?? 0) + 1 }));
  }

  return (
    <main>
      <p className="eyebrow">卡布的森林野餐 · 素材优化对比</p>
      <h1>保留小松鼠的完整回应</h1>
      <p>挥手、表情和吃东西的动作都保留，两边同步播放。</p>
      <div className="comparison">
        <section>
          <h2>整理前的素材</h2>
          <div className="stage">
            <SquirrelFrame pose={pose} original />
          </div>
          <p>原始图集中的完整姿势。</p>
        </section>
        <section>
          <h2>整理后的素材</h2>
          <div className="stage">
            <SquirrelFrame pose={pose} original={false} />
          </div>
          <p>重新打包的同一套姿势，动作保持原样。</p>
        </section>
      </div>
      <div className="actions">
        <button onClick={() => respond('greet')}>挥挥手</button>
        <button onClick={() => respond('eat')}>吃点东西</button>
      </div>
      <p className="note">可以反复点击。跟随系统的“减少动态效果”设置。</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionPreview />
  </StrictMode>,
);
