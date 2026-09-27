import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-black lg:block">
        <video className="absolute inset-0 h-full w-full object-cover opacity-60" src="/videos/hero-2.mp4" autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <Link href="/" className="absolute left-10 top-10 font-heading text-2xl font-extrabold text-white">FORGE<span className="text-primary">FIT</span></Link>
        <blockquote className="absolute bottom-12 left-10 right-10 text-white">
          <p className="font-heading text-3xl font-bold leading-tight">“Discipline is choosing between what you want now and what you want most.”</p>
          <footer className="mt-4 text-sm text-white/60">Train at 5 flagship clubs worldwide</footer>
        </blockquote>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 block font-heading text-2xl font-extrabold lg:hidden">FORGE<span className="text-primary">FIT</span></Link>
          {children}
        </div>
      </div>
    </div>
  );
}
