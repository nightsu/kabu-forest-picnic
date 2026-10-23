import { Landscape } from './Landscape';
import {
  AcornArt,
  AnimalArt,
  BlanketArt,
  ButterflyArt,
  FrogArt,
  UmbrellaArt,
} from './Illustrations';
import type { PicnicState } from '../game/model';
import { ANIMALS } from '../game/model';
import { WeatherArt } from './PlushArt';
import { ServingArt } from './ServingArt';

/** Shared composition; exportMemory embeds the raster artwork before PNG export. */
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
        <svg x="865" y="24" width="115" height="115" viewBox="0 0 100 100">
          <WeatherArt weather={state.weather} />
        </svg>
        {state.weather === 'rain' && (
          <>
            <UmbrellaArt layer="pole" x={295} y={227} width={620} height={260} />
            <UmbrellaArt layer="canopy-back" x={295} y={78} width={620} height={167} />
          </>
        )}
        <BlanketArt color={state.blanket} x={280} y={300} width={650} height={190} />
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
        {ANIMALS.map((animal, i) => (
          <g key={animal} data-memory-plate={animal}>
            <ServingArt
              foods={state.served.filter((item) => item.animal === animal).map((item) => item.food)}
              acorn={animal === 'squirrel' && state.acornGifted}
              x={370 + i * 158}
              y={358}
              width={150}
              height={84}
            />
          </g>
        ))}
        {state.weather === 'rain' && (
          <UmbrellaArt
            layer="canopy"
            className="memory-canopy"
            x={295}
            y={78}
            width={620}
            height={167}
          />
        )}
        {state.discoveries
          .filter((item) => item !== 'acorn' || !state.acornGifted)
          .map((item) => (
            <svg
              key={item}
              data-memory-discovery={item}
              x={item === 'butterfly' ? 300 : item === 'frog' ? 900 : state.acornGifted ? 735 : 300}
              y={item === 'butterfly' ? 200 : 425}
              width={65}
              height={65}
              viewBox="0 0 100 100"
            >
              {item === 'butterfly' ? (
                <ButterflyArt />
              ) : item === 'frog' ? (
                <FrogArt />
              ) : (
                <AcornArt />
              )}
            </svg>
          ))}
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
