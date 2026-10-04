import { motion } from 'motion/react';
import { FOODS } from '../game/model';
import type { Food, PicnicState } from '../game/model';
import { foodNames } from '../game/content';
import { FoodArt, Icon } from './Illustrations';

export function FoodTray({ state, onFood }: { state: PicnicState; onFood: (food: Food) => void }) {
  const packing = state.phase === 0;
  const foods = packing ? FOODS : state.packed;
  return (
    <section className="food-tray" aria-label={packing ? '选择野餐食物' : '分享篮子里的食物'}>
      <div className="tray-intro">
        <span className="eyebrow">
          {packing ? 'A LITTLE OF WHAT YOU LOVE' : 'HAPPINESS IS SHARING'}
        </span>
        <h2>{packing ? '带上你喜欢的' : '想请谁吃一点？'}</h2>
        <p>{packing ? '点一下装好，再点一下取出' : '先点食物，再点小动物'}</p>
      </div>
      <div className="food-options">
        {foods.map((food) => {
          const served = state.served.some((item) => item.food === food);
          const selected = packing ? state.packed.includes(food) : state.selected === food;
          const label = packing
            ? `${selected ? '取出' : '装入'}${foodNames[food]}`
            : served
              ? `${foodNames[food]}已分享`
              : `选择${foodNames[food]}`;
          return (
            <motion.button
              key={food}
              type="button"
              className={`food-option ${selected ? 'selected' : ''} ${served ? 'served' : ''}`}
              aria-label={label}
              aria-pressed={selected}
              disabled={!packing && served}
              onClick={() => onFood(food)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.92 }}
            >
              <FoodArt food={food} />
              <span>{foodNames[food]}</span>
              <span className="food-check">{selected || served ? <Icon name="check" /> : '+'}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
