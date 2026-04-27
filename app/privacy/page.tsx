import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Soonercharger.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto min-h-full w-full max-w-3xl px-8 py-12 sm:px-12 sm:py-16">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: April 26, 2026
      </p>

      <div className="mt-10 space-y-8 text-base leading-7 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            What data is collected
          </h2>
          <p>
            Soonercharger does not actively collect personal information. We do
            not use analytics services, tracking pixels, or advertising networks.
          </p>
          <p className="mt-3">
            However, the following data is collected automatically as part of
            standard infrastructure operation:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-foreground">Cloudflare</strong> — As our
              CDN and security provider, Cloudflare processes all requests and
              collects IP addresses, browser information, and other connection
              metadata for security, performance, and abuse prevention purposes.
              Cloudflare&apos;s own{" "}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                Privacy Policy
              </a>{" "}
              applies.
            </li>
            <li>
              <strong className="text-foreground">Server logs</strong> — Our
              backend and frontend servers retain standard access logs (IP
              addresses, request paths, timestamps, HTTP status codes) for
              debugging and reliability purposes. These logs are not shared with
              third parties and are retained only as long as operationally
              necessary.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Cookies
          </h2>
          <p>
            Soonercharger does not set any first-party cookies. Cloudflare may
            set cookies for security purposes (e.g. bot detection).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Third-party data
          </h2>
          <p>
            Supercharger location data displayed on this site is sourced from
            publicly available Tesla information. We do not share any visitor
            data with Tesla or any other third party.
          </p>
          <p className="mt-3">
            In development or preview environments, operators can explicitly set
            `ENABLE_MOCK_DATA=true` to serve built-in mock station records
            instead of backend-provided records. This switch only affects
            displayed station data and does not change what visitor data is
            collected.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Future changes
          </h2>
          <p>
            We may add analytics or visitor-count features in the future. This
            policy will be updated before any such changes take effect.
          </p>
        </section>

        {/* <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Contact
          </h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a
              href="mailto:lcs.carvajal@gmail.com"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              lcs.carvajal@gmail.com
            </a>
            .
          </p>
        </section> */}
      </div>
    </div>
  );
}
