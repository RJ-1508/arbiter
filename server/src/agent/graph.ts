import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphState } from "./state.js";
import { loadState } from "./nodes/loadState.js";
import { classifyAction } from "./nodes/classifyAction.js";
import { combatHandler } from "./handlers/combatHandler.js";
import { skillHandler } from "./handlers/skillHandler.js";
import { dialogueHandler } from "./handlers/dialogueHandler.js";
import { movementHandler } from "./handlers/movementHandler.js";
import { inventoryHandler } from "./handlers/inventoryHandler.js";
import { metaHandler } from "./handlers/metaHandler.js";
import { generateNarrative } from "./nodes/generateNarrative.js";
import { persist } from "./nodes/persist.js";
const graph = new StateGraph(GraphState)
  .addNode("loadState", loadState)
  .addNode("classifyAction", classifyAction)
  .addNode("combatHandler", combatHandler)
  .addNode("skillHandler", skillHandler)
  .addNode("dialogueHandler", dialogueHandler)
  .addNode("movementHandler", movementHandler)
  .addNode("inventoryHandler", inventoryHandler)
  .addNode("metaHandler", metaHandler)
  .addNode("generateNarrative", generateNarrative)
  .addNode("persist", persist)
  .addEdge(START, "loadState")
  .addEdge("loadState", "classifyAction")
  .addConditionalEdges("classifyAction", (state) => state.actionType!, {
    combat: "combatHandler",
    skill_check: "skillHandler",
    dialogue: "dialogueHandler",
    movement: "movementHandler",
    inventory: "inventoryHandler",
    meta: "metaHandler",
  })
  .addEdge("combatHandler", "generateNarrative")
  .addEdge("skillHandler", "generateNarrative")
  .addEdge("dialogueHandler", "generateNarrative")
  .addEdge("movementHandler", "generateNarrative")
  .addEdge("inventoryHandler", "generateNarrative")
  .addEdge("metaHandler", "generateNarrative")
  .addEdge("generateNarrative", "persist")
  .addEdge("persist", END);

export const app = graph.compile();
