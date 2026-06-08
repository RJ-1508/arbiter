import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { ACTION_TYPES } from "../../engine/rules.js";
import { GraphState } from "../state.js";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const classificationSchema = z.object({
  actionType: z.enum(ACTION_TYPES),
  target: z.string().nullable().describe("NPC name, if relevant"),
  exit: z.string().nullable().describe("Exit name or direction, for movement"),
  item: z.string().nullable().describe("Item name, for inventory actions"),
  intent: z.string().nullable().describe("One-sentence paraphrase of what the player wants"),
});

const classifier = model.withStructuredOutput(classificationSchema);

const SYSTEM_PROMPT = `You are classifying player input in a text-based RPG. \
Choose the single best action type and extract the relevant entities. Set fields to null when not applicable.

Action types:
- combat       — player attacks, fights, or uses a weapon against a target
- skill_check  — non-combat attempt requiring a roll (climbing, sneaking, picking a lock, etc.)
- dialogue     — player speaks to, persuades, intimidates, or interacts socially with an NPC
- movement     — player moves to a new area through a named exit
- inventory    — player uses, takes, drops, equips, or asks about an item
- meta         — player asks about their own stats, game rules, or other out-of-narrative questions`;

export async function classifyAction(state: typeof GraphState.State) {
  const result = await classifier.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: state.playerInput },
  ]);

  return {
    actionType: result.actionType,
    actionParams: {
      target: result.target,
      exit: result.exit,
      item: result.item,
      intent: result.intent,
    },
  };
}
