// server/src/scripts/test-socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", async () => {
  const res = await fetch("http://localhost:3000/api/games", {
    method: "POST",
  });
  const { gameId } = await res.json();
  console.log("game:", gameId, "\n");

  socket.on("turn:token", ({ token }) => process.stdout.write(token));
  socket.on("turn:done", () => {
    console.log("\n\n--- done ---");
    socket.close();
  });
  socket.on("turn:error", (e) => {
    console.error("ERROR:", e);
    socket.close();
  });

  socket.emit("player:input", { gameId, input: "look around" });
});
