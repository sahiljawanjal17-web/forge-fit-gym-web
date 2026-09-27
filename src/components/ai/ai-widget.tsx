"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { AiChat } from "./ai-chat";
import { Button } from "@/components/ui/button";

export function AiWidget({ role }: { role: "owner" | "customer" | null }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(620px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl sm:right-6">
          {role ? (
            <AiChat role={role} compact className="h-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <Sparkles className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Meet Forge AI</h3>
              <p className="text-sm text-muted-foreground">Your personal assistant for shopping, orders, memberships and training guidance. Sign in to start chatting.</p>
              <div className="flex gap-2">
                <Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
                <Button asChild><Link href="/register">Create account</Link></Button>
              </div>
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close Forge AI" : "Open Forge AI"}
        className="fixed bottom-6 right-4 z-50 flex h-14 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-105 sm:right-6"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "Ask Forge AI"}</span>
      </button>
    </>
  );
}
