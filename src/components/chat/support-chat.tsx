"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendSupportMessageAction } from "@/server/actions";
import { cn, formatRelativeTime } from "@/lib/utils";

type Msg = { id: string; content: string; createdAt: Date; senderId: string | null; senderName: string | null; senderRole: string | null };

export function SupportChat({ messages, meId, conversationId, emptyText }: { messages: Msg[]; meId: string; conversationId?: string; emptyText: string }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const bottom = useRef<HTMLDivElement>(null);

  // Poll for new messages; a WebSocket server (Soketi) can replace this later.
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [router]);
  useEffect(() => { bottom.current?.scrollIntoView(); }, [messages.length]);

  const send = () => {
    if (!text.trim()) return;
    start(async () => {
      const res = await sendSupportMessageAction(text, conversationId);
      if (!res.ok) return void toast.error(res.message);
      setText("");
      router.refresh();
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">{emptyText}</p>}
        {messages.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2 text-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted")}>{m.content}</div>
              <span className="mt-1 text-[10px] text-muted-foreground">{mine ? "You" : m.senderName}{m.senderRole === "owner" && !mine ? " · Club team" : ""} · {formatRelativeTime(m.createdAt)}</span>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        <Button size="icon" className="h-10 w-10" disabled={pending || !text.trim()}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}</Button>
      </form>
    </div>
  );
}
