import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  gameId: Annotation<string>(),
  loadedState: Annotation<any>(),
  playerInput: Annotation<string>(),
  actionType: Annotation<string | null>(),
  actionParams: Annotation<{
    target: string | null;
    exit: string | null;
    item: string | null;
    intent: string | null;
    stat: string | null;
    difficulty: "easy" | "medium" | "hard" | null;
    socialIntent: "persuade" | "intimidate" | "ask" | "chat" | null;
    inventoryIntent: "pick_up" | "drop" | "use" | null;
    focus: "stats" | "surroundings" | "inventory" | null;
  }>(),
  toolResults: Annotation<unknown>(),
  proposedStateChanges: Annotation<Record<string, unknown>>(),
  narrative: Annotation<string | null>(),
  validationErrors: Annotation<string[]>(),
});
