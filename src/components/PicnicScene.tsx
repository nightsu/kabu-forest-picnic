import { AnimatePresence, motion } from 'motion/react';
import type { Animal, Discovery, PicnicAction, PicnicState } from '../game/model';
import { ANIMALS } from '../game/model';
import { animalNames, chapters, discoveryNames, foodNames } from '../game/content';
import {
  AcornArt,
  AnimalArt,
  BasketArt,
  BlanketArt,
  ButterflyArt,
  FoodArt,
  FrogArt,
  Icon,
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
  return (
    <section
      className={`picnic-scene phase-${state.phase} weather-${state.weather}`}
      aria-label="森林游戏场景"
    >
      <Landscape className="landscape" weather={state.weather} />
      <div className="scene-label">
        <span className="live-dot" />
        森林的一个好日子<span className="label-separator">/</span>
        <span>慢慢玩，不着急</span>
      </div>
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
        <span>{state.weather === 'sun' ? '点点太阳' : '雨也很温柔'}</span>
      </motion.button>
      <button className="speech-bubble" onClick={onReplay} aria-label={`再听一次：${message}`}>
        <Icon name="sound" />
        <span role="status" aria-live="polite">
          {message}
        </span>
      </button>
      {state.phase !== 1 && (
        <>
          <BlanketArt color={state.blanket} className="scene-blanket" />
          <div className="scene-basket">
            <BasketArt />
            <div className="basket-foods">
              {state.packed
                .filter((food) => !state.served.some((item) => item.food === food))
                .map((food) => (
                  <motion.div
                    key={food}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <FoodArt food={food} />
                  </motion.div>
                ))}
            </div>
          </div>
          {ANIMALS.map((animal) => {
            const servings = state.served.filter((item) => item.animal === animal);
            return (
              <motion.button
                key={animal}
                type="button"
                className={`animal animal-${animal} ${state.selected ? 'ready-to-share' : ''}`}
                aria-label={animalNames[animal]}
                onClick={() => onAnimal(animal)}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.92 }}
              >
                <motion.div
                  key={servings.length}
                  animate={servings.length ? { y: [0, -12, 0], rotate: [0, -4, 4, 0] } : {}}
                  transition={{ duration: 0.55 }}
                >
                  <AnimalArt animal={animal} happy={servings.length > 0 || state.phase === 3} />
                </motion.div>
                <span className="animal-name">
                  {animalNames[animal]}
                  {servings.length > 0 && <span className="tiny-heart">♥</span>}
                </span>
                {servings.length > 0 && (
                  <span
                    className="animal-treat"
                    aria-label={`收到${servings.map((item) => foodNames[item.food]).join('、')}`}
                  >
                    <FoodArt food={servings[servings.length - 1]!.food} />
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
                onClick={() => onDiscover(item)}
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
                  <AnimatePresence>
                    {found && (
                      <motion.span
                        className="found-friend"
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
                  </AnimatePresence>
                  {!found && <span className="discovery-question">?</span>}
                </div>
                <span className="discovery-name">
                  {found ? `${discoveryNames[item]}，你好！` : label}
                </span>
              </motion.button>
            );
          })}
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
            {Array.from({ length: 30 }, (_, i) => (
              <path
                key={i}
                d={`m${(i * 137) % 1200} ${(i * 83) % 470} -5 15`}
                stroke="#8baca5"
                strokeWidth="2"
                opacity=".35"
              />
            ))}
          </svg>
          <svg className="umbrella" viewBox="0 0 180 150" aria-hidden="true">
            <path
              d="M90 49v72q0 21 17 18 11-2 11-14"
              stroke="#a68b61"
              strokeWidth="5"
              fill="none"
            />
            <path
              d="M10 66q70-104 160 0-16-14-33 0-21-14-45 0-21-14-43 0-18-14-39 0Z"
              fill="#e6c585"
            />
            <path d="M48 66Q62 8 92 22q28 6 45 44" fill="none" stroke="#c7a96e" strokeWidth="2" />
          </svg>
        </>
      )}
      <div className="scene-footnote">
        {state.phase === 0
          ? '一点喜欢，一篮期待。'
          : state.phase === 1
            ? '每一片叶子，都藏着小小的惊喜。'
            : state.phase === 2
              ? '今天的快乐，是一起分享。'
              : '下次见，我的森林朋友。'}
      </div>
      <span className="scene-chapter">
        {String(state.phase + 1).padStart(2, '0')} / {chapters.length.toString().padStart(2, '0')}
      </span>
    </section>
  );
}
