import type { Weather } from '../game/model';
import { forestUrl } from '../assets/plush/artwork';

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
      <image href={forestUrl} width="1200" height="520" preserveAspectRatio="xMidYMid slice" />
      {weather === 'rain' && <rect width="1200" height="520" fill="#668b9a" opacity=".12" />}
    </svg>
  );
}
