import { useEffect, useId, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Animal, Blanket, Discovery, Food, Weather } from '../game/model';

import { sprites, type SpriteName } from '../assets/plush/artwork';

type ArtProps = {
  preserveAspectRatio?: string;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

/** Restore trimmed pixels to their source frame; layout never depends on atlas packing. */
export function PlushSprite({ name, ...props }: ArtProps & { name: SpriteName }) {
  const sprite = sprites[name];
  return (
    <svg viewBox={`0 0 ${sprite.size[0]} ${sprite.size[1]}`} aria-hidden="true" {...props}>
      <svg
        x={sprite.offset[0]}
        y={sprite.offset[1]}
        width={sprite.region[2]}
        height={sprite.region[3]}
        viewBox={sprite.region.join(' ')}
        overflow="hidden"
      >
        <image href={sprite.src} width={sprite.sheet[0]} height={sprite.sheet[1]} />
      </svg>
    </svg>
  );
}

export function FoodArt({ food, ...props }: ArtProps & { food: Food }) {
  return <PlushSprite name={food} {...props} />;
}

export type AnimalGesture = 'greet' | 'eat';

export function AnimalArt({
  animal,
  happy = false,
  gesture,
  ...props
}: ArtProps & { animal: Animal; happy?: boolean; gesture?: AnimalGesture }) {
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!gesture) return;
    // Finite, interruptible gestures; remounting after another tap restarts the sequence.
    const sequence = reducedMotion
      ? [gesture === 'eat' ? 3 : 1, 0]
      : gesture === 'eat'
        ? [3, 2, 3, 2, 3, 0]
        : [1, 2, 1, 2, 1, 0];
    const timers = sequence.map((pose, index) =>
      window.setTimeout(() => setFrame(pose), index * (reducedMotion ? 700 : 230)),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [gesture, reducedMotion]);
  const pose = gesture ? frame : happy ? 1 : 0;
  const name = `${animal}${pose}` as Extract<SpriteName, `${Animal}${number}`>;
  const sprite = sprites[name];
  const scale = animal === 'bear' ? 0.54 : 0.52;
  return (
    <svg
      viewBox="0 0 160 200"
      aria-hidden="true"
      data-pose={pose}
      data-gesture={gesture}
      overflow="visible"
      {...props}
    >
      <ellipse cx="80" cy="191" rx="49" ry="5" fill="#37593c" opacity=".13" />
      <PlushSprite
        name={name}
        x={80 - sprite.anchor * scale}
        y={193 - sprite.size[1] * scale}
        width={sprite.size[0] * scale}
        height={sprite.size[1] * scale}
      />
    </svg>
  );
}

export function BasketArt({
  className = '',
  foods = [],
}: {
  className?: string;
  foods?: readonly Food[];
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 210 180" className={className} aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <path d="M0 89Q105 110 210 89V180H0Z" />
        </clipPath>
      </defs>
      <PlushSprite name="basket" width={210} height={180} />
      {foods.map((food, i) => {
        const rear = foods.length > 3 && i < 3;
        const count = rear ? 3 : Math.min(3, foods.length > 3 ? foods.length - 3 : foods.length);
        const column = rear ? i : foods.length > 3 ? i - 3 : i;
        return (
          <g key={food} className="basket-item">
            <FoodArt
              food={food}
              x={105 - count * 25 + column * 50}
              y={rear ? 37 : 53}
              width={50}
              height={55}
            />
          </g>
        );
      })}
      <g clipPath={`url(#${id})`}>
        <PlushSprite name="basket" width={210} height={180} />
      </g>
    </svg>
  );
}

export function UmbrellaArt({
  layer = 'all',
  ...props
}: ArtProps & { layer?: 'all' | 'pole' | 'canopy' | 'canopy-back' }) {
  const id = useId();
  return (
    <svg
      viewBox={
        layer === 'canopy' || layer === 'canopy-back'
          ? '0 0 600 120'
          : layer === 'pole'
            ? '0 120 600 210'
            : '0 0 600 330'
      }
      preserveAspectRatio="none"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <clipPath id={id}>
          <path
            d={
              layer === 'canopy'
                ? 'M0 0H600V120H330Q310 100 299 100Q288 100 268 120H0Z'
                : layer === 'canopy-back'
                  ? 'M0 0H600V120H0Z'
                  : layer === 'pole'
                    ? 'M270 120H325V330H270Z'
                    : 'M0 0H600V120H325V330H270V120H0Z'
            }
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <PlushSprite name="umbrella" width={600} height={330} preserveAspectRatio="none" />
      </g>
    </svg>
  );
}

export function BlanketArt({ color: _color, ...props }: ArtProps & { color?: Blanket }) {
  return <PlushSprite name="blanket" preserveAspectRatio="none" {...props} />;
}
export function ButterflyArt({ animated = false }: { animated?: boolean } = {}) {
  if (!animated) return <PlushSprite name="butterfly" />;
  return (
    <svg viewBox="0 0 520 480" className="butterfly-puppet" aria-hidden="true">
      <g className="butterfly-wing butterfly-wing-left" data-butterfly-part="left-wing">
        <PlushSprite
          name="butterflyLeft"
          x={-30.4}
          y={72}
          width={347.52}
          height={398.2}
          preserveAspectRatio="none"
        />
      </g>
      <g className="butterfly-wing butterfly-wing-right" data-butterfly-part="right-wing">
        <PlushSprite
          name="butterflyRight"
          x={203.36}
          y={72}
          width={347.52}
          height={398.2}
          preserveAspectRatio="none"
        />
      </g>
      <g data-butterfly-part="body">
        <PlushSprite name="butterflyBody" x={38.6} y={34} width={434.4} height={434.4} />
      </g>
    </svg>
  );
}

export type FrogPose = 'idle' | 'crouch' | 'leap' | 'land';

function FrogPoseArt({ pose }: { pose: FrogPose }) {
  if (pose === 'idle') return <PlushSprite name="frog" width={430} height={370} />;
  const placements = {
    crouch: { name: 'frogCrouch', x: -18, y: 29, width: 448, height: 352 },
    leap: { name: 'frogLeap', x: -41, y: -15, width: 520, height: 400 },
    land: { name: 'frogLand', x: 0, y: 45, width: 451.4, height: 333 },
  } as const;
  return <PlushSprite {...placements[pose]} />;
}

export function FrogArt({ animated = false, pose }: { animated?: boolean; pose?: FrogPose } = {}) {
  const poses: readonly FrogPose[] = pose
    ? [pose]
    : animated
      ? ['idle', 'crouch', 'leap', 'land']
      : ['idle'];
  return (
    <svg
      viewBox="0 0 430 370"
      className={animated && !pose ? 'frog-poses' : undefined}
      overflow="visible"
      aria-hidden="true"
    >
      {poses.map((frame) => (
        <g key={frame} className={`frog-pose frog-pose-${frame}`} data-frog-pose={frame}>
          <FrogPoseArt pose={frame} />
        </g>
      ))}
    </svg>
  );
}
export function AcornArt() {
  return <PlushSprite name="acorn" />;
}

export function DiscoveryArt({ item }: { item: Discovery }) {
  const names = { butterfly: 'flowers', frog: 'pond', acorn: 'stump' } as const;
  return <PlushSprite name={names[item]} />;
}

export function WeatherArt({ weather }: { weather: Weather }) {
  return <PlushSprite name={weather} />;
}

export function ForestArt() {
  return <PlushSprite name="forest" />;
}
