import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  animalNames,
  blanketColors,
  blanketNames,
  chapters,
  discoveryNames,
  foodNames,
} from './game/content';
import type { Animal, Blanket, Discovery, Food, PicnicAction } from './game/model';
import { usePicnic } from './hooks/usePicnic';
import { useAudio } from './hooks/useAudio';
import { FoodTray } from './components/FoodTray';
import { PicnicScene } from './components/PicnicScene';
import { Progress } from './components/Progress';
import { ParentNote } from './components/ParentNote';
import { MemoryCard } from './components/MemoryCard';
import {
  AcornArt,
  AnimalArt,
  ButterflyArt,
  FrogArt,
  Icon,
  Sprout,
} from './components/Illustrations';

export default function App() {
  const { state, dispatch } = usePicnic();
  const audio = useAudio();
  const [feedback, setFeedback] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const chapter = chapters[state.phase];
  const message = feedback || chapter.prompt;
  const date = new Intl.DateTimeFormat('sv-SE').format(new Date()).replaceAll('-', '.');
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [state.phase]);

  function say(text: string) {
    setFeedback(text);
    audio.speak(text);
  }

  function act(action: PicnicAction) {
    dispatch(action);
    audio.chime();
    if (action.type === 'WEATHER')
      say(
        action.weather === 'rain'
          ? '滴答滴答，下小雨啦。撑起伞，也可以一起野餐。'
          : '太阳出来啦！小花也抬起了头。',
      );
    if (action.type === 'BLANKET') say(`铺上${blanketNames[action.blanket]}的小毯子，真好看。`);
  }

  function onFood(food: Food) {
    audio.chime();
    if (state.phase === 0) {
      dispatch({ type: 'PACK', food });
      say(
        state.packed.includes(food)
          ? `${foodNames[food]}先留在这里。还想带什么呢？`
          : `${foodNames[food]}装好啦！还想带什么呢？`,
      );
    } else {
      dispatch({ type: 'SELECT', food });
      say(
        state.selected === food
          ? '没关系，再挑一样喜欢的吧。'
          : `想把${foodNames[food]}分享给谁呢？点点小动物吧。`,
      );
    }
  }

  function onAnimal(animal: Animal) {
    if (state.phase === 2 && state.selected) {
      const food = state.selected;
      dispatch({ type: 'FEED', animal });
      audio.chime();
      say(
        food === 'water'
          ? `${animalNames[animal]}咕嘟咕嘟喝了水：谢谢卡布，真舒服！`
          : `${animalNames[animal]}吃到了${foodNames[food]}：啊呜，谢谢卡布！`,
      );
    } else {
      say(
        state.phase === 0
          ? `我是${animalNames[animal]}。卡布，我在森林等你哦！`
          : state.phase === 3
            ? `${animalNames[animal]}挥挥手：下次再一起玩吧！`
            : `我是${animalNames[animal]}，想和你一起野餐。先点一样食物吧！`,
      );
    }
  }

  function onDiscover(item: Discovery) {
    dispatch({ type: 'DISCOVER', item });
    audio.chime();
    const words: Record<Discovery, string> = {
      butterfly: '蝴蝶飞出来啦！扑扇扑扇，你好，卡布。',
      frog: '呱，呱！小青蛙跳上了荷叶，和你打招呼。',
      acorn: '笃笃笃！树洞里有一颗橡果，是小松鼠的宝贝。',
    };
    say(words[item]);
  }

  function move(type: 'NEXT' | 'BACK' | 'RESET') {
    dispatch({ type });
    setFeedback('');
    audio.chime();
    const nextPhase =
      type === 'RESET'
        ? 0
        : type === 'NEXT'
          ? Math.min(3, state.phase + 1)
          : Math.max(0, state.phase - 1);
    audio.speak(chapters[nextPhase]!.prompt);
  }

  async function savePhoto() {
    setSaving(true);
    try {
      const { exportMemory } = await import('./lib/exportMemory');
      await exportMemory(state, date);
      say('纪念照准备好啦！可以在下载的图片里找到它。');
    } catch (error) {
      say(error instanceof Error ? error.message : '纪念照暂时没有保存成功，请再试一次。');
    } finally {
      setSaving(false);
    }
  }

  const canContinue =
    state.phase === 0
      ? state.packed.length > 0
      : state.phase === 2
        ? state.served.length > 0
        : true;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">
            <Sprout />
          </span>
          <div>
            <span className="brand-name">卡布的小世界</span>
            <span className="brand-english">KABU’S LITTLE WORLD</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="sound-toggle"
            onClick={audio.toggle}
            aria-label={audio.enabled ? '关闭声音' : '开启声音'}
            aria-pressed={audio.enabled}
          >
            <Icon name={audio.enabled ? 'sound' : 'mute'} />
            <span>{audio.enabled ? '声音已开' : '安静玩耍'}</span>
          </button>
          <span className="header-divider" />
          <button className="parent-link" onClick={() => setNoteOpen(true)}>
            给大人的小纸条<span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>
      <main>
        <section className="intro">
          <div className="intro-copy">
            <div className="eyebrow story-label">
              <span />
              森林野餐<span className="edition">THE FOREST PICNIC · 01</span>
            </div>
            <h1 ref={heading} tabIndex={-1}>
              {chapter.title}
            </h1>
            <p>{chapter.subtitle}</p>
          </div>
          <div className="invitation">
            <div className="invitation-rabbit">
              <AnimalArt animal="rabbit" />
            </div>
            <div>
              <span className="handwritten">一起去玩吧！</span>
              <span>一份来自森林的邀请</span>
            </div>
            <svg className="invitation-spark" viewBox="0 0 40 40" aria-hidden="true">
              <path d="m20 2 3 13 13 5-13 3-3 13-4-13-14-3 14-5Z" fill="#d5b475" />
            </svg>
          </div>
        </section>
        <Progress phase={state.phase} />
        <AnimatePresence mode="wait">
          <motion.div
            key={state.phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {state.phase === 3 ? (
              <section className="memory-section" aria-label="野餐纪念照">
                <div className="memory-picture">
                  <span className="paper-tape" />
                  <MemoryCard state={state} date={date} />
                </div>
                <div className="memory-copy">
                  <span className="eyebrow">OUR LITTLE HAPPY MOMENT</span>
                  <h2>
                    今天的快乐，
                    <br />
                    有你一份。
                  </h2>
                  <p>
                    我们带着 {state.packed.length} 样喜欢的东西，
                    <br />
                    和森林朋友分享了 {state.served.length} 份美味。
                  </p>
                  <p className="memory-signature">小兔、小熊和小松鼠 ♡</p>
                  <button
                    className="primary-button"
                    onClick={() => void savePhoto()}
                    disabled={saving}
                  >
                    <Icon name="download" />
                    {saving ? '正在准备…' : '保存纪念照'}
                  </button>
                  <p className="save-hint">保存在自己的设备上，随时回看</p>
                  <p className="photo-feedback" role="status">
                    {feedback || '挥挥手，我们下次再见！'}
                  </p>
                </div>
              </section>
            ) : (
              <PicnicScene
                state={state}
                message={message}
                onAction={act}
                onAnimal={onAnimal}
                onDiscover={onDiscover}
                onReplay={() => audio.speak(message)}
              />
            )}
            {(state.phase === 0 || state.phase === 2) && <FoodTray state={state} onFood={onFood} />}
            {state.phase === 1 && (
              <section className="explore-note">
                <div>
                  <span className="eyebrow">LITTLE WONDERS ALONG THE WAY</span>
                  <h2>发现小小的美好</h2>
                  <p>想多看一会儿也可以，随时都能去野餐。</p>
                </div>
                <div className="discovery-stickers">
                  {(['butterfly', 'frog', 'acorn'] as const).map((item) => (
                    <span
                      className={state.discoveries.includes(item) ? 'discovered' : ''}
                      key={item}
                    >
                      {item === 'butterfly' ? (
                        <ButterflyArt />
                      ) : item === 'frog' ? (
                        <FrogArt />
                      ) : (
                        <AcornArt />
                      )}
                      <span>
                        {state.discoveries.includes(item) ? discoveryNames[item] : '还没遇见'}
                      </span>
                    </span>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="journey-actions">
          <div className="journey-secondary">
            {state.phase > 0 ? (
              <button className="back-button" onClick={() => move('BACK')}>
                <Icon name="back" />
                {state.phase === 3 ? '再坐一会儿' : '回去看看'}
              </button>
            ) : (
              <p className="gentle-hint">
                <Icon name="heart" />
                没有标准答案，喜欢就好。
              </p>
            )}
            {state.phase === 2 && (
              <div className="blanket-options" role="group" aria-label="选择野餐毯颜色">
                <span>小毯子</span>
                {(['peach', 'sage', 'lavender'] as Blanket[]).map((blanket) => (
                  <button
                    key={blanket}
                    className={state.blanket === blanket ? 'active' : ''}
                    style={{ backgroundColor: blanketColors[blanket] }}
                    aria-label={`${blanketNames[blanket]}野餐毯`}
                    aria-pressed={state.blanket === blanket}
                    onClick={() => act({ type: 'BLANKET', blanket })}
                  >
                    {state.blanket === blanket && <Icon name="check" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="next-action">
            <span className="action-hint">
              {state.phase === 0
                ? state.packed.length
                  ? `小篮子里有 ${state.packed.length} 样喜欢`
                  : '选一样喜欢的，就可以出发'
                : state.phase === 2
                  ? state.served.length
                    ? '大家坐好，准备留个纪念吧'
                    : '分享一份美味，就能拍照啦'
                  : state.phase === 1
                    ? '朋友们就在前面'
                    : '下一次，也会有新的快乐'}
            </span>
            <motion.button
              className="primary-button next-button"
              disabled={!canContinue}
              onClick={() => move(state.phase === 3 ? 'RESET' : 'NEXT')}
              whileTap={{ scale: 0.96 }}
            >
              {state.phase === 2 && <Icon name="camera" />}
              {chapter.next}
              <Icon name={state.phase === 3 ? 'refresh' : 'arrow'} />
            </motion.button>
          </div>
        </div>
      </main>
      <footer>
        <span>
          <Sprout />
          小小世界，大大快乐。
        </span>
        <span>
          MADE WITH LOVE, FOR KABU<span className="footer-flower">✳</span>
        </span>
      </footer>
      {noteOpen && <ParentNote onClose={() => setNoteOpen(false)} />}
    </div>
  );
}
