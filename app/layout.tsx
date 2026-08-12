import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AppProvider } from "./app-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "Kubo | Find your next home in Metro Manila", template: "%s | Kubo" },
  description: "Long-term homes, condos, apartments, dorms, and bedspaces across Metro Manila.",
  openGraph: { title: "Kubo | Metro Manila rentals", description: "Find a place that fits your life.", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kubo Metro Manila rental marketplace" }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/images/kubo-mascot.png", shortcut: "/images/kubo-mascot.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#fffdf8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppProvider><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></AppProvider></body></html>;
}
