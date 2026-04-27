import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Soonercharger.",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <div className="mx-auto min-h-full w-full max-w-3xl px-8 py-12 sm:px-12 sm:py-16">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Terms of Use
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: April 26, 2026
      </p>

      <div className="mt-10 space-y-8 text-base leading-7 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            About this site
          </h2>
          <p>
            Soonercharger is an independent fan project that tracks the
            expansion of the Tesla Supercharger network. It is not affiliated
            with, endorsed by, or sponsored by Tesla, Inc. Tesla® and
            Supercharger® are registered trademarks of Tesla, Inc.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Data accuracy
          </h2>
          <p>
            All data shown on this site — including station locations, statuses,
            and timelines — is sourced from publicly available information and
            may be incomplete, outdated, or inaccurate. Do not rely on this
            data for time-sensitive decisions. Always verify with official Tesla
            sources before planning a trip or making any decision based on
            charging availability.
          </p>
          <p className="mt-3">
            In development and testing environments, we may serve synthetic mock
            data when explicitly enabled by configuration. Mock data is for
            demonstration only and does not represent live network conditions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            No warranty
          </h2>
          <p>
            This site is provided &ldquo;as is&rdquo; without any warranty of
            any kind. We make no guarantees about uptime, data freshness, or
            fitness for any particular purpose. Use it at your own risk.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            External links
          </h2>
          <p>
            This site links to Tesla.com and other third-party websites. We are
            not responsible for the content or privacy practices of those sites.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Changes
          </h2>
          <p>
            We may update these terms at any time. Continued use of the site
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        {/* <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Contact
          </h2>
          <p>
            Questions can be sent to{" "}
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
