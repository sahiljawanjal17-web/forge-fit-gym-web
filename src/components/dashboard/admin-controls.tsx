"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adjustStockAction, updateOrderStatusAction } from "@/server/actions";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"] as const;

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => start(async () => {
          const res = await updateOrderStatusAction(orderId, e.target.value as (typeof STATUSES)[number]);
          if (res.ok) { toast.success(res.message); router.refresh(); } else toast.error(res.message);
        })}
        className="h-8 rounded-md border bg-background px-2 text-xs capitalize"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
    </div>
  );
}

export function StockAdjuster({ inventoryId, suggested }: { inventoryId: string; suggested: number }) {
  const [value, setValue] = useState(suggested > 0 ? suggested : 10);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex items-center justify-end gap-1.5">
      <input type="number" value={value} onChange={(e) => setValue(parseInt(e.target.value || "0", 10))} className="h-8 w-16 rounded-md border bg-background px-2 text-right font-mono text-xs" />
      <Button size="sm" variant="outline" className="h-8" disabled={pending || !value}
        onClick={() => start(async () => {
          const res = await adjustStockAction(inventoryId, value);
          if (res.ok) { toast.success(`${value > 0 ? "Added" : "Removed"} ${Math.abs(value)} units`); router.refresh(); } else toast.error(res.message);
        })}>
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : value >= 0 ? "Restock" : "Remove"}
      </Button>
    </div>
  );
}
