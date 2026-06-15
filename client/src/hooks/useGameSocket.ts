import { useEffect } from "react";
import { socket } from "../lib/socket";
import { useGameStore } from "../store/gameStore";
import type { Player, InventoryItem } from "../types";
export function useGameSocket() {
  const appendToken = useGameStore((s) => s.appendToken);
  const setTurnState = useGameStore((s) => s.setTurnState);
  const endTurn = useGameStore((s) => s.endTurn);

  useEffect(() => {
    function onToken({ token }: { token: string }) {
      appendToken(token);
    }
    function onState({
      player,
      items,
      location,
    }: {
      player: Player;
      items: InventoryItem[];
      location?: { name: string };
    }) {
      setTurnState({ player, items, location });
    }

    function onDone() {
      endTurn();
    }
    function onError(e: { message: string }) {
      console.error("turn error:", e.message);
      endTurn();
    }

    socket.on("turn:token", onToken);
    socket.on("turn:state", onState);
    socket.on("turn:done", onDone);
    socket.on("turn:error", onError);

    return () => {
      socket.off("turn:token", onToken);
      socket.off("turn:state", onState);
      socket.off("turn:done", onDone);
      socket.off("turn:error", onError);
    };
  }, [appendToken, setTurnState, endTurn]);
}
