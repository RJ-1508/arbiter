export function resolveCheck(roll: number, modifier: number, dc: number) {
  const total = roll + modifier;
  const success = total >= dc;
  return { total, success };
}
