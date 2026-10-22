import { useId } from 'react';
import type { Food } from '../game/model';
import { AcornArt, FoodArt } from './PlushArt';

export function ServingArt({
  foods,
  acorn = false,
  ...props
}: {
  foods: readonly Food[];
  acorn?: boolean;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const id = useId();
  const snacks: (Food | 'acorn')[] = [
    ...foods.filter((food) => food !== 'water'),
    ...(acorn ? ['acorn' as const] : []),
  ];
  const columns = Math.min(3, snacks.length);
  const rows = Math.ceil(snacks.length / 3);
  return (
    <svg viewBox="0 0 180 100" aria-hidden="true" {...props}>
      <defs>
        <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 1h4M1 0v4" stroke="#718c7b" strokeWidth=".5" opacity=".13" />
        </pattern>
      </defs>
      <ellipse cx="87" cy="78" rx="76" ry="20" fill="#315c41" opacity=".14" />
      <ellipse cx="87" cy="71" rx="77" ry="25" fill="#b2cec2" stroke="#7eaa97" strokeWidth="2" />
      <ellipse cx="87" cy="68" rx="66" ry="19" fill="#fbf7e9" stroke="#e2e5cd" strokeWidth="2" />
      <ellipse cx="87" cy="71" rx="73" ry="22" fill={`url(#${id})`} />
      <ellipse
        cx="87"
        cy="71"
        rx="73"
        ry="22"
        fill="none"
        stroke="#faf8e7"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {snacks.map((food, index) => (
        <g
          key={food}
          className="plate-food"
          data-plate-food={food === 'acorn' ? undefined : food}
          data-plate-acorn={food === 'acorn' ? true : undefined}
        >
          {food === 'acorn' ? (
            <svg
              className="plate-acorn-art"
              viewBox="0 0 100 100"
              x={87 - columns * 21 + (index % 3) * 42}
              y={rows > 1 ? 8 + Math.floor(index / 3) * 28 : 29}
              width={42}
              height={46}
            >
              <AcornArt />
            </svg>
          ) : (
            <FoodArt
              food={food}
              x={87 - columns * 21 + (index % 3) * 42}
              y={rows > 1 ? 8 + Math.floor(index / 3) * 28 : 29}
              width={42}
              height={46}
            />
          )}
        </g>
      ))}
      {foods.includes('water') && (
        <g className="plate-food" data-plate-food="water">
          <FoodArt food="water" x={143} y={14} width={34} height={65} />
        </g>
      )}
    </svg>
  );
}
