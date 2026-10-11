import type { Phase } from '../game/model';
import { AnimalArt, BasketArt, BlanketArt, FoodArt } from './Illustrations';

export function JourneyArt({ phase }: { phase: Phase }) {
  return (
    <span className={`journey-art journey-art-${phase}`} aria-hidden="true">
      {phase === 0 ? (
        <>
          <BasketArt foods={['apple']} />
        </>
      ) : phase === 1 ? (
        <svg viewBox="0 0 100 100">
          <path d="M4 87Q43 62 96 87Z" fill="#a4c37b" />
          <path d="M48 100q-21-15 8-23h12q-25 12 9 23Z" fill="#edcb77" />
          <path
            d="M24 77V47m30 26V32m25 48V49"
            stroke="#99774d"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M5 60 24 20 44 60Z" fill="#4d9879" />
          <path d="M29 47 54 3 80 47Z" fill="#6eaa69" />
          <path d="M59 63 79 24 98 63Z" fill="#408879" />
        </svg>
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
