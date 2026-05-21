import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";

export const movePlayer = tool(
  async ({ gameId, exit }) => {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { currentLocation: true },
    });
    if (!game) return { ok: false, reason: "game_not_found" };
    if (!game.currentLocation) return { ok: false, reason: "no_current_location" };

    const exits = game.currentLocation.exits as Record<string, string>;
    if (!(exit in exits)) {
      return { ok: false, reason: "invalid_exit" };
    }

    const updated = await prisma.game.update({
      where: { id: gameId },
      data: { currentLocationId: exits[exit] },
      include: { currentLocation: true },
    });
    return { ok: true, location: updated.currentLocation };
  },
  {
    name: "move_player",
    description:
      "Moves the player through a named exit on the current location. Validates the exit exists — returns a clear failure if not. The LLM cannot teleport the player to an arbitrary location.",
    schema: z.object({
      gameId: z.string().describe("The ID of the active game session"),
      exit: z
        .string()
        .describe(
          "The name of the exit to take, e.g. 'north', 'tavern door'",
        ),
    }),
  },
);
