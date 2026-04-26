import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      {children}
      <Footer />
    </>
  );
}
