import { GraphState } from "../state.js";
import { prisma } from "../../db.js";
import { Prisma } from "@prisma/client";

// This interface IS the contract — mirror it against what your six handlers
// actually put in proposedStateChanges. The key names must agree.
interface ProposedStateChanges {
  npcId?: string;
  npcHp?: number;
  newDisposition?: string;
  dialogueAppend?: { speaker: string; text: string }; // decision-dependent — see note below
  newLocationId?: string;
  playerHp?: number; // NOT in your handover doc's key list — confirm a handler emits it
  addItem?: { name: string; itemType: string; quantity?: number };
  removeItemId?: string;
}

export async function persist(
  state: typeof GraphState.State,
): Promise<Partial<typeof GraphState.State>> {
  const { gameId, loadedState } = state;
  const changes = state.proposedStateChanges as ProposedStateChanges;

  await prisma.$transaction(async (tx) => {
    // NPC scalar changes (hp + disposition) — merged into one update
    if (
      changes.npcId &&
      (changes.npcHp !== undefined || changes.newDisposition)
    ) {
      const npcData: Prisma.NpcUpdateInput = {};
      if (changes.npcHp !== undefined) npcData.hp = changes.npcHp;
      if (changes.newDisposition) npcData.disposition = changes.newDisposition;
      await tx.npc.update({ where: { id: changes.npcId }, data: npcData });
    }

    // NPC dialogue line — OPTIONAL, decide first (see note)
    if (changes.npcId && changes.dialogueAppend) {
      const npc = loadedState.npcs.find((n: any) => n.id === changes.npcId);
      const history = (
        Array.isArray(npc?.dialogueHistory) ? npc!.dialogueHistory : []
      ) as unknown[];
      await tx.npc.update({
        where: { id: changes.npcId },
        data: {
          dialogueHistory: [
            ...history,
            changes.dialogueAppend,
          ] as Prisma.InputJsonValue,
        },
      });
    }

    // Movement
    if (changes.newLocationId) {
      await tx.game.update({
        where: { id: gameId },
        data: { currentLocationId: changes.newLocationId },
      });
      // optional: await tx.location.update({ where: { id: changes.newLocationId }, data: { visited: true } });
    }

    // Player HP (only fires if a handler emits it)
    if (changes.playerHp !== undefined) {
      await tx.player.update({
        where: { gameId },
        data: { hp: changes.playerHp },
      });
    }

    // Inventory add / remove
    if (changes.addItem) {
      await tx.inventoryItem.create({
        data: {
          gameId,
          name: changes.addItem.name,
          itemType: changes.addItem.itemType,
          quantity: changes.addItem.quantity ?? 1,
        },
      });
    }
    if (changes.removeItemId) {
      await tx.inventoryItem.delete({ where: { id: changes.removeItemId } });
    }

    // Always append the turn row (1-indexed — this is the fix)
    const turnNumber = (await tx.turn.count({ where: { gameId } })) + 1;
    await tx.turn.create({
      data: {
        gameId,
        turnNumber,
        playerInput: state.playerInput,
        actionType: state.actionType!, // always set by classifyAction
        toolCalls: state.toolResults as any,
        narrative: state.narrative!, // always set by generateNarrative
      },
    });
  });

  return {};
}
