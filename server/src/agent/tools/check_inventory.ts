import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "../../db.js";

export const checkInventory = tool(
  async ({ gameId }) => {
    const items = await prisma.inventoryItem.findMany({ where: { gameId } });
    return {
      ok: true,
      items: items.map((item) => ({
        name: item.name,
        itemType: item.itemType,
        quantity: item.quantity,
      })),
    };
  },
  {
    name: "check_inventory",
    description: "Returns a list of inventory item names for the active game",
    schema: z.object({
      gameId: z.string().describe("The ID of the active game session"),
    }),
  },
);
