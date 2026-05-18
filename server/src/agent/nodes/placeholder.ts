import { GraphState } from "../state.js";

export async function placeholder(state: typeof GraphState.State) {
  const g = state.loadedState;
  console.log(`[placeholder] loaded game ${g.id} — status: ${g.status}`);
  console.log(
    `[placeholder] player HP: ${g.players?.[0]?.hp}, locations: ${g.locations?.length}`,
  );
  return {};
}
