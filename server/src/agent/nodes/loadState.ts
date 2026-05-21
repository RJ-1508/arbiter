import { prisma } from "../../db.js";
import { GraphState } from "../state.js";

export async function loadState(state: typeof GraphState.State) {
  const game = await prisma.game.findUnique({
    where: {
      id: state.gameId,
    },
    include: {
      player: true,
      locations: true,
      npcs: true,
      items: true,
      turns: true,
    },
  });
  if (!game) {
    throw new Error(`loadState: no game with id ${state.gameId}`);
  }

  return { loadedState: game };
}
