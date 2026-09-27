import { AiChat } from "@/components/ai/ai-chat";
import { PageTitle } from "@/components/dashboard/shell";

export const metadata = { title: "Forge AI" };

export default function MemberAiPage() {
  return (
    <>
      <PageTitle title="Forge AI" description="Search the store, add to cart, place and track orders, manage your membership and get equipment guidance — just ask." />
      <AiChat role="customer" className="h-[calc(100vh-13rem)] rounded-xl border bg-card" />
    </>
  );
}
