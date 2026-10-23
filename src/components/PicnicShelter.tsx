import { useLayoutEffect, useRef } from 'react';
import { ANIMALS } from '../game/model';
import { UmbrellaArt } from './PlushArt';

const headProfiles = {
  rabbit: { top: 0.12, eyes: 0.5 },
  bear: { top: 0.22, eyes: 0.44 },
  squirrel: { top: 0.19, eyes: 0.45 },
};

export function PicnicShelter() {
  const anchor = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const host = anchor.current;
    const scene = host?.closest<HTMLElement>('.picnic-scene');
    if (!host || !scene) return;
    const animals = ANIMALS.map((animal) => ({
      animal,
      element: scene.querySelector<HTMLElement>(`.animal-${animal}`)!,
    }));
    function alignShelter() {
      const frame = scene!.getBoundingClientRect();
      const friends = animals.map(({ animal, element }) => {
        const box = element.querySelector('svg[data-pose]')!.getBoundingClientRect();
        return {
          left: box.left - frame.left,
          right: box.right - frame.left,
          top: box.top - frame.top + box.height * headProfiles[animal].top,
          eyes: box.top - frame.top + box.height * headProfiles[animal].eyes,
        };
      });
      // Keep the cloth edge between the ear tips and the lowest safe eye line.
      const edge = Math.min(
        Math.max(...friends.map((friend) => friend.top)) + 7,
        Math.min(...friends.map((friend) => friend.eyes)) - 8,
      );
      const left = Math.min(...friends.map((friend) => friend.left));
      const right = Math.max(...friends.map((friend) => friend.right));
      const width = Math.min(
        frame.width - 16,
        Math.max(right - left + 24, Math.min(frame.width * 0.94, 740)),
      );
      const center = Math.max(
        width / 2 + 8,
        Math.min((left + right) / 2, frame.width - width / 2 - 8),
      );
      const height = Math.min(width * 0.27, frame.height * 0.36);
      const values = {
        'shelter-center': center,
        'shelter-width': width,
        'shelter-top': edge - height * 0.94,
        'shelter-height': height,
        'pole-top': edge - 8,
        'pole-height': Math.max(40, frame.height * 0.9 - edge + 8),
      };
      for (const [name, value] of Object.entries(values))
        host!.style.setProperty(`--${name}`, `${value}px`);
    }
    alignShelter();
    const observer = new ResizeObserver(alignShelter);
    observer.observe(scene);
    for (const { element } of animals) observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <span ref={anchor} className="shelter-anchor" aria-hidden="true">
      <UmbrellaArt layer="pole" className="umbrella umbrella-pole" />
      <UmbrellaArt layer="canopy-back" className="umbrella umbrella-canopy-back" />
      <UmbrellaArt layer="canopy" className="umbrella umbrella-canopy" />
    </span>
  );
}
