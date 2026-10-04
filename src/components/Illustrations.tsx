import { useId } from 'react';
import type { Animal, Blanket, Food } from '../game/model';
import { blanketColors } from '../game/content';

export function Sprout({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 27V16M16 21C3 23 3 9 4 7c11-1 14 6 12 14ZM16 15C15 4 23 2 29 4c0 8-5 13-13 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Icon({
  name,
  className = '',
}: {
  name:
    | 'sound'
    | 'mute'
    | 'arrow'
    | 'back'
    | 'camera'
    | 'download'
    | 'heart'
    | 'check'
    | 'refresh'
    | 'sun'
    | 'rain';
  className?: string;
}) {
  const paths = {
    sound: (
      <>
        <path d="m11 5-5 4H3v6h3l5 4V5Z" />
        <path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
      </>
    ),
    mute: (
      <>
        <path d="m11 5-5 4H3v6h3l5 4V5Z" />
        <path d="m16 9 5 6m0-6-5 6" />
      </>
    ),
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    back: <path d="M20 12H5m6-6-6 6 6 6" />,
    camera: (
      <>
        <path d="M4 6h4l2-3h4l2 3h4v14H4Z" />
        <circle cx="12" cy="12.5" r="4" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    heart: <path d="M12 20 3.5 12C-3 5 8 0 12 7c4-7 15-2 8.5 5L12 20Z" />,
    check: <path d="m5 12 4 4L20 5" />,
    refresh: (
      <>
        <path d="M20 8A9 9 0 1 0 21 15M20 3v6h-6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    rain: (
      <>
        <path d="M5 15a5 5 0 0 1 1-10 6 6 0 0 1 11 1 4 4 0 0 1 2 8H5m2 4-1 3m7-3-1 3m7-3-1 3" />
      </>
    ),
  };
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function FoodArt({
  food,
  ...props
}: {
  food: Food;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const pictures = {
    apple: (
      <>
        <path
          d="M49 27c-24-18-42 4-35 28 6 23 21 33 36 25 17 8 32-10 36-29 5-23-18-36-37-24Z"
          fill="#de7459"
        />
        <path
          d="M48 29q-3-17 6-22"
          fill="none"
          stroke="#81654b"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M54 18q8-18 26-9-6 16-26 9Z" fill="#6d8d65" />
        <path
          d="M29 34q-10 8-7 19"
          stroke="#f5b19b"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M50 78q10-3 14-10" stroke="#ca614a" strokeWidth="3" fill="none" />
      </>
    ),
    banana: (
      <>
        <path d="M24 22q2 41 51 35-18 36-49 18C7 62 7 38 20 21Z" fill="#edc668" />
        <path d="M23 29q-1 41 49 32" fill="none" stroke="#d6a443" strokeWidth="3" />
        <path d="m18 24 4-11 7 3-3 13" fill="#88754d" />
        <path d="m72 57 9-6 4 5-8 8" fill="#84704a" />
        <path
          d="M18 43q-1 12 7 21"
          fill="none"
          stroke="#fae09c"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </>
    ),
    bread: (
      <>
        <path d="M20 35C11 8 88 6 80 36v43q-30 10-60 0Z" fill="#cd965e" />
        <path d="M27 37C12 16 88 16 73 37v36q-24 8-46 0Z" fill="#f4d29a" />
        <path
          d="M35 28q14-5 28 0"
          stroke="#ffebc5"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="39" cy="49" r="2" fill="#d9ad73" />
        <circle cx="61" cy="58" r="2.5" fill="#d9ad73" />
        <circle cx="43" cy="68" r="1.7" fill="#d9ad73" />
      </>
    ),
    strawberry: (
      <>
        <path d="M19 34Q50 15 81 34c7 15-20 48-31 51-12-4-39-33-31-51Z" fill="#d96c67" />
        <path d="m50 28-24-5 13 15 11-7 12 8 15-17-24 6 2-17-8 1Z" fill="#749363" />
        {[
          [32, 43],
          [48, 47],
          [66, 43],
          [39, 60],
          [60, 61],
          [50, 72],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="1.8" ry="3" fill="#ffe0a0" />
        ))}
      </>
    ),
    carrot: (
      <>
        <path d="m48 28 25 14C60 65 27 86 19 86q3-26 29-58Z" fill="#e6a064" />
        <path
          d="m51 32 4-22m8 27 14-22m-9 25 21-9"
          stroke="#769268"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="m42 44 9 5m-20 8 7 5m-13 9 5 3"
          stroke="#c7834e"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    ),
    water: (
      <>
        <rect x="30" y="22" width="40" height="64" rx="14" fill="#a4c5c0" />
        <rect x="36" y="12" width="28" height="16" rx="5" fill="#688d87" />
        <path d="M31 43q19 5 38 0v23q-20 4-38 0Z" fill="#e9f0df" />
        <path d="M50 44q-15 15 0 17 15-2 0-17Z" fill="#81aea9" />
        <path d="M37 32v7" stroke="#d1e1d1" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" {...props}>
      {pictures[food]}
    </svg>
  );
}

function Face({ happy = false, y = 80 }: { happy?: boolean; y?: number }) {
  return (
    <g>
      <ellipse cx="51" cy={y + 14} rx="10" ry="6" fill="#e8a99a" opacity=".55" />
      <ellipse cx="109" cy={y + 14} rx="10" ry="6" fill="#e8a99a" opacity=".55" />
      {happy ? (
        <g stroke="#4a4035" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d={`M59 ${y}q5-7 10 0M91 ${y}q5-7 10 0`} />
        </g>
      ) : (
        <g fill="#4a4035">
          <ellipse cx="64" cy={y} rx="3.5" ry="4.5" />
          <ellipse cx="96" cy={y} rx="3.5" ry="4.5" />
        </g>
      )}
      <path d={`m75 ${y + 10} 5 5 5-5Z`} fill="#a37566" />
      <path
        d={`M80 ${y + 15}q-1 7-7 4m7-4q1 7 7 4`}
        stroke="#7b6557"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function AnimalArt({
  animal,
  happy = false,
  ...props
}: {
  animal: Animal;
  happy?: boolean;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  return (
    <svg viewBox="0 0 160 200" aria-hidden="true" {...props}>
      <ellipse cx="80" cy="190" rx="52" ry="7" fill="#526f50" opacity=".11" />
      {animal === 'rabbit' && (
        <>
          <path
            d="M45 64C20-1 49-20 62 52M92 52C97-18 130-3 111 66"
            fill="#fcf6e7"
            stroke="#e4d8bd"
            strokeWidth="2"
          />
          <path d="M48 47Q32 1 47 8l10 41M102 46q8-47 15-38l-7 43" fill="#e8b9ad" />
          <ellipse cx="80" cy="141" rx="40" ry="45" fill="#f8f0dc" />
          <path d="M49 119q31 13 62 0l11 55q-42 13-84 0Z" fill="#86a490" />
          <path d="m64 118 16 13 16-13" fill="#f4e9d2" />
          <path d="M78 134v42" stroke="#6c8d77" strokeWidth="2" />
          <ellipse cx="45" cy="137" rx="12" ry="21" fill="#fcf6e7" transform="rotate(24 45 137)" />
          <ellipse
            cx="116"
            cy="137"
            rx="12"
            ry="21"
            fill="#fcf6e7"
            transform="rotate(-24 116 137)"
          />
          <ellipse cx="57" cy="182" rx="18" ry="9" fill="#fcf6e7" />
          <ellipse cx="101" cy="182" rx="18" ry="9" fill="#fcf6e7" />
          <path d="M34 79q0-38 46-37t46 38q1 39-46 39T34 79" fill="#fcf6e7" />
          <Face happy={happy} />
        </>
      )}
      {animal === 'bear' && (
        <>
          <circle cx="39" cy="49" r="23" fill="#bd8b61" />
          <circle cx="122" cy="49" r="23" fill="#bd8b61" />
          <circle cx="39" cy="49" r="12" fill="#d5aa82" />
          <circle cx="122" cy="49" r="12" fill="#d5aa82" />
          <ellipse cx="81" cy="139" rx="47" ry="48" fill="#bd8b61" />
          <ellipse cx="82" cy="143" rx="31" ry="33" fill="#dfba8c" />
          <ellipse cx="35" cy="137" rx="15" ry="27" fill="#bd8b61" transform="rotate(18 35 137)" />
          <ellipse
            cx="126"
            cy="137"
            rx="15"
            ry="27"
            fill="#bd8b61"
            transform="rotate(-18 126 137)"
          />
          <ellipse cx="52" cy="182" rx="23" ry="12" fill="#ac7b54" />
          <ellipse cx="108" cy="182" rx="23" ry="12" fill="#ac7b54" />
          <path d="M28 79q1-47 52-47t52 47q2 44-52 43T28 79" fill="#c69569" />
          <ellipse cx="80" cy="97" rx="24" ry="17" fill="#ecd1a7" />
          <Face happy={happy} y={78} />
          <path d="m52 116 28 6 28-6-6 19-22-6-22 6Z" fill="#ca785d" />
          <circle cx="80" cy="126" r="6" fill="#dc9576" />
        </>
      )}
      {animal === 'squirrel' && (
        <>
          <path d="M111 165c62-8 64-91 23-91-37 0-30 40-13 36 15-8 15 13-1 20Z" fill="#ae7250" />
          <path
            d="M131 98q25-14 19 22"
            fill="none"
            stroke="#cd9468"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="m42 68-8-38 32 23m31-1 27-25-2 47" fill="#bd805a" />
          <path d="m46 53-5-14 18 18m44 1 15-18-2 20" fill="#e7ba97" />
          <ellipse cx="78" cy="143" rx="35" ry="42" fill="#bd805a" />
          <ellipse cx="78" cy="148" rx="24" ry="30" fill="#f3d7ad" />
          <ellipse cx="45" cy="142" rx="11" ry="22" fill="#bd805a" transform="rotate(24 45 142)" />
          <ellipse
            cx="111"
            cy="140"
            rx="11"
            ry="22"
            fill="#bd805a"
            transform="rotate(-24 111 140)"
          />
          <ellipse cx="56" cy="182" rx="18" ry="9" fill="#a96849" />
          <ellipse cx="100" cy="182" rx="18" ry="9" fill="#a96849" />
          <path d="M30 82q5-39 49-39t48 40q0 36-48 37T30 82" fill="#c88e62" />
          <path d="M31 86q21-6 49 13 25-20 47-13-5 34-48 34T31 86" fill="#f3d7ad" />
          <Face happy={happy} y={80} />
          <path d="m60 121 19 8 17-8-7 22-12-9-12 8Z" fill="#829e87" />
        </>
      )}
    </svg>
  );
}

export function BasketArt({ className = '' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 210 160" className={className} aria-hidden="true">
      <defs>
        <pattern id={id} width="18" height="15" patternUnits="userSpaceOnUse">
          <path d="M0 0h18v15H0Z" fill="#c99c63" />
          <path d="M0 7h18M9 0v7M0 7v8M18 7v8" stroke="#b68750" strokeWidth="2" />
        </pattern>
      </defs>
      <ellipse cx="107" cy="147" rx="83" ry="9" fill="#58704a" opacity=".12" />
      <path d="M49 74C45-7 164-7 161 74" fill="none" stroke="#aa784a" strokeWidth="12" />
      <path d="M49 73C48 2 162 2 161 73" fill="none" stroke="#d7b17c" strokeWidth="5" />
      <path
        d="m23 68 17 68q64 19 131 0l17-68Z"
        fill={`url(#${id})`}
        stroke="#aa7c4c"
        strokeWidth="3"
      />
      <path d="m25 67 38 2 13 52-29-13Z" fill="#f7eddb" />
      <path d="m43 69 14 42m-22-21 34 6" stroke="#d9937e" strokeWidth="6" opacity=".8" />
      <path
        d="M26 68q78 18 159 0"
        stroke="#e0ba85"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="96" y="93" width="24" height="22" rx="5" fill="#9c7148" />
      <path d="m105 98 7 6-7 6" stroke="#f3d39d" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function BlanketArt({
  color = 'peach',
  ...props
}: {
  color?: Blanket;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 480 160" aria-hidden="true" {...props}>
      <defs>
        <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
          <rect width="44" height="44" fill="#faf0d9" />
          <path d="M0 11h44M11 0v44" stroke={blanketColors[color]} strokeWidth="22" opacity=".6" />
        </pattern>
      </defs>
      <path
        d="m72 13 335 4 66 118-467-6Z"
        fill="#59704f"
        opacity=".12"
        transform="translate(0 9)"
      />
      <path d="m74 8 328 5 68 116L7 122Z" fill={`url(#${id})`} stroke="#fff4df" strokeWidth="3" />
      <path
        d="m15 127-6 9m24-8-5 9m23-8-4 9m24-8-4 9m350-6 5 9m-25-10 5 9m-26-9 4 9"
        stroke="#d6bca0"
        strokeWidth="3"
      />
    </svg>
  );
}

export function ButterflyArt() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M49 45C3-17 0 66 43 55 8 91 56 100 50 58c-4 42 44 33 8-3C99 67 99-16 51 45"
        fill="#e4ba69"
      />
      <path d="M30 26q-19 4 4 22M70 26q19 4-4 22" fill="#f6d998" />
      <path
        d="m49 39-4-12m7 12 5-12M50 40v25"
        stroke="#7b7551"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FrogArt() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="82" rx="40" ry="9" fill="#638d70" opacity=".2" />
      <path d="M23 69q-22 16 1 18h53q23-2 0-18" fill="#709668" />
      <ellipse cx="50" cy="61" rx="33" ry="25" fill="#91ae77" />
      <circle cx="29" cy="38" r="13" fill="#91ae77" />
      <circle cx="70" cy="38" r="13" fill="#91ae77" />
      <circle cx="29" cy="38" r="7" fill="#fff5d9" />
      <circle cx="70" cy="38" r="7" fill="#fff5d9" />
      <circle cx="30" cy="39" r="3" fill="#425847" />
      <circle cx="69" cy="39" r="3" fill="#425847" />
      <path
        d="M36 61q14 13 28 0"
        stroke="#4f704d"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AcornArt() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M25 47q0 33 25 39 26-6 26-39" fill="#be8b54" />
      <path d="M20 49q-2-32 30-32 33 1 31 32Z" fill="#876b49" />
      <path d="m50 21 5-14" stroke="#876b49" strokeWidth="6" strokeLinecap="round" />
      <path
        d="m32 34 5 5m12-11 5 5m12 1 5 5m-23 2 5 5"
        stroke="#b8996b"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
