"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackToSitesLink() {
  const router = useRouter();

  return (
    <Link
      href="/list"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

        const referrer = document.referrer ? new URL(document.referrer) : null;
        if (
          referrer?.origin === window.location.origin &&
          window.history.length > 1
        ) {
          e.preventDefault();
          router.back();
        }
      }}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      <span>Back to all sites</span>
    </Link>
  );
}
