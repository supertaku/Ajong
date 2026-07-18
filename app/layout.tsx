import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AppProvider } from "./app-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "Kubo · A home that fits your family", template: "%s · Kubo" },
  description: "A bilingual, transparent home search experience for families in Greater Manila.",
  openGraph: {
    title: "Kubo · A home that fits your family",
    description: "Clear, family-first home search across Greater Manila.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kubo private real-estate concept for families" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: {
    icon: "/images/kubo-mascot.png",
    shortcut: "/images/kubo-mascot.png",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f7f2e8" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </AppProvider>
      </body>
    </html>
  );
}
