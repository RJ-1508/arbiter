export function clampHp(value: number, maxHp: number) {
  return Math.max(0, Math.min(value, maxHp));
}

export function canAddItem(currentCount: number, cap: number) {
  return currentCount + 1 <= cap;
}
