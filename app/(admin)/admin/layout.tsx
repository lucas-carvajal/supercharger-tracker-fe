import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_oklch(0.24_0.05_28_/_0.35),_transparent_48%),linear-gradient(180deg,_oklch(0.11_0.01_265),_oklch(0.08_0.008_265))] text-foreground">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
              Soonercharger
            </p>
            <h1 className="mt-1 font-heading text-lg font-semibold tracking-tight text-white">
              Admin Console
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/12 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-white"
          >
            Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
