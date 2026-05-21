import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";
import { canAddItem } from "../../engine/boundHelpers.js";
import { RULES } from "../../engine/rules.js";

export const addToInventory = tool(
  async ({ gameId, name, itemType, quantity }) => {
    const existing = await prisma.inventoryItem.findFirst({
      where: { gameId, name, itemType },
    });

    if (existing) {
      const updated = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
      return { ok: true, item: updated };
    }

    const slots = await prisma.inventoryItem.count({ where: { gameId } });
    if (!canAddItem(slots, RULES.inventory.cap)) {
      return { ok: false, reason: "inventory_full" };
    }

    const newItem = await prisma.inventoryItem.create({
      data: { gameId, name, quantity, itemType },
    });
    return { ok: true, item: newItem };
  },
  {
    name: "add_to_inventory",
    description:
      "Adds an item to the player's inventory. Stacks quantity if the item already exists. Returns { ok: true, item } on success or { ok: false, reason: 'inventory_full' } if the slot cap is reached.",
    schema: z.object({
      gameId: z.string().describe("The ID of the active game session"),
      name: z.string().describe("Display name of the item"),
      itemType: z
        .enum(Object.keys(RULES.inventory.itemTypes) as [string, ...string[]])
        .describe(
          "Category of the item — must be a known type from RULES.inventory.itemTypes",
        ),
      quantity: z.number().int().min(1).describe("How many to add (default 1)"),
    }),
  },
);
