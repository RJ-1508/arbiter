export function computeDamage(base: number, modifier: number) {
  const damage = base + modifier;
  return { damage };
}
