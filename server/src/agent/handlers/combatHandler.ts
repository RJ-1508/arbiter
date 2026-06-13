import { GraphState } from "../state.js";
import { rollDice } from "../tools/rollDice.js";
import { resolveCheck } from "../../engine/resolveCheck.js";
import { computeDamage } from "../../engine/computeDamage.js";
import { clampHp } from "../../engine/boundHelpers.js";
import { RULES } from "../../engine/rules.js";

export async function combatHandler(state: typeof GraphState.State) {
  const { loadedState, actionParams } = state;
  const player = loadedState.player;

  const targetName = actionParams.target as string;
  const npc = loadedState.npcs.find(
    (n: any) =>
      n.name === targetName && n.locationId === loadedState.currentLocation.id,
  );
  if (!npc) {
    return {
      toolResults: [{ ok: false, reason: "target_not_found" }],
      proposedStateChanges: {},
    };
  }

  const stats = player.stats as Record<string, number>;
  const attackStat = stats[RULES.combat.attackStat] ?? 0;
  const attackModifier = attackStat; // stat IS the modifier (ranges 0–5, not 5e)

  // Hit roll
  const d20 = await rollDice.invoke({ sides: 20, count: 1 });
  const roll = d20.Total;
  const hit = resolveCheck(roll, attackModifier, RULES.combat.hitDC);

  if (!hit.success) {
    return {
      toolResults: [{ roll, total: hit.total, hit: false }],
      proposedStateChanges: {},
    };
  }

  // Damage roll
  const isCrit = roll >= RULES.combat.critThreshold;
  const damageModifier = stats[RULES.combat.damageStat] ?? 0;
  const dieRoll = await rollDice.invoke({
    sides: RULES.combat.damageDie,
    count: 1,
  });
  const { damage: baseDamage } = computeDamage(dieRoll.Total, damageModifier);
  const damage = isCrit ? baseDamage * RULES.combat.critMultiplier : baseDamage;

  const newNpcHp = clampHp(npc.hp - damage, npc.maxHp);

  return {
    toolResults: [
      { roll, total: hit.total, hit: true, isCrit, damage, npcHp: newNpcHp },
    ],
    proposedStateChanges: { npcId: npc.id, npcHp: newNpcHp },
  };
}
