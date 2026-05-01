import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
const cloudflareAnalyticsToken =
  process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;

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
};

export const viewport: Viewport = {
  themeColor: "#0a0c14",
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
      <body className="min-h-full flex flex-col overflow-x-clip">
        {children}
        {cloudflareAnalyticsToken ? (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={`{"token":"${cloudflareAnalyticsToken}","spa":true}`}
          />
        ) : null}
      </body>
    </html>
  );
}
