import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";

export const getCurrentLocation = tool(
  async ({ gameId }) => {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { currentLocation: true },
    });
    if (!game) return { ok: false, reason: "game_not_found" };
    if (!game.currentLocation)
      return { ok: false, reason: "no_current_location" };
    return { ok: true, location: game.currentLocation };
  },
  {
    name: "get_current_location",
    description:
      "Returns the full location record for wherever the player currently is, including exits and description.",
    schema: z.object({
      gameId: z.string().describe("The ID of the active game session"),
    }),
  },
);
