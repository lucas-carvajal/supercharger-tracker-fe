import Link from "next/link";

const X_PROFILE_URL = "https://x.com/soonercharger";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

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
          <a
            href={X_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Soonercharger on X"
            className="-m-1 inline-flex size-9 items-center justify-center rounded-full transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <XIcon className="size-3.5" />
          </a>
          <span aria-hidden>·</span>
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
