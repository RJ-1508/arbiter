import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  gameId: Annotation<string>(),
  loadedState: Annotation<any>(),
});
