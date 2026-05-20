import * as repo from "../repos/conversations";
import * as itemsRepo from "../repos/items";
import * as reportsRepo from "../repos/conversationReports";
import * as notificationsService from "./notifications";
import { censorMessage } from "../lib/censor";
import { HttpError } from "../middlewares/errorHandler";

export async function getInbox(userId: string) {
  const convs = await repo.listForUser(userId);
  if (convs.length === 0) return [];
  return repo.hydrateInbox(userId, convs);
}

export async function createConversation(
  buyerId: string,
  data: { sellerId: string; itemId?: string | null; initialMessage?: string },
) {
  if (buyerId === data.sellerId) {
    throw new HttpError(400, "Cannot start a conversation with yourself");
  }

  if (data.itemId) {
    const sellerId = await itemsRepo.findSellerId(data.itemId);
    if (!sellerId) throw new HttpError(404, "Item not found");
    if (sellerId !== data.sellerId) {
      throw new HttpError(403, "sellerId does not match the item's seller");
    }
  }

  const conv = await repo.insertConversation({
    buyerId,
    sellerId: data.sellerId,
    itemId: data.itemId ?? null,
    initialMessage: data.initialMessage ?? null,
  });
  if (!conv) throw new HttpError(500, "Failed to create conversation");

  if (data.initialMessage) {
    const preview = censorMessage(data.initialMessage);
    await repo.insertMessage({
      conversationId: conv.id,
      senderId: buyerId,
      text: preview,
    });
    await repo.bumpAfterNewMessage(conv.id, buyerId, preview);
    await notificationsService.createNotification({
      userId: data.sellerId,
      title: "Nouveau message",
      body: preview,
    });
  }

  const otherUser = await repo.getOtherUser(data.sellerId);
  return { ...conv, otherUser, item: null };
}

async function assertParticipant(conversationId: string, userId: string) {
  const conv = await repo.findParticipants(conversationId);
  if (!conv) throw new HttpError(404, "Conversation not found");
  if (conv.buyerId !== userId && conv.sellerId !== userId) {
    throw new HttpError(403, "Access denied");
  }
}

export async function getMessages(
  conversationId: string,
  userId: string,
  opts?: { limit?: number; before?: string },
) {
  await assertParticipant(conversationId, userId);
  await repo.clearUnreadForReader(conversationId, userId);
  const limit = opts?.limit ?? 50;
  return repo.listMessagesAscending(conversationId, {
    limit,
    beforeMessageId: opts?.before,
  });
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const conv = await repo.findParticipants(conversationId);
  if (!conv) throw new HttpError(404, "Conversation not found");
  if (conv.buyerId !== senderId && conv.sellerId !== senderId) {
    throw new HttpError(403, "You are not a participant of this conversation");
  }
  const censored = censorMessage(text);
  const msg = await repo.insertMessage({ conversationId, senderId, text: censored });
  if (!msg) throw new HttpError(500, "Failed to send message");
  await repo.bumpAfterNewMessage(conversationId, senderId, censored);
  const recipientId = conv.buyerId === senderId ? conv.sellerId : conv.buyerId;
  await notificationsService.createNotification({
    userId: recipientId,
    title: "Nouveau message",
    body: censored,
  });
  return msg;
}

export async function markConversationRead(conversationId: string, userId: string) {
  await assertParticipant(conversationId, userId);
  await repo.clearUnreadForReader(conversationId, userId);
  const unreadCount = (await repo.getUnreadCountForUser(conversationId, userId)) ?? 0;
  return { unreadCount };
}

export async function reportConversation(
  conversationId: string,
  reporterId: string,
  reason: string,
  details: string | null,
) {
  await assertParticipant(conversationId, reporterId);
  const report = await reportsRepo.insertReport({
    conversationId,
    reporterId,
    reason,
    details,
  });
  if (!report) throw new HttpError(500, "Failed to create report");
  return report;
}
