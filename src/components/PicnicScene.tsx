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
  FrogArt,
  Icon,
  UmbrellaArt,
} from './Illustrations';
import { Landscape } from './Landscape';
import { DiscoveryArt, WeatherArt } from './PlushArt';
import { ServingArt } from './ServingArt';

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
  const [lastAction, setLastAction] = useState<Record<string, 'greet' | 'eat'>>({});
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
        <span key={state.weather} className="weather-art">
          <WeatherArt weather={state.weather} />
        </span>
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
                  setLastAction((previous) => ({
                    ...previous,
                    [animal]: state.phase === 2 && state.selected ? 'eat' : 'greet',
                  }));
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
                    happy={state.phase === 3}
                    gesture={
                      servings.length > 0 && lastAction[animal] === 'eat'
                        ? 'eat'
                        : plays[animal]
                          ? 'greet'
                          : undefined
                    }
                  />
                </motion.div>
                <span className="sr-only">
                  {animalNames[animal]}
                  {servings.length > 0 && <span className="tiny-heart">♥</span>}
                </span>
                {state.phase === 2 && (
                  <span
                    className="serving-plate"
                    role="img"
                    data-animal-plate={animal}
                    aria-label={
                      servings.length
                        ? `${animalNames[animal]}的餐盘：${servings.map((item) => foodNames[item.food]).join('、')}`
                        : `${animalNames[animal]}的小餐盘`
                    }
                  >
                    <ServingArt foods={servings.map((item) => item.food)} />
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
                  <DiscoveryArt item={item} />
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
