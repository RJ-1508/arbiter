import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";
import { clampHp } from "../../engine/boundHelpers.js";

export const updatePlayerStats = tool(
  async ({ gameId, hpDelta, xpDelta }) => {
    const player = await prisma.player.findUnique({ where: { gameId } });
    if (!player) return { ok: false, reason: "player_not_found" };
    const newHp = clampHp(player.hp + hpDelta, player.maxHp);
    const newXp = player.xp + xpDelta;
    const updated = await prisma.player.update({
      where: { gameId },
      data: { hp: newHp, xp: newXp },
    });
    return {
      ok: true,
      player: {
        hp: updated.hp,
        maxHp: updated.maxHp,
        level: updated.level,
        xp: updated.xp,
        stats: updated.stats,
      },
    };
  },
  {
    name: "update_player_stats",
    description:
      "Updates the player's HP and XP by the given deltas. Use negative deltas to subtract (e.g. damage).",
    schema: z.object({
      gameId: z.string().describe("The ID of the active game session"),
      hpDelta: z
        .int()
        .describe("HP change to apply (negative = damage, positive = healing)"),
      xpDelta: z
        .int()
        .describe("XP change to apply (negative = loss, positive = gain)"),
    }),
  },
);
