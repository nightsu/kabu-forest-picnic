import type { Phase } from '../game/model';
import { AnimalArt, BasketArt, BlanketArt, FoodArt } from './Illustrations';
import { ForestArt } from './PlushArt';

export function JourneyArt({ phase }: { phase: Phase }) {
  return (
    <span className={`journey-art journey-art-${phase}`} aria-hidden="true">
      {phase === 0 ? (
        <>
          <BasketArt foods={['apple']} />
        </>
      ) : phase === 1 ? (
        <ForestArt />
      ) : phase === 2 ? (
        <>
          <BlanketArt color="peach" className="journey-blanket" />
          <AnimalArt animal="rabbit" className="journey-friend" happy />
          <FoodArt food="strawberry" className="journey-snack" />
        </>
      ) : (
        <span className="journey-photo">
          <AnimalArt animal="rabbit" happy />
        </span>
      )}
    </span>
  );
}
