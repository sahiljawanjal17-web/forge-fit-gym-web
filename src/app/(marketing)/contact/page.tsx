"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactAction } from "@/server/actions";

function Submit() {
  const { pending } = useFormStatus();
  return <Button size="lg" disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send message</Button>;
}

export default function ContactPage() {
  const [state, action] = useFormState(contactAction, null);
  return (
    <div className="container-x grid gap-12 pb-24 pt-32 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-5xl font-extrabold">Let&apos;s talk training.</h1>
        <p className="mt-4 max-w-md text-muted-foreground">Membership questions, corporate plans or press — our team replies within 24 hours. Members can also message their club directly from the dashboard.</p>
        <div className="mt-10 space-y-5 text-sm">
          <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" />hello@forgefit.com</p>
          <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" />+44 20 7946 0100 · +1 212 555 0148</p>
          <p className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-primary" />Ask Forge AI — bottom-right of every page</p>
        </div>
      </div>
      <form action={action} className="space-y-5 rounded-2xl border bg-card p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="message">Message</Label><Textarea id="message" name="message" rows={6} required /></div>
        {state && <p className={state.ok ? "text-sm text-success" : "text-sm text-destructive"}>{state.message}</p>}
        <Submit />
      </form>
    </div>
  );
}
