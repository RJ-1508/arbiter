import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ACTION_TYPES, RULES } from "../../engine/rules.js";

export const checkRule = tool(
  async ({ actionType }) => {
    return { ok: true, rules: RULES[actionType] };
  },
  {
    name: "check_rule",
    description:
      "Returns the authoritative rule data for a given action type (combat formulas, skill-check DCs, etc.). No DB access — keeps resolution logic centralized rather than scattered across prompts.",
    schema: z.object({
      actionType: z
        .enum(ACTION_TYPES)
        .describe("The category of action whose rules to retrieve"),
    }),
  },
);
