import { create } from "zustand";
import type { Player, InventoryItem } from "../types";

export type Turn = { command: string; narration: string };

interface GameState {
  gameId: string | null;
  player: Player | null;
  items: InventoryItem[];
  narrative: string;
  isStreaming: boolean;
  lastCommand: string;
  currentLocation: { name: string } | null;
  pageTurns: Turn[];
  setGameId: (id: string) => void;
  setTurnState: (s: { player: Player; items: InventoryItem[]; location?: { name: string } }) => void;
  appendToken: (token: string) => void;
  startTurn: (cmd: string) => void;
  endTurn: () => void;
  clearPageTurns: () => void;
  keepLastPageTurn: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: null,
  player: null,
  items: [],
  narrative: "",
  isStreaming: false,
  lastCommand: "",
  currentLocation: null,
  pageTurns: [],

  setGameId: (id) => set({ gameId: id }),
  setTurnState: (s) => set({ player: s.player, items: s.items, currentLocation: s.location ?? null }),
  appendToken: (token) =>
    set((state) => ({ narrative: state.narrative + token })),
  startTurn: (cmd) => set({ narrative: "", isStreaming: true, lastCommand: cmd }),
  endTurn: () =>
    set((state) => ({
      isStreaming: false,
      pageTurns: [
        ...state.pageTurns,
        { command: state.lastCommand, narration: state.narrative },
      ],
    })),
  clearPageTurns: () => set({ pageTurns: [] }),
  keepLastPageTurn: () => set((state) => ({ pageTurns: state.pageTurns.slice(-1) })),
}));
