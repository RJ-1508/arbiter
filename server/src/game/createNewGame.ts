import { prisma } from "../db.js";
import seedData from "../content/adventure.seed.json" with { type: "json" };

export async function createNewGame(): Promise<string> {
  try {
    return await prisma.$transaction(async (tx) => {
      const game = await tx.game.create({
        data: {
          status: "active",
          questState: {},
        },
      });

      // maps seed content keys to DB-generated IDs; exits reference keys but the DB needs real IDs
      const locationMap = new Map<string, string>();
      for (const loc of seedData.locations) {
        const created = await tx.location.create({
          data: {
            gameId: game.id,
            name: loc.name,
            description: loc.description,
            exits: {},
            lootTable: loc.lootTable,
          },
        });
        locationMap.set(loc.key, created.id);
      }

      for (const loc of seedData.locations) {
        const resolvedExits: Record<string, string> = {};
        for (const [direction, targetKey] of Object.entries(loc.exits)) {
          const targetId = locationMap.get(targetKey);
          if (!targetId)
            throw new Error(`Unknown exit target key: ${targetKey}`);
          resolvedExits[direction] = targetId;
        }
        await tx.location.update({
          where: { id: locationMap.get(loc.key)! },
          data: { exits: resolvedExits },
        });
      }

      const startLocationId = locationMap.get(seedData.startLocationKey);
      if (!startLocationId)
        throw new Error(
          `Unknown startLocationKey: ${seedData.startLocationKey}`,
        );

      const winLocationId = locationMap.get(seedData.winCondition.locationKey);
      if (!winLocationId)
        throw new Error(
          `Unknown win condition locationKey: ${seedData.winCondition.locationKey}`,
        );

      await tx.game.update({
        where: { id: game.id },
        data: {
          currentLocationId: startLocationId,
          questState: {
            winCondition: {
              type: seedData.winCondition.type,
              locationId: winLocationId,
            },
          },
        },
      });

      for (const npc of seedData.npcs) {
        const locationId = locationMap.get(npc.locationKey);
        if (!locationId)
          throw new Error(`Unknown NPC locationKey: ${npc.locationKey}`);
        await tx.npc.create({
          data: {
            gameId: game.id,
            name: npc.name,
            archetype: npc.archetype,
            maxHp: npc.maxHp,
            hp: npc.maxHp,
            disposition: npc.disposition,
            locationId,
            stats: npc.stats,
          },
        });
      }

      await tx.player.create({
        data: {
          gameId: game.id,
          maxHp: seedData.player.maxHp,
          hp: seedData.player.maxHp,
          stats: seedData.player.stats,
        },
      });

      return game.id;
    });
  } catch (error) {
    console.error("createNewGame failed:", error);
    throw error;
  }
}
