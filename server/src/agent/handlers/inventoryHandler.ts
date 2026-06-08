import { GraphState } from "../state.js";
import { RULES } from "../../engine/rules.js";
import { canAddItem } from "../../engine/boundHelpers.js";

export async function inventoryHandler(state: typeof GraphState.State) {
  const { loadedState, actionParams } = state;

  const intent = actionParams.intent as "pick_up" | "drop" | "use";
  const inventory = loadedState.inventory as any[];

  if (intent === "pick_up") {
    if (!canAddItem(inventory.length, RULES.inventory.cap)) {
      return {
        toolResults: [{ ok: false, reason: "inventory_full" }],
        proposedStateChanges: {},
      };
    }
    const item = actionParams.item as Record<string, unknown>;
    return {
      toolResults: [{ ok: true, intent, item }],
      proposedStateChanges: { addItem: item },
    };
  }

  if (intent === "drop" || intent === "use") {
    const itemId = actionParams.itemId as string;
    return {
      toolResults: [{ ok: true, intent, itemId }],
      proposedStateChanges: { removeItemId: itemId },
    };
  }

  return {
    toolResults: [{ ok: false, reason: "unknown_intent" }],
    proposedStateChanges: {},
  };
}
