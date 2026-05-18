import { createNewGame } from "../game/createNewGame.js";

const gameId = await createNewGame();
console.log("created game:", gameId);
