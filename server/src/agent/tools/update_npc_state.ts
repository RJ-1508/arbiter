import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";
import { clampHp } from "../../engine/boundHelpers.js";

export const updateNpcState = tool(
  async ({ gameId, npcId, hpDelta, disposition, dialogueLine }) => {
    const npc = await prisma.npc.findFirst({ where: { id: npcId, gameId } });
    if (!npc) return { ok: false, reason: "npc_not_found" };

    const data: Parameters<typeof prisma.npc.update>[0]["data"] = {};

    if (hpDelta !== undefined) {
      data.hp = clampHp(npc.hp + hpDelta, npc.maxHp);
    }
    if (disposition !== undefined) {
      data.disposition = disposition;
    }
    if (dialogueLine !== undefined) {
      const history = npc.dialogueHistory as string[];
      data.dialogueHistory = [...history, dialogueLine];
    }

    const updated = await prisma.npc.update({ where: { id: npcId }, data });
    return {
      ok: true,
      npc: {
        id: updated.id,
        name: updated.name,
        hp: updated.hp,
        maxHp: updated.maxHp,
        disposition: updated.disposition,
        dialogueHistory: updated.dialogueHistory,
      },
    };
  },
  {
    name: "update_npc_state",
    description:
      "Applies changes to an NPC: HP delta (clamped), disposition override, and/or a new dialogue line appended to history.",
    schema: z.object({
      gameId: z.string().describe("The ID of the active game session"),
      npcId: z.string().describe("UUID of the NPC to update"),
      hpDelta: z
        .number()
        .int()
        .optional()
        .describe("HP change (negative = damage, positive = healing)"),
      disposition: z
        .string()
        .optional()
        .describe(
          "New disposition value, e.g. 'hostile', 'friendly', 'neutral'",
        ),
      dialogueLine: z
        .string()
        .optional()
        .describe(
          "A line to append to the NPC's dialogue history — does not overwrite existing history",
        ),
    }),
  },
);
