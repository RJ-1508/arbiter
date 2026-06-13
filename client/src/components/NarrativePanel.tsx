import { useGameStore } from "../store/gameStore";

export default function NarrativePanel() {
  const narrative = useGameStore((s) => s.narrative);
  const isStreaming = useGameStore((s) => s.isStreaming);

  return (
    <div>
      <p>{narrative}</p>
      {isStreaming && <span>…</span>}
    </div>
  );
}
