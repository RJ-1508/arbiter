import { create } from "zustand";
import type { Player, InventoryItem } from "../types";
interface GameState {
  gameId: string | null;
  player: Player | null;
  items: InventoryItem[];
  narrative: string;
  isStreaming: boolean;
  lastCommand: string;
  currentLocation: { name: string } | null;
  setGameId: (id: string) => void;
  setTurnState: (s: { player: Player; items: InventoryItem[]; location?: { name: string } }) => void;
  appendToken: (token: string) => void;
  startTurn: (cmd: string) => void;
  endTurn: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: null,
  player: null,
  items: [],
  narrative: "",
  isStreaming: false,
  lastCommand: "",
  currentLocation: null,

  setGameId: (id) => set({ gameId: id }),
  setTurnState: (s) => set({ player: s.player, items: s.items, currentLocation: s.location ?? null }),
  appendToken: (token) =>
    set((state) => ({ narrative: state.narrative + token })),
  startTurn: (cmd) => set({ narrative: "", isStreaming: true, lastCommand: cmd }),
  endTurn: () => set({ isStreaming: false }),
}));
