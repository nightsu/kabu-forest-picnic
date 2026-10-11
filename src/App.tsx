import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { animalNames, blanketNames, chapters, foodNames } from './game/content';
import type { Animal, Discovery, Food, PicnicAction } from './game/model';
import { usePicnic } from './hooks/usePicnic';
import { useAudio } from './hooks/useAudio';
import { FoodTray } from './components/FoodTray';
import { PicnicScene } from './components/PicnicScene';
import { Progress } from './components/Progress';
import { ParentNote } from './components/ParentNote';
import { MemoryCard } from './components/MemoryCard';
import { Icon, Sprout } from './components/Illustrations';
import { JourneyArt } from './components/JourneyArt';

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
    if (action.type === 'GIVE_ACORN') say('笃笃笃！树洞里有一颗橡果，是小松鼠的宝贝。');
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
          </button>
          <span className="header-divider" />
          <button className="parent-link" onClick={() => setNoteOpen(true)}>
            给大人的小纸条<span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>
      <main>
        <section className="sr-only">
          <div className="intro-copy">
            <h1 ref={heading} tabIndex={-1}>
              {chapter.label}
            </h1>
          </div>
        </section>
        <Progress phase={state.phase} />
        <AnimatePresence mode="wait">
          <motion.div
            className="play-stage"
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
                  <button
                    className="picture-button save-picture"
                    onClick={() => void savePhoto()}
                    disabled={saving}
                    aria-label={saving ? '正在准备' : '保存纪念照'}
                    aria-busy={saving}
                    title="保存纪念照"
                  >
                    <JourneyArt phase={3} />
                    <Icon name="download" />
                  </button>
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
          </motion.div>
        </AnimatePresence>
        <div className="journey-actions">
          <div className="journey-secondary">
            {state.phase > 0 && (
              <button
                className="picture-button picture-back"
                onClick={() => move('BACK')}
                aria-label={state.phase === 3 ? '再坐一会儿' : '回去看看'}
                title={state.phase === 3 ? '再坐一会儿' : '回去看看'}
              >
                <Icon name="back" />
                <JourneyArt phase={(state.phase - 1) as 0 | 1 | 2} />
              </button>
            )}
          </div>
          <div className="next-action">
            <motion.button
              className="picture-button picture-next"
              disabled={!canContinue}
              aria-label={chapter.next}
              title={chapter.next}
              onClick={() => move(state.phase === 3 ? 'RESET' : 'NEXT')}
              whileTap={{ scale: 0.96 }}
            >
              <JourneyArt phase={state.phase === 3 ? 0 : ((state.phase + 1) as 1 | 2 | 3)} />
              <Icon name={state.phase === 3 ? 'refresh' : state.phase === 2 ? 'camera' : 'arrow'} />
            </motion.button>
          </div>
        </div>
      </main>
      {noteOpen && <ParentNote onClose={() => setNoteOpen(false)} />}
    </div>
  );
}
