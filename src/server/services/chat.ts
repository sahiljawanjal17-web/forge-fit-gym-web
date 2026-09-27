import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import * as s from "@/server/db/schema";

export async function getSupportConversation(customerId: string) {
  const [existing] = await db.select({ id: s.chatConversations.id }).from(s.chatConversations)
    .innerJoin(s.chatParticipants, eq(s.chatParticipants.conversationId, s.chatConversations.id))
    .where(and(eq(s.chatParticipants.userId, customerId), eq(s.chatConversations.type, "customer_support"))).limit(1);
  if (existing) return existing.id;
  const [conv] = await db.insert(s.chatConversations).values({ type: "customer_support", title: "Support" }).returning();
  await db.insert(s.chatParticipants).values({ conversationId: conv.id, userId: customerId });
  return conv.id;
}

export async function listMessages(conversationId: string) {
  return db.select({ id: s.chatMessages.id, content: s.chatMessages.content, createdAt: s.chatMessages.createdAt, senderId: s.chatMessages.senderId, senderName: s.users.name, senderRole: s.users.role })
    .from(s.chatMessages).leftJoin(s.users, eq(s.users.id, s.chatMessages.senderId))
    .where(eq(s.chatMessages.conversationId, conversationId)).orderBy(asc(s.chatMessages.createdAt));
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const text = content.trim().slice(0, 2000);
  if (!text) throw new Error("Message is empty.");
  const [msg] = await db.insert(s.chatMessages).values({ conversationId, senderId, content: text }).returning();
  await db.update(s.chatConversations).set({ updatedAt: new Date() }).where(eq(s.chatConversations.id, conversationId));
  return msg;
}

export async function listSupportInbox() {
  return db.select({
    id: s.chatConversations.id, updatedAt: s.chatConversations.updatedAt, customerId: s.users.id, customer: s.users.name, email: s.users.email,
    last: sql<string>`(select content from chat_messages m where m.conversation_id = ${s.chatConversations.id} order by created_at desc limit 1)`,
  }).from(s.chatConversations)
    .innerJoin(s.chatParticipants, eq(s.chatParticipants.conversationId, s.chatConversations.id))
    .innerJoin(s.users, eq(s.users.id, s.chatParticipants.userId))
    .where(eq(s.chatConversations.type, "customer_support"))
    .orderBy(desc(s.chatConversations.updatedAt));
}
