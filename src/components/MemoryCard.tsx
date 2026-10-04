import { Landscape } from './Landscape';
import { AnimalArt, BlanketArt, FoodArt } from './Illustrations';
import type { PicnicState } from '../game/model';
import { ANIMALS } from '../game/model';

/** Self-contained SVG: used for both the preview and local PNG export. */
export function MemoryCard({ state, date }: { state: PicnicState; date: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 840"
      width="1200"
      height="840"
      role="img"
      aria-label="卡布的野餐纪念照"
    >
      <rect width="1200" height="840" rx="12" fill="#fffdf5" />
      <svg
        x="32"
        y="32"
        width="1136"
        height="570"
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid slice"
      >
        <Landscape weather={state.weather} />
        {state.weather === 'sun' ? (
          <circle cx="861" cy="80" r="30" fill="#e5c178" />
        ) : (
          <g fill="#fffdf0">
            <ellipse cx="840" cy="80" rx="55" ry="23" />
            <circle cx="825" cy="66" r="26" />
            <circle cx="855" cy="62" r="32" />
          </g>
        )}
        <BlanketArt color={state.blanket} x={345} y={348} width={510} height={170} />
        {ANIMALS.map((animal, i) => (
          <AnimalArt
            key={animal}
            animal={animal}
            happy
            x={365 + i * 158}
            y={170}
            width={155}
            height={224}
          />
        ))}
        {state.served.map((item, i) => (
          <FoodArt
            key={item.food}
            food={item.food}
            x={405 + (i % 6) * 65}
            y={382}
            width={65}
            height={65}
          />
        ))}
        {state.weather === 'rain' && (
          <g>
            <path d="M600 80v86q0 20 16 16" stroke="#ad8d63" strokeWidth="6" fill="none" />
            <path
              d="M499 99q98-140 202 0-27-20-51 0-28-22-50 0-26-21-50 0-29-22-51 0Z"
              fill="#e6c585"
            />
          </g>
        )}
      </svg>
      <text
        x="600"
        y="674"
        textAnchor="middle"
        fill="#435e4d"
        fontSize="39"
        fontFamily="STSong, Songti SC, serif"
      >
        卡布的森林野餐
      </text>
      <text
        x="600"
        y="724"
        textAnchor="middle"
        fill="#7b8572"
        fontSize="21"
        fontFamily="system-ui, sans-serif"
      >
        和喜欢的朋友，分享小小的快乐。
      </text>
      <text
        x="600"
        y="785"
        textAnchor="middle"
        fill="#a3977f"
        fontSize="17"
        letterSpacing="3"
        fontFamily="system-ui, sans-serif"
      >
        {date} · A LITTLE DAY TO REMEMBER
      </text>
    </svg>
  );
}
