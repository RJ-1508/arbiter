import { GraphState } from "../state.js";

export async function movementHandler(state: typeof GraphState.State) {
  const { loadedState, actionParams } = state;
  const current = loadedState.currentLocation;
  const destinationId = current.exits?.[actionParams.exit];
  if (!destinationId) {
    return {
      toolResults: [{ ok: false, reason: "no_exit_that_way" }],
      proposedStateChanges: {},
    };
  }
  return {
    toolResults: [{ ok: true, exit: actionParams.exit, destinationId }],
    proposedStateChanges: { newLocationId: destinationId },
  };
}
