import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";

export const getNpcInfo = tool(
  async ({ gameId, npcId, npcName }) => {
    if (!npcId && !npcName) {
      return { ok: false, reason: "must_provide_npc_id_or_name" };
    }

    const npc = await prisma.npc.findFirst({
      where: { gameId, ...(npcId ? { id: npcId } : { name: npcName }) },
    });
    if (!npc) return { ok: false, reason: "npc_not_found" };

    const location = npc.locationId
      ? await prisma.location.findUnique({ where: { id: npc.locationId } })
      : null;

    return {
      ok: true,
      npc: {
        id: npc.id,
        name: npc.name,
        archetype: npc.archetype,
        disposition: npc.disposition,
        hp: npc.hp,
        maxHp: npc.maxHp,
        stats: npc.stats,
        dialogueHistory: npc.dialogueHistory,
        location: location ? { id: location.id, name: location.name } : null,
      },
    };
  },
  {
    name: "get_npc_info",
    description:
      "Returns an NPC's full record (stats, HP, disposition, dialogue history, current location). Provide npcId or npcName — npcId takes precedence when both are given.",
    schema: z.object({
      gameId: z.string().describe("The ID of the active game session"),
      npcId: z.string().optional().describe("UUID of the NPC"),
      npcName: z
        .string()
        .optional()
        .describe("Name of the NPC — used if npcId is not provided"),
    }),
  },
);
