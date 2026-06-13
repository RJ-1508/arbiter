import { create } from "zustand";
import type { Player, InventoryItem } from "../types";
interface GameState {
  gameId: string | null;
  player: Player | null;
  items: InventoryItem[];
  narrative: string;
  isStreaming: boolean;
  setGameId: (id: string) => void;
  setTurnState: (state: { player: Player; items: InventoryItem[] }) => void;
  appendToken: (token: string) => void;
  startTurn: () => void;
  endTurn: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: null,
  player: null,
  items: [],
  narrative: "",
  isStreaming: false,

  setGameId: (id) => set({ gameId: id }),
  setTurnState: ({ player, items }) => set({ player, items }),
  appendToken: (token) =>
    set((state) => ({ narrative: state.narrative + token })),
  startTurn: () => set({ narrative: "", isStreaming: true }),
  endTurn: () => set({ isStreaming: false }),
}));
