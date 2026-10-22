import { useEffect, useId, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Animal, Blanket, Discovery, Food, Weather } from '../game/model';

export const plushAssets = {
  props: `${import.meta.env.BASE_URL}art/plush/props.webp`,
  small: `${import.meta.env.BASE_URL}art/plush/small.webp`,
  forest: `${import.meta.env.BASE_URL}art/plush/forest.webp`,
  friends: `${import.meta.env.BASE_URL}art/plush/friends.webp`,
  explore: `${import.meta.env.BASE_URL}art/plush/explore.webp`,
};

type ArtProps = {
  preserveAspectRatio?: string;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};
type Crop = readonly [number, number, number, number];
type Atlas = keyof typeof plushAssets;
const sizes: Record<Atlas, readonly [number, number]> = {
  props: [1536, 1024],
  small: [1254, 1254],
  forest: [1536, 1024],
  friends: [1447, 1087],
  explore: [1536, 1024],
};

/** Crop at render time so each sprite keeps its original transparent pixels. */
export function PlushSprite({ atlas, crop, ...props }: ArtProps & { atlas: Atlas; crop: Crop }) {
  const id = useId();
  return (
    <svg viewBox={crop.join(' ')} aria-hidden="true" {...props}>
      <defs>
        <clipPath id={id}>
          <rect x={crop[0]} y={crop[1]} width={crop[2]} height={crop[3]} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <image href={plushAssets[atlas]} width={sizes[atlas][0]} height={sizes[atlas][1]} />
      </g>
    </svg>
  );
}

const foodCrops: Record<Food, Crop> = {
  apple: [0, 0, 418, 418],
  banana: [418, 0, 472, 418],
  carrot: [890, 0, 364, 418],
  bread: [0, 418, 418, 418],
  strawberry: [418, 418, 418, 418],
  water: [836, 418, 418, 418],
};

export function FoodArt({ food, ...props }: ArtProps & { food: Food }) {
  return <PlushSprite atlas="small" crop={foodCrops[food]} {...props} />;
}

export type AnimalGesture = 'greet' | 'eat';
const poses: Record<Animal, readonly Crop[]> = {
  rabbit: [
    [30, 35, 310, 350],
    [400, 35, 310, 350],
    [755, 35, 310, 350],
    [1110, 35, 310, 350],
  ],
  bear: [
    [45, 416, 302, 290],
    [397, 416, 307, 290],
    [750, 416, 320, 290],
    [1100, 416, 330, 290],
  ],
  squirrel: [
    [55, 724, 320, 310],
    [405, 724, 340, 310],
    [750, 724, 330, 310],
    [1130, 724, 310, 310],
  ],
};
const bodyCenters: Record<Animal, readonly number[]> = {
  rabbit: [198, 552, 895, 1249],
  bear: [196, 550, 891, 1248],
  squirrel: [164, 534, 890, 1247],
};

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
  const crop = poses[animal][pose]!;
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
        atlas="friends"
        crop={crop}
        x={80 - (bodyCenters[animal][pose]! - crop[0]) * scale}
        y={193 - crop[3] * scale}
        width={crop[2] * scale}
        height={crop[3] * scale}
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
      <PlushSprite atlas="props" crop={[35, 568, 460, 412]} width={210} height={180} />
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
        <PlushSprite atlas="props" crop={[35, 568, 460, 412]} width={210} height={180} />
      </g>
    </svg>
  );
}

export function UmbrellaArt(props: ArtProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 600 330" preserveAspectRatio="none" aria-hidden="true" {...props}>
      <defs>
        <clipPath id={id}>
          <path d="M0 0H600V120H325V330H270V120H0Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <PlushSprite
          atlas="props"
          crop={[515, 540, 506, 453]}
          width={600}
          height={330}
          preserveAspectRatio="none"
        />
      </g>
    </svg>
  );
}

export function BlanketArt({ color: _color, ...props }: ArtProps & { color?: Blanket }) {
  return (
    <PlushSprite atlas="props" crop={[1002, 705, 534, 250]} preserveAspectRatio="none" {...props} />
  );
}
export function ButterflyArt() {
  return <PlushSprite atlas="small" crop={[0, 836, 440, 418]} />;
}
export function FrogArt() {
  return <PlushSprite atlas="small" crop={[440, 850, 430, 370]} />;
}
export function AcornArt() {
  return <PlushSprite atlas="small" crop={[890, 836, 364, 418]} />;
}

export function DiscoveryArt({ item }: { item: Discovery }) {
  const crops: Record<Discovery, Crop> = {
    butterfly: [0, 62, 512, 391],
    frog: [512, 100, 518, 353],
    acorn: [1040, 80, 496, 373],
  };
  return <PlushSprite atlas="explore" crop={crops[item]} />;
}

export function WeatherArt({ weather }: { weather: Weather }) {
  return (
    <PlushSprite
      atlas="explore"
      crop={weather === 'sun' ? [12, 475, 488, 475] : [529, 484, 494, 475]}
    />
  );
}

export function ForestArt() {
  return <PlushSprite atlas="explore" crop={[1040, 500, 496, 465]} />;
}
