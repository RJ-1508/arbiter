import { GraphState } from "../state.js";
import { RULES } from "../../engine/rules.js";
import { resolveCheck } from "../../engine/resolveCheck.js";
import { rollDice } from "../tools/rollDice.js";

export async function dialogueHandler(state: typeof GraphState.State) {
  const { loadedState, actionParams, playerInput } = state;

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

  const ladder = RULES.dialogue.ladder;
  const currentIdx = ladder.indexOf(npc.disposition);

  const isSocialCheck =
    actionParams.socialIntent === "persuade" ||
    actionParams.socialIntent === "intimidate";

  let roll: number | null = null;
  let check: ReturnType<typeof resolveCheck> | null = null;
  let newIdx = currentIdx;

  if (isSocialCheck) {
    const stats = loadedState.player.stats as Record<string, number>;
    const modifier = stats["charisma"] ?? 0;
    const dc = RULES.dialogue.baseDC;

    const d20 = await rollDice.invoke({ sides: 20, count: 1 });
    roll = d20.Total;
    check = resolveCheck(roll, modifier, dc);

    const step = check.success ? 1 : -1;
    newIdx = Math.max(0, Math.min(ladder.length - 1, currentIdx + step));
  }

  const newDisposition = ladder[newIdx];
  const changed = newDisposition !== npc.disposition;

  const proposedStateChanges: Record<string, unknown> = {
    npcId: npc.id,
    dialogueAppend: { speaker: "player", text: playerInput },
  };
  if (changed) proposedStateChanges.newDisposition = newDisposition;

  return {
    toolResults: [
      {
        npcId: npc.id,
        npcName: npc.name,
        playerSaid: playerInput,
        oldDisposition: npc.disposition,
        newDisposition,
        ...(roll !== null && {
          roll,
          total: check!.total,
          success: check!.success,
        }),
      },
    ],
    proposedStateChanges,
  };
}
