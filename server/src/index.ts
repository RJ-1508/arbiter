import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { app as graph } from "./agent/graph.js";
import { createNewGame } from "./game/createNewGame.js";

const CLIENT_ORIGIN = "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: CLIENT_ORIGIN } });

app.get("/health", (_req, res) => res.json({ ok: true }));
app.post("/api/games", async (_req, res) => {
    try {
        const gameId = await createNewGame();
        res.json({gameId});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "failed to create game"});
    }
})

io.on("connection", (socket) => {
    console.log("client connected:", socket.id);
    socket.on("player:input", async ({ gameId, input }: { gameId: string; input: string }) => {
        try {
            const stream = await graph.stream(
                { gameId, playerInput: input },
                { streamMode: "messages" }
            );
            for await(const [chunk, metadata] of stream) {
                if (metadata?.langgraph_node === "generateNarrative" && chunk?.content) {
                    socket.emit("turn:token", {token: chunk.content });
                }
            }
            socket.emit("turn:done")
        } catch (err) {
            console.error(err);
            socket.emit("turn:error", {message: "turn failed"})
        }
    });

    socket.on("disconnect", () => console.log("client disconnected:", socket.id));
});

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => {
    console.log(`Arbiter server on http://localhost:${PORT}`)
})
