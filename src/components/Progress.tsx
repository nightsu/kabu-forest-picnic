import { chapters } from '../game/content';
import type { Phase } from '../game/model';
import { Icon } from './Illustrations';

export function Progress({ phase }: { phase: Phase }) {
  return (
    <ol className="progress" aria-label="野餐旅程">
      {chapters.map((chapter, i) => (
        <li
          key={chapter.label}
          className={i === phase ? 'current' : i < phase ? 'complete' : ''}
          aria-current={i === phase ? 'step' : undefined}
        >
          <span className="step-number">{i < phase ? <Icon name="check" /> : i + 1}</span>
          <span>{chapter.label}</span>
          {i < chapters.length - 1 && <span className="step-line" />}
        </li>
      ))}
    </ol>
  );
}
