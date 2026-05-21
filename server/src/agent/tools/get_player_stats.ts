import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";

export const getPlayerStats = tool(
  async ({ gameId }) => {
    const player = await prisma.player.findUnique({ where: { gameId } });
    if (!player) return { ok: false, reason: "player_not_found" };
    return {
      ok: true,
      player: {
        hp: player.hp,
        maxHp: player.maxHp,
        level: player.level,
        xp: player.xp,
        stats: player.stats,
      },
    };
  },
  {
    name: "get_player_stats",
    description: "Reads the player's current HP, level, XP, and stats",
    schema: z.object({ gameId: z.string() }),
  },
);
