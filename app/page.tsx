"use client";

import Link from "next/link";
import { ArrowRight, Compass, Eye, SlidersHorizontal } from "lucide-react";
import { ScrollJourney } from "@/components/scroll-journey";
import { PropertyCard } from "@/components/property-card";
import { useApp } from "./app-provider";
import { listings } from "@/lib/listings";

export default function Home() {
  const { t } = useApp();
  return (
    <>
      <ScrollJourney />
      <section id="start-options" className="section start-options">
        <div className="section-heading centered"><span className="eyebrow">Two clear paths</span><h2>{t("home.choose.title")}</h2></div>
        <div className="choice-grid">
          <Link href="/guide" className="choice-card guide-choice"><div className="choice-icon"><Compass /></div><span className="eyebrow">Guide me</span><h3>{t("home.choose.guide")}</h3><p>Answer six short questions. Kubo shows what each answer changes.</p><span className="text-link">Start the guide <ArrowRight size={17} /></span></Link>
          <Link href="/properties" className="choice-card"><div className="choice-icon"><SlidersHorizontal /></div><span className="eyebrow">Search myself</span><h3>{t("home.choose.search")}</h3><p>Use filters, view the map, save homes, and compare up to three.</p><span className="text-link">Browse all 48 <ArrowRight size={17} /></span></Link>
        </div>
      </section>
      <section className="section transparency-panel">
        <div className="transparency-icon"><Eye /></div>
        <div><span className="eyebrow">Transparent by default</span><h2>{t("home.transparency")}</h2><p>{t("home.transparency.body")}</p></div>
        <Link href="/guide" className="button light">See how it works</Link>
      </section>
      <section className="section featured-section">
        <div className="section-heading"><div><span className="eyebrow">Featured homes</span><h2>{t("home.featured")}</h2></div><Link href="/properties" className="text-link">View all 48 <ArrowRight size={17} /></Link></div>
        <div className="property-grid">{listings.slice(0, 3).map((listing, index) => <PropertyCard key={listing.id} listing={listing} priority={index === 0} />)}</div>
      </section>
      <section className="section trust-callout">
        <div><span className="eyebrow">Help, not a final answer</span><h2>Kubo helps you ask what matters.</h2><p>Property checks show what proof to ask for. They are not government approval.</p></div>
        <Link href="/learn" className="button secondary">Open the buyer guide</Link>
      </section>
    </>
  );
}
