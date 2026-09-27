import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PageTitle } from "@/components/dashboard/shell";
import { OrderStatusSelect } from "@/components/dashboard/admin-controls";
import { OrderDetail } from "@/components/dashboard/order-detail";
import { requireStaff } from "@/lib/auth";
import { getOrder } from "@/server/services/store";

export default async function AdminOrderPage({ params }: { params: { id: string } }) {
  await requireStaff();
  const order = await getOrder(params.id);
  if (!order) notFound();
  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="mr-1 h-4 w-4" />All orders</Link>
      <PageTitle title={`Order #${order.number}`} description={`${order.customer} · ${order.email}`} action={<OrderStatusSelect orderId={order.id} status={order.status} />} />
      <OrderDetail order={order} />
    </>
  );
}
