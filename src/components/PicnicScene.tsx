import { motion } from 'motion/react';
import { useState } from 'react';
import type { Animal, Discovery, PicnicAction, PicnicState } from '../game/model';
import { ANIMALS } from '../game/model';
import { animalNames, discoveryNames, foodNames } from '../game/content';
import {
  AcornArt,
  AnimalArt,
  BasketArt,
  BlanketArt,
  ButterflyArt,
  FoodArt,
  FrogArt,
  Icon,
  UmbrellaArt,
} from './Illustrations';
import { Flower, Landscape } from './Landscape';

interface Props {
  state: PicnicState;
  message: string;
  onAction: (action: PicnicAction) => void;
  onAnimal: (animal: Animal) => void;
  onDiscover: (item: Discovery) => void;
  onReplay: () => void;
}

const discoveries: { item: Discovery; label: string; aria: string }[] = [
  { item: 'butterfly', label: '看看花丛', aria: '找找花丛里的朋友' },
  { item: 'frog', label: '听听池塘', aria: '看看池塘里的朋友' },
  { item: 'acorn', label: '敲敲树洞', aria: '敲敲树洞' },
];

export function PicnicScene({ state, message, onAction, onAnimal, onDiscover, onReplay }: Props) {
  const [plays, setPlays] = useState<Record<string, number>>({});
  function play(friend: Animal | Discovery) {
    setPlays((previous) => ({ ...previous, [friend]: (previous[friend] ?? 0) + 1 }));
  }
  return (
    <section
      className={`picnic-scene phase-${state.phase} weather-${state.weather}`}
      aria-label="森林游戏场景"
    >
      <Landscape className="landscape" weather={state.weather} />
      <motion.button
        className="weather-button"
        aria-label={state.weather === 'sun' ? '变成下雨天' : '变成晴天'}
        onClick={() =>
          onAction({ type: 'WEATHER', weather: state.weather === 'sun' ? 'rain' : 'sun' })
        }
        whileTap={{ scale: 0.9 }}
      >
        {state.weather === 'sun' ? (
          <svg viewBox="0 0 90 90" aria-hidden="true">
            <g stroke="#d9bb74" strokeWidth="3" strokeLinecap="round">
              <path d="M45 5v8m0 64v8M5 45h8m64 0h8M17 17l6 6m44 44 6 6M17 73l6-6m44-44 6-6" />
            </g>
            <circle cx="45" cy="45" r="23" fill="#e8c77c" />
            <path d="M35 44v3m20-3v3" stroke="#927a47" strokeWidth="3" strokeLinecap="round" />
            <path d="M40 54q5 4 10 0" stroke="#927a47" strokeWidth="2" fill="none" />
          </svg>
        ) : (
          <svg viewBox="0 0 90 90" aria-hidden="true">
            <path
              d="M20 60q-21-11-5-26 9-10 19-4 11-28 31-8 7 8 5 17 22 0 18 17-5 11-20 10Z"
              fill="#f4f2e9"
            />
            <path
              d="m29 72-3 7m25-7-3 7m25-7-3 7"
              stroke="#89a9a5"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </motion.button>
      <button
        className="speech-bubble"
        onClick={onReplay}
        title="再听一次"
        aria-label={`再听一次：${message}`}
      >
        <Icon name="sound" />
        <span className="sr-only" role="status" aria-live="polite">
          {message}
        </span>
      </button>
      {state.phase !== 1 && (
        <>
          <BlanketArt color={state.blanket} className="scene-blanket" />
          <div className="scene-basket">
            <BasketArt
              foods={state.packed.filter(
                (food) => !state.served.some((item) => item.food === food),
              )}
            />
          </div>
          {ANIMALS.map((animal) => {
            const servings = state.served.filter((item) => item.animal === animal);
            return (
              <motion.button
                key={animal}
                type="button"
                className={`animal animal-${animal} ${state.selected ? 'ready-to-share' : ''}`}
                aria-label={animalNames[animal]}
                onClick={() => {
                  play(animal);
                  onAnimal(animal);
                }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.92 }}
              >
                <motion.div
                  key={`${servings.length}-${plays[animal] ?? 0}`}
                  className={plays[animal] ? 'animal-playing' : ''}
                >
                  <AnimalArt
                    animal={animal}
                    happy={servings.length > 0 || !!plays[animal] || state.phase === 3}
                  />
                </motion.div>
                <span className="sr-only">
                  {animalNames[animal]}
                  {servings.length > 0 && <span className="tiny-heart">♥</span>}
                </span>
                {servings.length > 0 && (
                  <span
                    className="animal-treat"
                    aria-label={`收到${servings.map((item) => foodNames[item.food]).join('、')}`}
                  >
                    <span key={servings.length} className="treat-bite">
                      <FoodArt food={servings[servings.length - 1]!.food} />
                    </span>
                    <span>×{servings.length}</span>
                  </span>
                )}
              </motion.button>
            );
          })}
        </>
      )}
      {state.phase === 1 && (
        <div className="discoveries">
          {discoveries.map(({ item, label, aria }) => {
            const found = state.discoveries.includes(item);
            return (
              <motion.button
                key={item}
                className={`discovery discovery-${item} ${found ? 'found' : ''}`}
                aria-label={aria}
                onClick={() => {
                  play(item);
                  onDiscover(item);
                }}
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: -5 }}
              >
                <div className="discovery-art">
                  {item === 'butterfly' && (
                    <svg viewBox="0 0 160 160" aria-hidden="true">
                      <path d="M5 145q0-44 33-36 5-63 49-37 50-15 66 73Z" fill="#8fa676" />
                      <Flower x={52} y={82} color="#edc7a5" scale={1.6} />
                      <Flower x={110} y={99} color="#f9e6bc" scale={1.3} />
                    </svg>
                  )}
                  {item === 'frog' && (
                    <svg viewBox="0 0 160 160" aria-hidden="true">
                      <ellipse cx="80" cy="128" rx="76" ry="25" fill="#8cad9c" />
                      <ellipse cx="80" cy="123" rx="68" ry="17" fill="#b1cdb8" />
                      <path d="M67 131q-2-23 41-15l-18 11 17 11q-29 7-40-7Z" fill="#8ea870" />
                    </svg>
                  )}
                  {item === 'acorn' && (
                    <svg viewBox="0 0 160 160" aria-hidden="true">
                      <path d="M38 39q45-23 85 0l5 99H30Z" fill="#b89a70" />
                      <ellipse cx="80" cy="39" rx="43" ry="13" fill="#dfc39a" />
                      <ellipse
                        cx="80"
                        cy="39"
                        rx="26"
                        ry="6"
                        fill="none"
                        stroke="#c7a877"
                        strokeWidth="3"
                      />
                      <path d="M49 49v69m12-64 2 17m48-19-4 74" stroke="#9f815a" strokeWidth="3" />
                      <ellipse cx="82" cy="99" rx="21" ry="30" fill="#756548" />
                    </svg>
                  )}
                  {found && (
                    <motion.span
                      key={plays[item] ?? 0}
                      className={`found-friend ${plays[item] ? 'friend-playing' : ''}`}
                      initial={{ y: 20, scale: 0 }}
                      animate={{ y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 230, damping: 14 }}
                    >
                      {item === 'butterfly' ? (
                        <ButterflyArt />
                      ) : item === 'frog' ? (
                        <FrogArt />
                      ) : (
                        <AcornArt />
                      )}
                    </motion.span>
                  )}
                  {!found && <span className="discovery-question">?</span>}
                </div>
                <span className="sr-only">{found ? `${discoveryNames[item]}，你好！` : label}</span>
              </motion.button>
            );
          })}
        </div>
      )}
      {state.phase === 2 && (
        <div className="picnic-companions">
          {state.discoveries.map((item) => (
            <button
              key={item}
              type="button"
              className={`companion companion-${item} ${state.acornGifted && item === 'acorn' ? 'gifted' : ''}`}
              aria-label={
                item === 'acorn'
                  ? state.acornGifted
                    ? '看看小松鼠的橡果'
                    : '把橡果送给小松鼠'
                  : `和${discoveryNames[item]}玩`
              }
              onClick={() => {
                play(item);
                if (item === 'acorn') {
                  play('squirrel');
                  onAction({ type: 'GIVE_ACORN' });
                } else onDiscover(item);
              }}
            >
              <span key={plays[item] ?? 0} className={plays[item] ? 'friend-playing' : ''}>
                {item === 'butterfly' ? (
                  <ButterflyArt />
                ) : item === 'frog' ? (
                  <FrogArt />
                ) : (
                  <AcornArt />
                )}
              </span>
              {item === 'acorn' && !state.acornGifted && (
                <span className="sr-only">送给小松鼠</span>
              )}
              {item === 'acorn' && state.acornGifted && (
                <span className="gift-heart" aria-hidden="true">
                  ♥
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {state.weather === 'rain' && (
        <>
          <svg
            className="rain-overlay"
            viewBox="0 0 1200 520"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {Array.from({ length: 30 }, (_, i) => ({ x: (i * 137) % 1200, y: (i * 83) % 470 }))
              .filter(({ x, y }) => state.phase === 1 || y < 140 || x < 100 || x > 1140)
              .map(({ x, y }, i) => (
                <path
                  key={i}
                  d={`m${x} ${y} -5 15`}
                  stroke="#8baca5"
                  strokeWidth="2"
                  opacity=".35"
                />
              ))}
          </svg>
          {state.phase !== 1 && <UmbrellaArt className="umbrella" />}
        </>
      )}
    </section>
  );
}
