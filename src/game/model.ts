export const FOODS = ['apple', 'banana', 'bread', 'strawberry', 'carrot', 'water'] as const;
export const ANIMALS = ['rabbit', 'bear', 'squirrel'] as const;
export const DISCOVERIES = ['butterfly', 'frog', 'acorn'] as const;
export type Food = (typeof FOODS)[number];
export type Animal = (typeof ANIMALS)[number];
export type Discovery = (typeof DISCOVERIES)[number];
export type Weather = 'sun' | 'rain';
export type Blanket = 'peach' | 'sage' | 'lavender';
export type Phase = 0 | 1 | 2 | 3;

export interface PicnicState {
  phase: Phase;
  packed: Food[];
  served: { food: Food; animal: Animal }[];
  selected: Food | null;
  discoveries: Discovery[];
  weather: Weather;
  blanket: Blanket;
}

export type PicnicAction =
  | { type: 'PACK' | 'SELECT'; food: Food }
  | { type: 'FEED'; animal: Animal }
  | { type: 'DISCOVER'; item: Discovery }
  | { type: 'WEATHER'; weather: Weather }
  | { type: 'BLANKET'; blanket: Blanket }
  | { type: 'NEXT' | 'BACK' | 'RESET' };

export const initialState = (): PicnicState => ({
  phase: 0,
  packed: [],
  served: [],
  selected: null,
  discoveries: [],
  weather: 'sun',
  blanket: 'peach',
});

export function update(state: PicnicState, action: PicnicAction): PicnicState {
  switch (action.type) {
    case 'PACK':
      if (state.phase !== 0 || !FOODS.includes(action.food)) return state;
      return {
        ...state,
        packed: state.packed.includes(action.food)
          ? state.packed.filter((food) => food !== action.food)
          : [...state.packed, action.food],
      };
    case 'NEXT':
      if (
        state.phase === 3 ||
        (state.phase === 0 && !state.packed.length) ||
        (state.phase === 2 && !state.served.length)
      )
        return state;
      return { ...state, phase: (state.phase + 1) as Phase, selected: null };
    case 'BACK':
      if (!state.phase) return state;
      return {
        ...state,
        phase: (state.phase - 1) as Phase,
        selected: null,
        served: state.phase === 1 ? [] : state.served,
      };
    case 'SELECT':
      if (
        state.phase !== 2 ||
        !state.packed.includes(action.food) ||
        state.served.some((item) => item.food === action.food)
      )
        return state;
      return { ...state, selected: state.selected === action.food ? null : action.food };
    case 'FEED':
      if (state.phase !== 2 || !state.selected || !ANIMALS.includes(action.animal)) return state;
      return {
        ...state,
        served: [...state.served, { food: state.selected, animal: action.animal }],
        selected: null,
      };
    case 'DISCOVER':
      if (
        state.phase !== 1 ||
        !DISCOVERIES.includes(action.item) ||
        state.discoveries.includes(action.item)
      )
        return state;
      return { ...state, discoveries: [...state.discoveries, action.item] };
    case 'WEATHER':
      return ['sun', 'rain'].includes(action.weather)
        ? { ...state, weather: action.weather }
        : state;
    case 'BLANKET':
      return ['peach', 'sage', 'lavender'].includes(action.blanket)
        ? { ...state, blanket: action.blanket }
        : state;
    case 'RESET':
      return initialState();
  }
}

function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && list.includes(value as T);
}

function isUniqueList<T extends string>(list: readonly T[], value: unknown): value is T[] {
  return (
    Array.isArray(value) &&
    value.every((item) => isOneOf(list, item)) &&
    new Set(value).size === value.length
  );
}

function isServing(value: unknown): value is PicnicState['served'][number] {
  return (
    typeof value === 'object' &&
    value !== null &&
    'food' in value &&
    'animal' in value &&
    isOneOf(FOODS, value.food) &&
    isOneOf(ANIMALS, value.animal)
  );
}

/** Browser storage is untrusted. Invalid or older data always starts a fresh picnic. */
export function restore(value: unknown): PicnicState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return initialState();
  const { phase, packed, served, selected, discoveries, weather, blanket } = value as Record<
    string,
    unknown
  >;
  if (
    typeof phase !== 'number' ||
    ![0, 1, 2, 3].includes(phase) ||
    !isUniqueList(FOODS, packed) ||
    !Array.isArray(served) ||
    !served.every(isServing) ||
    served.some((item) => !packed.includes(item.food)) ||
    new Set(served.map((item) => item.food)).size !== served.length ||
    !isUniqueList(DISCOVERIES, discoveries) ||
    !isOneOf(['sun', 'rain'], weather) ||
    !isOneOf(['peach', 'sage', 'lavender'], blanket) ||
    (selected !== null &&
      (!isOneOf(FOODS, selected) ||
        phase !== 2 ||
        !packed.includes(selected) ||
        served.some((item) => item.food === selected))) ||
    (phase > 0 && !packed.length) ||
    (phase === 3 && !served.length) ||
    (phase === 0 && served.length)
  )
    return initialState();
  return {
    phase: phase as Phase,
    packed: [...packed],
    served: served.map(({ food, animal }) => ({ food, animal })),
    selected: selected as Food | null,
    discoveries: [...discoveries],
    weather,
    blanket,
  };
}
