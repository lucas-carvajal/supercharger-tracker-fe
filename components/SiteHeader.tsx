"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/list", label: "List", Icon: List },
  { href: "/map", label: "Map", Icon: MapPin },
] as const;

function BrandMark() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="size-7 shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="site-header-bolt" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffe24a" />
          <stop offset="45%" stopColor="#ffc21a" />
          <stop offset="100%" stopColor="#f07a00" />
        </linearGradient>
      </defs>
      <path
        fill="url(#site-header-bolt)"
        stroke="#b85a00"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M62 4 L20 56 L42 54 L34 96 L80 42 L56 44 Z"
      />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-transparent supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link
          href="/"
          aria-label="Soonercharger home"
          className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <BrandMark />
          <span className="hidden font-heading text-base font-semibold tracking-tight text-foreground sm:inline">
            Soonercharger
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-full text-sm font-medium transition-colors sm:size-auto sm:gap-2 sm:px-4 sm:py-2",
                  isActive
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon className="size-5 sm:size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
