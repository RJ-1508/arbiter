import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphState } from "./state.js";
import { loadState } from "./nodes/loadState.js";
import { placeholder } from "./nodes/placeholder.js";

const graph = new StateGraph(GraphState)
  .addNode("loadState", loadState)
  .addNode("placeholder", placeholder)
  .addEdge(START, "loadState")
  .addEdge("loadState", "placeholder")
  .addEdge("placeholder", END);

export const app = graph.compile();
