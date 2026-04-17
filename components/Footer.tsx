import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/6 px-8 py-8">
      <div className="mx-auto max-w-6xl space-y-3 text-center text-xs text-muted-foreground/60">
        <p>
          Soonercharger is an independent project and is not affiliated with,
          endorsed by, or sponsored by Tesla, Inc. Tesla® and Supercharger® are
          registered trademarks of Tesla, Inc.
        </p>
        <p className="flex items-center justify-center gap-4">
          <Link
            href="/privacy"
            className="underline-offset-2 transition-colors hover:text-muted-foreground hover:underline"
          >
            Privacy Policy
          </Link>
          <span aria-hidden>·</span>
          <Link
            href="/terms"
            className="underline-offset-2 transition-colors hover:text-muted-foreground hover:underline"
          >
            Terms of Use
          </Link>
        </p>
      </div>
    </footer>
  );
}
