import type { Best } from '../types';

const STORAGE_KEY = 'bb.best';

export function loadBest(): Best | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load best scores:', e);
  }
  return null;
}

export function saveBest(best: Best): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
  } catch (e) {
    console.warn('Failed to save best scores:', e);
  }
}
