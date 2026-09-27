"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { ArrowUp, Loader2, RotateCcw, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SUGGESTIONS = {
  owner: ["How did the business do this month?", "Which products need reordering?", "Show members at high churn risk", "Forecast revenue for the next 30 days"],
  customer: ["Recommend a protein for lean muscle", "What's in my cart?", "Where is my latest order?", "Which plan gives a store discount?"],
};

const TOOL_LABELS: Record<string, string> = {
  searchProducts: "Searching the store", getProductDetails: "Reading product details", addToCart: "Adding to cart", viewCart: "Checking your cart",
  updateCartItem: "Updating cart", placeOrder: "Placing order", listMyOrders: "Looking up orders", cancelMyOrder: "Cancelling order",
  getMembershipPlans: "Loading plans", getMyMembership: "Checking membership", subscribeToPlan: "Updating membership", changeMembership: "Updating membership",
  findEquipmentGuide: "Finding equipment guides", listClubs: "Listing clubs", getBusinessKpis: "Pulling KPIs", getRevenueTrend: "Analysing revenue",
  forecastRevenue: "Forecasting revenue", getInventoryStatus: "Checking inventory", restockItem: "Adjusting stock", listOrders: "Loading orders",
  updateOrderStatus: "Updating order", findMembers: "Analysing members", getTopProducts: "Ranking products",
};

const MUTATING = new Set(["addToCart", "updateCartItem", "placeOrder", "cancelMyOrder", "subscribeToPlan", "changeMembership", "restockItem", "updateOrderStatus"]);

export function AiChat({ role, className, compact }: { role: "owner" | "customer"; className?: string; compact?: boolean }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error, setMessages, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
    onFinish: ({ message }) => {
      if (message.parts.some((p) => isToolUIPart(p) && MUTATING.has(getToolName(p)))) router.refresh();
    },
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    clearError();
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary"><Sparkles className="h-4 w-4" /></div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Forge AI</p>
          <p className="truncate text-xs text-muted-foreground">{role === "owner" ? "Business co-pilot · live data" : "Shopping & training assistant"}</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setMessages([])} title="New chat"><RotateCcw className="h-4 w-4" /></Button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-6 text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="max-w-xs text-sm text-muted-foreground">
              {role === "owner" ? "Ask about revenue, stock, orders or members — I can also take actions for you." : "Ask me to find products, place orders, track deliveries or manage your membership."}
            </p>
            <div className={cn("grid w-full gap-2", !compact && "sm:grid-cols-2")}>
              {SUGGESTIONS[role].map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-lg border bg-card px-3 py-2 text-left text-xs transition-colors hover:border-primary/50 hover:bg-accent">{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[88%] space-y-2 rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
              {m.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div key={i} className="prose-chat">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => href?.startsWith("/") ? <Link href={href} className="font-medium text-primary underline underline-offset-2">{children}</Link> : <a href={href} target="_blank" rel="noreferrer" className="underline">{children}</a>,
                          ul: ({ children }) => <ul className="my-1 list-disc space-y-0.5 pl-4">{children}</ul>,
                          ol: ({ children }) => <ol className="my-1 list-decimal space-y-0.5 pl-4">{children}</ol>,
                          p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                          table: ({ children }) => <div className="overflow-x-auto"><table className="my-2 text-xs">{children}</table></div>,
                          th: ({ children }) => <th className="border-b px-2 py-1 text-left">{children}</th>,
                          td: ({ children }) => <td className="border-b px-2 py-1">{children}</td>,
                        }}
                      >
                        {part.text}
                      </ReactMarkdown>
                    </div>
                  );
                }
                if (isToolUIPart(part)) {
                  const name = getToolName(part);
                  const running = part.state === "input-streaming" || part.state === "input-available";
                  const failed = part.state === "output-error" || (part.state === "output-available" && typeof part.output === "object" && part.output !== null && "error" in part.output);
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      {running ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wrench className="h-3 w-3" />}
                      <span className={cn(failed && "text-destructive")}>{TOOL_LABELS[name] ?? name}{running ? "…" : failed ? " — failed" : " ✓"}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
        {status === "submitted" && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Thinking…</div>}
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error.message.includes("sign in") ? <>Please <Link href="/login" className="underline">sign in</Link> to chat with Forge AI.</> : error.message || "The free AI models are busy right now — please try again in a moment."}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={1}
          placeholder="Message Forge AI…"
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim()} className="h-10 w-10 shrink-0">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
