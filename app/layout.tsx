import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { AppProvider } from "./app-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewTabNavigation } from "@/components/new-tab-navigation";
import { ChatProvider } from "./chat-provider";
import { ChatDock } from "@/components/chat-dock";

export const metadata: Metadata = {
  title: { default: "Kubo | Find your next home in Metro Manila", template: "%s | Kubo" },
  description: "Long-term homes, condos, apartments, dorms, and bedspaces across Metro Manila.",
  openGraph: { title: "Kubo | Metro Manila rentals", description: "Find a place that fits your life.", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kubo Metro Manila rental marketplace" }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/images/kubo-mascot.png", shortcut: "/images/kubo-mascot.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#fffdf8" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppProvider><ChatProvider><NewTabNavigation /><Suspense fallback={null}><SiteHeader /></Suspense><main id="main-content">{children}</main><SiteFooter /><ChatDock /></ChatProvider></AppProvider></body></html>;
}
