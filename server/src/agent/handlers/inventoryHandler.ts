import { GraphState } from "../state.js";
import { RULES } from "../../engine/rules.js";
import { canAddItem } from "../../engine/boundHelpers.js";

export async function inventoryHandler(state: typeof GraphState.State) {
  const { loadedState, actionParams } = state;

  const intent = actionParams.inventoryIntent as "pick_up" | "drop" | "use";
  const inventory = loadedState.inventory as any[];

  if (intent === "pick_up") {
    if (!canAddItem(inventory.length, RULES.inventory.cap)) {
      return {
        toolResults: [{ ok: false, reason: "inventory_full" }],
        proposedStateChanges: {},
      };
    }
    // DESIGN-PENDING: classifier emits `item` as a name string; persist needs
    // { name, itemType }. Resolve from content/lootTable once decided (1e/2c).
    const item = (actionParams as Record<string, unknown>).item as Record<
      string,
      unknown
    >;
    return {
      toolResults: [{ ok: true, intent, item }],
      proposedStateChanges: { addItem: item },
    };
  }

  if (intent === "drop" || intent === "use") {
    // DESIGN-PENDING: `itemId` isn't emitted by the classifier — resolve the
    // item by name against loadedState.inventory once decided (1c/1e).
    const itemId = (actionParams as Record<string, unknown>).itemId as string;
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
