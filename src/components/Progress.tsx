import { chapters } from '../game/content';
import type { Phase } from '../game/model';
import { Icon } from './Illustrations';
import { JourneyArt } from './JourneyArt';

export function Progress({ phase }: { phase: Phase }) {
  return (
    <ol className="progress" aria-label="野餐旅程">
      {chapters.map((chapter, i) => (
        <li
          key={chapter.label}
          className={i === phase ? 'current' : i < phase ? 'complete' : ''}
          aria-current={i === phase ? 'step' : undefined}
        >
          <JourneyArt phase={i as Phase} />
          {i < phase && (
            <span className="journey-check" aria-hidden="true">
              <Icon name="check" />
            </span>
          )}
          <span className="sr-only">{chapter.label}</span>
        </li>
      ))}
    </ol>
  );
}
