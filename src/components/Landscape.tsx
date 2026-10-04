import type { Weather } from '../game/model';

function Tree({
  x,
  y,
  scale = 1,
  light = false,
}: {
  x: number;
  y: number;
  scale?: number;
  light?: boolean;
}) {
  const color = light ? '#aebc8d' : '#7d9a76';
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-13 175-8 25 14 29 20 178Z" fill="#b1966e" />
      <path
        d="m2 127-27-33m33-8 25-30"
        fill="none"
        stroke="#b1966e"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M-8-118C-80-115-87-43-66-19c-44 34-16 92 24 88 10 33 77 36 87 0 56 6 76-51 44-79 18-48-21-107-65-98Z"
        fill={color}
      />
      <path
        d="M-40-67q-13 16-8 31m64-56q19 0 29 15m14 63q13 5 11 21M-22 45q13 9 26 6"
        stroke={light ? '#c8cea5' : '#9eb28e'}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path d="m-12 179 12-19 11 19 12-7 9 8" fill="#78905f" />
    </g>
  );
}

export function Flower({
  x,
  y,
  color = '#f3d6ac',
  scale = 1,
}: {
  x: number;
  y: number;
  color?: string;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 0v26m0-9q-12-14-16-6 2 10 16 12m0-8q8-11 14-8-1 10-14 12"
        fill="#81965e"
        stroke="#81965e"
        strokeWidth="2"
      />
      <g fill={color}>
        <ellipse cy="-7" rx="5" ry="8" />
        <ellipse cy="7" rx="5" ry="8" />
        <ellipse cx="-7" rx="8" ry="5" />
        <ellipse cx="7" rx="8" ry="5" />
      </g>
      <circle r="4" fill="#cba85d" />
    </g>
  );
}

export function Landscape({
  weather = 'sun',
  className = '',
}: {
  weather?: Weather;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="1200" height="520" fill={weather === 'rain' ? '#dce6dc' : '#edf0de'} />
      <path d="M0 290Q150 148 331 241T640 235 926 223 1200 220V520H0Z" fill="#d5dfbb" />
      <path d="M0 369Q234 246 454 309t363-13 383 27v197H0Z" fill="#bfcea2" />
      <path d="M0 412q248-104 521-39 357-100 679 18v129H0Z" fill="#b3c494" />
      <path
        d="M729 271c-5 63-140 45-177 96-28 43 129 53 44 153H366c166-114 76-110 133-167 51-48 215-41 230-82"
        fill="#e3dabb"
        opacity=".82"
      />
      <g fill="#fffdf1" opacity=".8">
        <path d="M310 97q-9-20 10-24 4-27 26-17 21-13 30 9 25-2 24 26Z" />
        <path d="M766 116q-10-18 11-22 2-21 20-16 16-19 33 7 20 1 24 21Z" />
        <path d="M511 50q-3-12 10-14 9-20 24-7 20-10 25 12Z" />
      </g>
      <Tree x={138} y={194} scale={1.55} />
      <Tree x={1057} y={145} scale={1.75} light />
      <Tree x={23} y={247} scale={1.18} light />
      <Tree x={1191} y={250} scale={1.25} />
      <g fill="#a9bb8e">
        <ellipse cx="221" cy="375" rx="67" ry="37" />
        <ellipse cx="974" cy="344" rx="77" ry="35" />
      </g>
      <ellipse cx="904" cy="432" rx="96" ry="28" fill="#94b8aa" />
      <ellipse cx="904" cy="428" rx="76" ry="17" fill="#afcfc0" />
      <path
        d="M861 425h27m28 10h39m-18-16h21"
        stroke="#d5e5cb"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m831 428-4-40m11 37 12-29m-12 32-2-22"
        stroke="#819969"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g fill="#93aa78">
        <path d="M0 504q53-79 97-27 49-54 77-6 69-61 101 49H0ZM929 520q11-67 72-41 15-52 61-25 64-71 91 7 44-14 47 59Z" />
      </g>
      <Flower x={265} y={413} color="#e9b29b" />
      <Flower x={235} y={437} scale={0.7} />
      <Flower x={287} y={448} scale={0.8} />
      <Flower x={966} y={466} color="#f7ecd0" scale={0.9} />
      <Flower x={1069} y={426} scale={0.65} />
      <Flower x={128} y={461} color="#f7ecd0" scale={0.8} />
      <g fill="#f0e4bb">
        <circle cx="369" cy="465" r="3" />
        <circle cx="704" cy="468" r="3" />
        <circle cx="817" cy="351" r="2" />
        <circle cx="344" cy="356" r="2" />
        <circle cx="776" cy="437" r="3" />
      </g>
      <g stroke="#8fa775" strokeWidth="2.5" strokeLinecap="round">
        <path d="m367 409-4-7m7 7 3-10m355 42 2-8m5 9 5-6m-405 85 1-8m5 8 5-5m305-125 1-8m5 9 5-5" />
      </g>
      <g transform="translate(188 341)">
        <path d="M0 35V14h16v21" fill="#f2dfb7" />
        <path d="M-9 17q16-31 34 0Z" fill="#c98769" />
        <circle cx="8" cy="10" r="3" fill="#f7e4c1" />
      </g>
      <g transform="translate(999 381) scale(.75)">
        <path d="M0 35V14h16v21" fill="#f2dfb7" />
        <path d="M-9 17q16-31 34 0Z" fill="#c98769" />
        <circle cx="8" cy="10" r="3" fill="#f7e4c1" />
      </g>
    </svg>
  );
}
