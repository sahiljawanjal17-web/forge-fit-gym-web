import { AiChat } from "@/components/ai/ai-chat";
import { PageTitle } from "@/components/dashboard/shell";

export const metadata = { title: "Forge AI · Owner" };

export default function OwnerAiPage() {
  return (
    <>
      <PageTitle title="Forge AI co-pilot" description="Live access to revenue, forecasts, inventory, orders and members. It can restock items and update orders after you confirm." />
      <AiChat role="owner" className="h-[calc(100vh-13rem)] rounded-xl border bg-card" />
    </>
  );
}
