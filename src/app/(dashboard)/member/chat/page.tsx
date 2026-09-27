import { PageTitle } from "@/components/dashboard/shell";
import { SupportChat } from "@/components/chat/support-chat";
import { requireUser } from "@/lib/auth";
import { getSupportConversation, listMessages } from "@/server/services/chat";

export const metadata = { title: "Message your club" };

export default async function MemberChatPage() {
  const user = await requireUser();
  const messages = await listMessages(await getSupportConversation(user.id));
  return (
    <>
      <PageTitle title="Message your club" description="Chat directly with the Forge Fit owner and team. For instant answers, try Forge AI." />
      <div className="h-[calc(100vh-14rem)] overflow-hidden rounded-xl border bg-card">
        <SupportChat messages={messages} meId={user.id} emptyText="Say hello — the club team usually replies within a few hours." />
      </div>
    </>
  );
}
