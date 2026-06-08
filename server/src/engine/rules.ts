export const RULES = {
  combat: {
    hitDC: 12,
    attackStat: "strength",
    damageDie: 6,
    damageStat: "strength",
    critThreshold: 20,
    critMultiplier: 2,
  },
  skill_check: {
    dcs: { easy: 10, medium: 15, hard: 20 },
  },
  dialogue: {
    ladder: ["hostile", "wary", "neutral", "friendly", "allied"] as const,
    baseDC: 13,
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
