"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

type Result = { ok: boolean; message?: string };

export function ActionButton({ action, confirm, children, ...props }: Omit<ButtonProps, "onClick" | "action"> & { action: () => Promise<Result>; confirm?: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const res = await action();
          if (res.ok) { if (res.message) toast.success(res.message); router.refresh(); }
          else toast.error(res.message ?? "Something went wrong.");
        });
      }}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{children}
    </Button>
  );
}
