import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-5xl font-extrabold">Rest day for this page.</h1>
      <p className="text-muted-foreground">We couldn&apos;t find what you were looking for.</p>
      <Button asChild><Link href="/">Back to Forge Fit</Link></Button>
    </div>
  );
}
