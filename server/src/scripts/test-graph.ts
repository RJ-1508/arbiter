import { app } from "../agent/graph.js";

// using user id from test-new-game
const result = await app.invoke({
  gameId: "fe27d700-6974-42c9-bec0-ddae56fb7548",
});
console.log("Graph finished - status:", result.loadedState?.status);
