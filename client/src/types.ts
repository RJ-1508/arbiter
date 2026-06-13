export type Player = {
  id: string;
  gameId: string;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  stats: Record<string, number>;
};

export type InventoryItem = {
  id: string;
  gameId: string;
  itemType: string;
  name: string;
  quantity: number;
  properties: Record<string, unknown>;
};
