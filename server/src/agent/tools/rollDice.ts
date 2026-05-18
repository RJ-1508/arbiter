import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const rollDice = tool(
  async ({ sides, count }) => {
    let rolls: Array<number> = [];
    let total = 0;
    for (let i = 0; i < count; i++) {
      let roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    return { "Individual rolls": rolls, Total: total };
  },
  {
    name: "roll_dice",
    description:
      "Rolls dice for any uncertain outcome. e.g. sides=20 count=1 for a standard d20 check.",
    schema: z.object({
      sides: z
        .number()
        .int()
        .min(1)
        .describe("number of sides per die, e.g. 20"),
      count: z.number().int().min(1).describe("how many dice to roll"),
    }),
  },
);
