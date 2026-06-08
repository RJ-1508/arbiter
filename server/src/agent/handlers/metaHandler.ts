import { GraphState } from "../state.js";

export async function metaHandler(state: typeof GraphState.State) {
  const { loadedState, actionParams } = state;

  const focus = actionParams.focus as "stats" | "surroundings" | "inventory" | undefined;
  const result: Record<string, unknown> = {};

  if (!focus || focus === "stats") {
    const p = loadedState.player;
    result.stats = { hp: p.hp, maxHp: p.maxHp, level: p.level, xp: p.xp, ...p.stats };
  }

  if (!focus || focus === "surroundings") {
    const loc = loadedState.currentLocation;
    result.surroundings = {
      name: loc.name,
      description: loc.description,
      exits: Object.keys(loc.exits ?? {}),
      npcsPresent: (loadedState.npcs as any[])
        .filter((n) => n.locationId === loc.id)
        .map((n) => ({ name: n.name, disposition: n.disposition })),
    };
  }

  if (!focus || focus === "inventory") {
    result.inventory = (loadedState.inventory as any[]).map((i) => ({
      id: i.id,
      name: i.name,
      itemType: i.itemType,
      quantity: i.quantity,
    }));
  }

  return {
    toolResults: [result],
    proposedStateChanges: {},
  };
}
