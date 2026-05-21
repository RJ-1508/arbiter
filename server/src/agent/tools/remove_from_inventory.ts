import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";

export const removeFromInventory = tool(
  async ({ gameId, name, quantity }) => {
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { gameId, name },
    });
    if (!inventoryItem) {
      return { ok: false, reason: "item_not_present" };
    }
    if (inventoryItem.quantity < quantity) {
      return { ok: false, reason: "insufficient_quantity" };
    }
    const newQuantity = inventoryItem.quantity - quantity;
    if (newQuantity === 0) {
      await prisma.inventoryItem.delete({ where: { id: inventoryItem.id } });
    }
    const removed = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: newQuantity },
    });
    return { ok: true, item: { ...inventoryItem, quantity: 0 } };
  },
  {
    name: "remove_from_inventory",
    description:
      "Removes an item (or decrements its quantity) from the player's inventory. Returns gracefully if the item is not present — does not throw.",
    schema: z.object({
      gameId: z.string().describe("The ID of the active game session"),
      name: z.string().describe("Name of the item to remove"),
      quantity: z.number().int().min(1).describe("How many to remove"),
    }),
  },
);
