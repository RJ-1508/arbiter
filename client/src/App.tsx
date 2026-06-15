import { useEffect, useRef, useState } from "react";
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

const MAX_TURNS_PER_PAGE = 4;

export default function App() {
  const setGameId = useGameStore((s) => s.setGameId);
  useGameSocket();

  const currentLocation = useGameStore((s) => s.currentLocation);
  const pageTurns = useGameStore((s) => s.pageTurns);
  const clearPageTurns = useGameStore((s) => s.clearPageTurns);
  const keepLastPageTurn = useGameStore((s) => s.keepLastPageTurn);

  const papyrusRef = useRef<HTMLDivElement>(null);
  const prevLocationRef = useRef<string | null | undefined>(undefined);
  const [titleRevealed, setTitleRevealed] = useState(false);
  const isPageTurning = useRef(false);
  const prevPageTurnsLengthRef = useRef(0);

  function triggerPageTurn(onMidpoint: () => void, onComplete?: () => void) {
    if (isPageTurning.current) return;
    isPageTurning.current = true;
    papyrusRef.current?.classList.add("turning");
    setTimeout(() => {
      onMidpoint();
      papyrusRef.current?.classList.remove("turning");
      isPageTurning.current = false;
      onComplete?.();
    }, 700);
  }

  // Location hue update + location-change page turn
  useEffect(() => {
    const name = currentLocation?.name ?? null;
    const hue = HUE[name?.toLowerCase() ?? ""] ?? 40;
    document.documentElement.style.setProperty("--accent-hue", String(hue));

    if (prevLocationRef.current === undefined) {
      // First location load: reveal the title without a page turn
      prevLocationRef.current = name;
      requestAnimationFrame(() => requestAnimationFrame(() => setTitleRevealed(true)));
      return;
    }

    if (name !== prevLocationRef.current) {
      setTitleRevealed(false);
      triggerPageTurn(
        () => { clearPageTurns(); },
        () => { requestAnimationFrame(() => requestAnimationFrame(() => setTitleRevealed(true))); }
      );
    }

    prevLocationRef.current = name;
  }, [currentLocation]);

  // Overflow page turn: when the visible page exceeds MAX_TURNS_PER_PAGE
  useEffect(() => {
    const len = pageTurns.length;
    if (
      len > prevPageTurnsLengthRef.current &&
      len > MAX_TURNS_PER_PAGE &&
      !isPageTurning.current
    ) {
      triggerPageTurn(() => keepLastPageTurn());
    }
    prevPageTurnsLengthRef.current = len;
  }, [pageTurns.length]);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    async function initGame() {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/games`, {
        method: "POST",
      });
      const data = await res.json();
      setGameId(data.gameId);
    }
    initGame();
  }, []);

  return (
    <>
      <div className="candle-warm" aria-hidden="true" />
      <div className="candle-cool" aria-hidden="true" />
      <div className="fog-layer" aria-hidden="true" />
      <div className="app-layout">
        <div className="reading-area">
          <h1 className={`location-title${titleRevealed ? " revealed" : ""}`}>
            {currentLocation?.name ?? " "}
          </h1>
          <div ref={papyrusRef} className="papyrus">
            <NarrativePanel />
            <PlayerInput />
          </div>
        </div>
        <aside className="sidebar">
          <InventoryPanel />
          <StatsSidebar />
        </aside>
      </div>
    </>
  );
}
