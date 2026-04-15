import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://soonercharger.com"),
  title: {
    default: "Soonercharger",
    template: "%s | Soonercharger",
  },
  description: "Track the expansion of the worlds' biggest charging network",
  openGraph: {
    type: "website",
    siteName: "Soonercharger",
  },
  twitter: {
    card: "summary",
  },
  themeColor: "#ff9500",
};

const baseUrl = process.env.SITE_URL ?? "https://soonercharger.com";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Soonercharger",
  url: baseUrl,
  description: "Track the expansion of the worlds' biggest charging network",
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
      </body>
    </html>
  );
}
