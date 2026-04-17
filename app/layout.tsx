import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.SITE_URL ?? "https://soonercharger.com";

const siteDescription =
  "Track every new Tesla Supercharger location worldwide — see construction progress, locations, and more as the network expands.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Soonercharger – Tesla Supercharger Expansion Tracker",
    template: "%s | Soonercharger",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName: "Soonercharger",
  },
  twitter: {
    card: "summary_large_image",
  },
  themeColor: "#ff9500",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Soonercharger",
  url: baseUrl,
  description: siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
