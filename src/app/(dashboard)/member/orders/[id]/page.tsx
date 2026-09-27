import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { PageTitle } from "@/components/dashboard/shell";
import { ActionButton } from "@/components/dashboard/action-button";
import { OrderDetail } from "@/components/dashboard/order-detail";
import { requireUser } from "@/lib/auth";
import { cancelOrderAction } from "@/server/actions";
import { getOrder } from "@/server/services/store";

export default async function MemberOrderPage({ params, searchParams }: { params: { id: string }; searchParams: { placed?: string } }) {
  const user = await requireUser();
  const order = await getOrder(params.id, user.id);
  if (!order) notFound();
  return (
    <>
      <Link href="/member/orders" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="mr-1 h-4 w-4" />All orders</Link>
      {searchParams.placed && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 p-4 text-sm"><CheckCircle2 className="h-5 w-5 text-success" />Thank you! Your order has been placed and a confirmation is in your notifications.</div>
      )}
      <PageTitle title={`Order #${order.number}`}
        action={["pending", "processing"].includes(order.status) ? <ActionButton variant="outline" action={cancelOrderAction.bind(null, order.id)} confirm="Cancel this order? Items go back into stock and any payment is refunded.">Cancel order</ActionButton> : undefined} />
      <OrderDetail order={order} />
    </>
  );
}
