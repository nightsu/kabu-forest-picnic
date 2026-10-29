import { useEffect, useState } from 'react';
import type { Discovery } from '../game/model';
import { AcornArt, ButterflyArt, FrogArt } from './PlushArt';
import { sprites } from '../assets/plush/artwork';

export function DiscoveryFriend({ item, playCount }: { item: Discovery; playCount: number }) {
  const source = item === 'acorn' ? null : sprites.butterflyBody.src;
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  useEffect(() => {
    if (!source) return;
    let active = true;
    const image = new Image();
    image.src = source;
    void image.decode().then(
      () => {
        if (active) setLoadedSource(source);
      },
      () => {
        if (active) setFailedSource(source);
      },
    );
    return () => {
      active = false;
    };
  }, [source]);
  const detailed = source !== null && loadedSource === source;
  const playing = playCount > 0 && (source === null || detailed || failedSource === source);
  return (
    <span
      key={playCount}
      className={`friend-actor friend-${item} ${playing ? 'responding' : ''} ${playCount === 1 ? 'first-play' : ''}`}
      aria-hidden="true"
    >
      {item === 'frog' && (
        <>
          <span className="friend-shadow" />
          <span className="frog-ripple" />
        </>
      )}
      <span className={`friend-motion ${playing ? 'friend-playing' : ''}`}>
        {item === 'butterfly' ? (
          <ButterflyArt animated={playing && detailed} />
        ) : item === 'frog' ? (
          <FrogArt animated={playing && detailed} />
        ) : (
          <AcornArt />
        )}
      </span>
    </span>
  );
}
