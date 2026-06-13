import { useGameStore } from "../store/gameStore";

export function InventoryPanel() {
  const items = useGameStore((s) => s.items);

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <span>
            {item.name}: {item.quantity}
          </span>
          <div>
            <small>{item.itemType}</small>
            {Object.keys(item.properties).length > 0 && (
              <small>
                {Object.entries(item.properties)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}
              </small>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
