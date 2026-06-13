import { GraphState } from "../state.js";
import { RULES } from "../../engine/rules.js";
import { resolveCheck } from "../../engine/resolveCheck.js";
import { rollDice } from "../tools/rollDice.js";

export async function skillHandler(state: typeof GraphState.State) {
  const { loadedState, actionParams } = state;

  const statName = actionParams.stat as string;
  const difficulty = (actionParams.difficulty as keyof typeof RULES.skill_check.dcs) ?? "medium";
  const stats = loadedState.player.stats as Record<string, number>;
  const modifier = stats[statName] ?? 0;

  const dc = RULES.skill_check.dcs[difficulty];

  const d20 = await rollDice.invoke({ sides: 20, count: 1 });
  const roll = d20.Total;
  const result = resolveCheck(roll, modifier, dc);

  const proposedStateChanges: Record<string, unknown> = {};
  if (result.success) {
    // DESIGN-PENDING: `unlocks` is not part of the classifier contract — it must
    // come from content/seed, not the LLM. Read loosely until that's decided.
    const unlocks = (actionParams as Record<string, unknown>).unlocks as
      | { flag?: string; newLocationId?: string }
      | undefined;
    if (unlocks?.flag) {
      proposedStateChanges.flag = unlocks.flag;
    } else if (unlocks?.newLocationId) {
      proposedStateChanges.newLocationId = unlocks.newLocationId;
    }
  }

  return {
    toolResults: [{ roll, total: result.total, success: result.success, stat: statName, dc }],
    proposedStateChanges,
  };
}
