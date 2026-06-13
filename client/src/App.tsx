import { useEffect } from "react";
import "./App.css";
import { socket } from "./lib/socket";
import { useGameStore } from "./store/gameStore";
import { useGameSocket } from "./hooks/useGameSocket";
import PlayerInput from "./components/PlayerInput";
import NarrativePanel from "./components/NarrativePanel";
import StatsSidebar from "./components/StatsSidebar";
import { InventoryPanel } from "./components/InventoryPanel";

export default function App() {
  const setGameId = useGameStore((s) => s.setGameId);
  useGameSocket();

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    async function initGame() {
      const res = await fetch("/api/games", { method: "POST" });
      const data = await res.json();
      setGameId(data.gameId);
    }
    initGame();
  }, []);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-inventory">
          <InventoryPanel />
        </div>
        <div className="sidebar-stats">
          <StatsSidebar />
        </div>
      </aside>
      <main className="main">
        <div className="narrative-wrap">
          <NarrativePanel />
        </div>
        <div className="input-wrap">
          <PlayerInput />
        </div>
      </main>
    </div>
  );
}
