import { test } from 'vite-plus/test';
import assert from 'node:assert/strict';
import { initialState, update, restore, FOODS } from '../src/game/model';

const step = (state, type, data = {}) => update(state, { type, ...data });
const packed = () => step(initialState(), 'PACK', { food: 'apple' });
const sharing = () => step(step(packed(), 'NEXT'), 'NEXT');

test('food selection toggles and empty baskets cannot leave', () => {
  assert.equal(step(initialState(), 'NEXT').phase, 0);
  const state = packed();
  assert.deepEqual(state.packed, ['apple']);
  assert.equal(step(state, 'NEXT').phase, 1);
  assert.deepEqual(step(state, 'PACK', { food: 'apple' }).packed, []);
  assert.deepEqual(step(state, 'PACK', { food: 'unknown' }).packed, ['apple']);
});

test('one food can be shared once, and any animal can receive it', () => {
  let state = sharing();
  assert.equal(step(state, 'NEXT').phase, 2);
  state = step(state, 'SELECT', { food: 'apple' });
  assert.equal(step(state, 'FEED', { animal: 'unknown' }).served.length, 0);
  state = step(state, 'FEED', { animal: 'bear' });
  assert.deepEqual(state.served, [{ food: 'apple', animal: 'bear' }]);
  assert.equal(state.selected, null);
  assert.equal(
    step(step(state, 'SELECT', { food: 'apple' }), 'FEED', { animal: 'rabbit' }).served.length,
    1,
  );
  assert.equal(step(state, 'NEXT').phase, 3);
});

test('forest surprises are optional and discoveries do not duplicate', () => {
  let state = step(packed(), 'NEXT');
  state = step(state, 'DISCOVER', { item: 'butterfly' });
  state = step(state, 'DISCOVER', { item: 'butterfly' });
  assert.deepEqual(state.discoveries, ['butterfly']);
  assert.equal(step(state, 'NEXT').phase, 2);
});

test('all six foods can go to the same animal without a score or failure', () => {
  let state = FOODS.reduce((s, food) => step(s, 'PACK', { food }), initialState());
  state = step(step(state, 'NEXT'), 'NEXT');
  for (const food of FOODS)
    state = step(step(state, 'SELECT', { food }), 'FEED', { animal: 'bear' });
  assert.equal(state.served.length, 6);
  assert.equal(step(state, 'NEXT').phase, 3);
});

test('going back to repack clears shared food to make another picnic playable', () => {
  let state = step(step(sharing(), 'SELECT', { food: 'apple' }), 'FEED', { animal: 'bear' });
  state = step(step(step(state, 'NEXT'), 'BACK'), 'BACK');
  state = step(state, 'BACK');
  assert.equal(state.phase, 0);
  assert.deepEqual(state.packed, ['apple']);
  assert.deepEqual(state.served, []);
});

test('restore safely rejects broken saves, arbitrary values, and impossible states', () => {
  for (const input of [null, [], 'oops', { phase: 99 }, { phase: 3, packed: [] }]) {
    assert.deepEqual(restore(input), initialState());
  }
  const state = step(step(sharing(), 'SELECT', { food: 'apple' }), 'FEED', { animal: 'rabbit' });
  assert.deepEqual(restore(JSON.parse(JSON.stringify(state))), state);
  assert.deepEqual(restore({ ...state, packed: ['<script>'] }), initialState());
});

test('weather and blanket only accept known choices and reset starts fresh', () => {
  let state = step(packed(), 'WEATHER', { weather: 'rain' });
  state = step(state, 'BLANKET', { blanket: 'sage' });
  assert.equal(state.weather, 'rain');
  assert.equal(state.blanket, 'sage');
  assert.equal(step(state, 'WEATHER', { weather: 'bad' }).weather, 'rain');
  assert.deepEqual(step(state, 'RESET'), initialState());
});

test('out-of-phase actions cannot consume food or skip stages', () => {
  const state = packed();
  assert.deepEqual(step(state, 'FEED', { animal: 'bear' }), state);
  assert.deepEqual(step(state, 'DISCOVER', { item: 'frog' }), state);
  assert.deepEqual(step(sharing(), 'PACK', { food: 'bread' }).packed, ['apple']);
});
