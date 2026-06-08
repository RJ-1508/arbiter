import { GraphState } from "../state.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { NARRATIVE_SYSTEM_PROMPT } from "../prompts/narrative.js";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.8,
});

export async function generateNarrative(state: typeof GraphState.State) {
  const userMessage = buildNarrativePrompt(state);

  const res = await model.invoke([
    { role: "system", content: NARRATIVE_SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ]);
  return { narrative: res.content as string };
}

function buildNarrativePrompt(state: typeof GraphState.State): string {
  const { playerInput, actionType, toolResults, loadedState } = state;
  const lines: string[] = [];

  lines.push(`Player input: "${playerInput}"`);
  lines.push(`Action type: "${actionType}"`);

  const loc = loadedState.currentLocation;
  lines.push(`Location: ${loc.name} — ${loc.description}`);

  lines.push(`Mechanical outcome: ${summarizeOutcome(toolResults)}`);

  if (actionType === "dialogue") {
    const r = toolResults[0] as any;
    const npc = loadedState.npcs.find((n: any) => n.id === r.npcId);
    if (npc) {
      lines.push(`NPC: ${npc.name}, currently feeling "${npc.disposition}".`);
      const recent = (npc.dialogueHistory ?? [])
        .slice(-4)
        .map((d: any) => `${d.speaker}: ${d.text}`)
        .join("\n");
      if (recent) lines.push(`Recent conversation:\n${recent}`);
    }
  }

  return lines.join("\n");
}

function summarizeOutcome(toolResults: any[]): string {
  const r = toolResults[0] ?? {};

  if (r.ok === false)
    return `The action couldn't happen (${r.reason}). Convey this in-fiction.`;

  if (r.hit === false) return `The attack missed.`;
  if (r.hit === true)
    return (
      `The attack hit${r.isCrit ? " critically" : ""} for ${r.damage} damage; ` +
      `the target is now at ${r.npcHp} HP${r.npcHp <= 0 ? " (defeated)" : ""}.`
    );
  if (
    r.oldDisposition &&
    r.newDisposition &&
    r.oldDisposition !== r.newDisposition
  )
    return `${r.npcName}'s mood shifted from "${r.oldDisposition}" to "${r.newDisposition}".`;
  if (r.success === true) return `The attempt succeeded.`;
  if (r.success === false) return `The attempt failed.`;

  return JSON.stringify(r);
}
