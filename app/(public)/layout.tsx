import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

const baseUrl = process.env.SITE_URL ?? "https://soonercharger.com";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Soonercharger",
  url: baseUrl,
  description:
    "Track every new Tesla Supercharger location worldwide — see construction progress, locations, and more as the network expands.",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <SiteHeader />
      {children}
      <Footer />
    </>
  );
}
