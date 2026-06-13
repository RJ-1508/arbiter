import { useGameStore } from "../store/gameStore";

export default function StatsSidebar() {
  const player = useGameStore((s) => s.player);

  if (!player) return null;

  return (
    <div>
      <div>HP: {player.hp} / {player.maxHp}</div>
      <div>Level: {player.level} — XP: {player.xp}</div>
    </div>
  );
}
