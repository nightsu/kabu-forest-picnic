import { useEffect, useReducer } from 'react';
import { initialState, restore, update } from '../game/model';

const SAVE_KEY = 'kabu-picnic:v1';
function load() {
  try {
    return restore(JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'));
  } catch {
    return initialState();
  }
}

export function usePicnic() {
  const [state, dispatch] = useReducer(update, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      /* Private browsing or full storage must never prevent playing. */
    }
  }, [state]);
  return { state, dispatch };
}
