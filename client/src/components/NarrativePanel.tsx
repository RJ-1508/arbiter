import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import type { Turn } from "../store/gameStore";

function NarrationBlock({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => el.classList.add("narration-revealed"))
    );
  }, []);
  return (
    <div ref={ref} className="narration narration-enter">
      {text}
    </div>
  );
}

export default function NarrativePanel() {
  const pageTurns = useGameStore((s) => s.pageTurns);
  const narrative = useGameStore((s) => s.narrative);
  const isStreaming = useGameStore((s) => s.isStreaming);
  const lastCommand = useGameStore((s) => s.lastCommand);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pageTurns.length, narrative]);

  return (
    <>
      {pageTurns.map((turn: Turn, i: number) => (
        <div key={i}>
          <div className="player-command">{turn.command}</div>
          <NarrationBlock text={turn.narration} />
        </div>
      ))}
      {isStreaming && (
        <>
          <div className="player-command">{lastCommand}</div>
          <div className="narration narration-revealed">{narrative}</div>
        </>
      )}
      <div ref={bottomRef} />
    </>
  );
}
