import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  gameId: Annotation<string>(),
  loadedState: Annotation<any>(),
  playerInput: Annotation<string>(),
  actionType: Annotation<string | null>(),
  actionParams: Annotation<Record<string, unknown>>(),
  toolResults: Annotation<unknown>(),
  proposedStateChanges: Annotation<Record<string, unknown>>(),
  narrative: Annotation<string | null>(),
  validationErrors: Annotation<string[]>(),
});
