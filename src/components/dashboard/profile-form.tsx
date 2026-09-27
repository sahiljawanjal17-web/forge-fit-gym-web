"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/server/actions";

function Save() {
  const { pending } = useFormStatus();
  return <Button disabled={pending}>{pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button>;
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useFormState(updateProfileAction, null);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" name="name" defaultValue={name} required /></div>
      <div className="space-y-1.5"><Label>Email</Label><Input value={email} disabled /></div>
      {state && <p className={state.ok ? "text-sm text-success" : "text-sm text-destructive"}>{state.message}</p>}
      <Save />
    </form>
  );
}
