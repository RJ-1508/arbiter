export const RULES = {
  combat: {
    // hitDC, attackStat, damageDie, damageStatModifier, critThreshold, critMultiplier
  },
  skill_check: {
    // dcs: { easy, medium, hard } — LLM picks which stat applies per check
  },
  dialogue: {
    // dcs: { easy, medium, hard }, stat: "charisma"
  },
  movement: {
    // "must be a real exit" — validated against DB in move_player, not here
  },
  inventory: {
    cap: 10,
    itemTypes: {
      // weapon, armor, consumable, quest, misc
    },
  },
  meta: {},
} as const;

export type ActionType = keyof typeof RULES;
export const ACTION_TYPES = Object.keys(RULES) as [ActionType, ...ActionType[]];
