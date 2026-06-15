import { useEffect, useState } from "react";
import "./App.css";
import { socket } from "./lib/socket";
import { useGameStore } from "./store/gameStore";
import { useGameSocket } from "./hooks/useGameSocket";
import PlayerInput from "./components/PlayerInput";
import NarrativePanel from "./components/NarrativePanel";
import StatsSidebar from "./components/StatsSidebar";
import { InventoryPanel } from "./components/InventoryPanel";

const HUE: Record<string, number> = {
  "collapsed entrance": 40,
  "flooded hall": 205,
  "the sunken vault": 150,
};

export default function App() {
  const setGameId = useGameStore((s) => s.setGameId);
  const player = useGameStore((s) => s.player);
  const [open, setOpen] = useState(true);
  useGameSocket();

  const currentLocation = useGameStore((s) => s.currentLocation);
  useEffect(() => {
    const hue = HUE[currentLocation?.name?.toLowerCase() ?? ""] ?? 40;
    document.documentElement.style.setProperty("--accent-hue", String(hue));
  }, [currentLocation]);

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
    <div className={`app-layout${open ? "" : " sheet-collapsed"}`}>
      <aside className={open ? "sheet" : "sheet collapsed"}>
        <button onClick={() => setOpen(!open)}>{open ? "›" : "‹"}</button>
        <div className="detail">
          <InventoryPanel />
          <StatsSidebar />
        </div>
        <div className="vitals-only">
          Lv {player?.level}
          <div className="hpbar"><span style={{ width: `${player ? player.hp / player.maxHp * 100 : 0}%` }} /></div>
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
