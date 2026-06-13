import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { socket } from "../lib/socket";
export default function PlayerInput() {
  const [text, setText] = useState("");

  const gameId = useGameStore((s) => s.gameId);
  const startTurn = useGameStore((s) => s.startTurn);

  const handleSubmit = () => {
    if (!text.trim() || !gameId) return;
    startTurn();
    socket.emit("player:input", { gameId, input: text });
    setText("");
  };
  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}
