"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth/client";

const DEMO = [
  { label: "Owner demo", email: "owner@forgefit.com", password: "Owner@12345" },
  { label: "Member demo", email: "member@forgefit.com", password: "Member@12345" },
];

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const finish = (role?: string) => {
    const next = params.get("next");
    router.push(next ?? (role === "owner" || role === "admin" ? "/admin/overview" : mode === "register" ? "/pricing" : "/member/dashboard"));
    router.refresh();
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = mode === "login"
      ? await signIn.email({ email, password })
      : await signUp.email({ email, password, name: String(form.get("name")) });
    setLoading(false);
    if (res.error) return setError(res.error.message ?? "Something went wrong.");
    finish((res.data?.user as { role?: string } | undefined)?.role);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{mode === "login" ? "Sign in to your Forge Fit account." : "Join Forge Fit in under a minute."}</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === "register" && <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required minLength={2} /></div>}
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button className="w-full" size="lg" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{mode === "login" ? "Sign in" : "Create account"}</Button>
      </form>
      {mode === "login" && (
        <div className="mt-6 rounded-xl border border-dashed p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Demo accounts</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO.map((d) => <Button key={d.email} type="button" variant="outline" size="sm" onClick={() => { setEmail(d.email); setPassword(d.password); }}>{d.label}</Button>)}
          </div>
        </div>
      )}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {mode === "login" ? <>New here? <Link href="/register" className="font-medium text-primary">Create an account</Link></> : <>Already a member? <Link href="/login" className="font-medium text-primary">Sign in</Link></>}
      </p>
    </div>
  );
}
