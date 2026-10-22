export {
  FoodArt,
  AnimalArt,
  BasketArt,
  UmbrellaArt,
  BlanketArt,
  ButterflyArt,
  FrogArt,
  AcornArt,
} from './PlushArt';

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
