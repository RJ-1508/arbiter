import { useGameStore } from "../store/gameStore";

export default function NarrativePanel() {
  const narrative = useGameStore((s) => s.narrative);
  const isStreaming = useGameStore((s) => s.isStreaming);
  const lastCommand = useGameStore((s) => s.lastCommand);

  return (
    <div className="narrative">
      {lastCommand && <span className="cmd">{lastCommand}</span>}
      <p className={isStreaming ? "cursor" : ""}>{narrative}</p>
    </div>
  );
}
