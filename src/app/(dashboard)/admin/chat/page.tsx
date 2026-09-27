import Link from "next/link";
import { PageTitle } from "@/components/dashboard/shell";
import { SupportChat } from "@/components/chat/support-chat";
import { requireStaff } from "@/lib/auth";
import { listMessages, listSupportInbox } from "@/server/services/chat";
import { cn, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function AdminChatPage({ searchParams }: { searchParams: { c?: string } }) {
  const user = await requireStaff();
  const inbox = await listSupportInbox();
  const active = inbox.find((c) => c.id === searchParams.c) ?? inbox[0];
  const messages = active ? await listMessages(active.id) : [];
  return (
    <>
      <PageTitle title="Messages" description="Direct conversations with your members." />
      <div className="grid h-[calc(100vh-14rem)] overflow-hidden rounded-xl border bg-card md:grid-cols-3">
        <ul className="overflow-y-auto border-b md:border-b-0 md:border-r">
          {inbox.length === 0 && <li className="p-6 text-sm text-muted-foreground">No conversations yet. Members can message you from their dashboard.</li>}
          {inbox.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/chat?c=${c.id}`} className={cn("block border-b p-4 hover:bg-accent", active?.id === c.id && "bg-primary/10")}>
                <div className="flex justify-between gap-2"><p className="truncate text-sm font-medium">{c.customer}</p><span className="shrink-0 text-[10px] text-muted-foreground">{formatRelativeTime(c.updatedAt)}</span></div>
                <p className="truncate text-xs text-muted-foreground">{c.last ?? "No messages yet"}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="min-h-0 md:col-span-2">
          {active ? <SupportChat messages={messages} meId={user.id} conversationId={active.id} emptyText={`Start the conversation with ${active.customer}.`} /> : <p className="p-10 text-center text-sm text-muted-foreground">Select a conversation.</p>}
        </div>
      </div>
    </>
  );
}
