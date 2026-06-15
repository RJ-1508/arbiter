import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { app as graph } from "./agent/graph.js";
import { createNewGame } from "./game/createNewGame.js";
import { prisma } from "./db.js";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

const app = express();
app.use(cors({ origin: FRONTEND_URL }));

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL },
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.post("/api/games", async (_req, res) => {
  try {
    const gameId = await createNewGame();
    res.json({ gameId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create game" });
  }
});

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);
  socket.on(
    "player:input",
    async ({ gameId, input }: { gameId: string; input: string }) => {
      try {
        const stream = await graph.stream(
          { gameId, playerInput: input },
          { streamMode: "messages" },
        );
        for await (const [chunk, metadata] of stream) {
          if (
            metadata?.langgraph_node === "generateNarrative" &&
            chunk?.content
          ) {
            socket.emit("turn:token", { token: chunk.content });
          }
        }
        const player = await prisma.player.findUnique({
          where: { gameId },
        });
        const items = await prisma.inventoryItem.findMany({
          where: { gameId },
        });
        const game = await prisma.game.findUnique({
          where: { id: gameId },
          include: { currentLocation: true },
        });
        socket.emit("turn:state", {
          player,
          items,
          location: game?.currentLocation
            ? { name: game.currentLocation.name }
            : undefined,
        });

        socket.emit("turn:done");
      } catch (err) {
        console.error(err);
        socket.emit("turn:error", { message: "turn failed" });
      }
    },
  );

  socket.on("disconnect", () => console.log("client disconnected:", socket.id));
});

const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => {
  console.log(`Arbiter server on http://localhost:${PORT}`);
});
