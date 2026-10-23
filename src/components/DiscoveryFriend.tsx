import type { Discovery } from '../game/model';
import { AcornArt, ButterflyArt, FrogArt } from './PlushArt';

export function DiscoveryFriend({ item, playCount }: { item: Discovery; playCount: number }) {
  return (
    <span
      key={playCount}
      className={`friend-actor friend-${item} ${playCount ? 'responding' : ''} ${playCount === 1 ? 'first-play' : ''}`}
      aria-hidden="true"
    >
      {item === 'frog' && (
        <>
          <span className="friend-shadow" />
          <span className="frog-ripple" />
        </>
      )}
      <span className={`friend-motion ${playCount ? 'friend-playing' : ''}`}>
        {item === 'butterfly' ? (
          <span className="butterfly-wings">
            <ButterflyArt />
          </span>
        ) : item === 'frog' ? (
          <FrogArt />
        ) : (
          <AcornArt />
        )}
      </span>
    </span>
  );
}
