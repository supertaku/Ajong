"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, Building2, ExternalLink, FileSearch, Landmark, Scale, ShieldCheck } from "lucide-react";
import { useApp } from "@/app/app-provider";

const glossary = [
  ["Total purchase price", "The stated price of the property. It may not include taxes, transfer costs, loan charges, association dues, insurance, or other fees."],
  ["Down payment", "The cash portion paid before or alongside financing. Required amounts and schedules differ by seller and lender."],
  ["Monthly amortization", "A recurring loan payment estimate. Always ask what it includes and what remains separate."],
  ["Contract to Sell", "A contract that sets conditions before ownership is transferred. Read the full document and fine print with qualified help."],
  ["License to Sell", "For covered subdivision and condominium projects, a DHSUD authorization that buyers should ask to validate."],
  ["Certified True Copy of Title", "An official copy used for due diligence and other legal purposes, obtainable through the Registry of Deeds or LRA eSerbisyo."],
  ["Authority to sell", "Evidence that the person advertising the property is permitted by the owner to do so."],
  ["Association dues", "Recurring fees for shared services and common areas, often separate from a housing loan payment."],
];

export default function LearnPage() {
  const { t } = useApp();
  return (
    <div className="learn-page page-shell">
      <header className="page-hero learn-hero"><div><span className="eyebrow">{t("learn.eyebrow")}</span><h1>{t("learn.title")}</h1><p>{t("learn.body")}</p><Link href="/guide" className="button primary">Start the guided search <ArrowRight size={18} /></Link></div><Image src="/images/kubo-mascot.png" alt="Kubo, the friendly home guide" width={300} height={300} priority unoptimized /></header>
      <section className="official-source-section"><div className="section-heading"><div><span className="eyebrow">Official starting points</span><h2>A badge is a reminder to check. It is not proof.</h2></div></div><div className="official-card-grid"><a href="https://dhsud.gov.ph/buyers-awareness-rights-and-general-remedies-hred-faqs/" target="_blank" rel="noreferrer"><Building2 /><span>DHSUD</span><h3>Check a housing project</h3><p>Learn what to ask about a subdivision or condo project, including its registration and License to Sell.</p><strong>Open DHSUD guidance <ExternalLink size={15} /></strong></a><a href="https://verification.prc.gov.ph/" target="_blank" rel="noreferrer"><BadgeCheck /><span>PRC</span><h3>Check a professional</h3><p>Search official PRC records. Do not trust a website badge by itself.</p><strong>Open PRC verification <ExternalLink size={15} /></strong></a><a href="https://lra.gov.ph/frequently-asked-questions/" target="_blank" rel="noreferrer"><Landmark /><span>LRA</span><h3>Check title documents</h3><p>Learn why buyers ask for a Certified True Copy of the title and how to request one.</p><strong>Open LRA guidance <ExternalLink size={15} /></strong></a></div></section>
      <section className="learning-section"><div className="section-heading"><div><span className="eyebrow">Plain-language glossary</span><h2>Pause on any word you cannot explain.</h2></div></div><div className="glossary-grid">{glossary.map(([term, definition]) => <details key={term}><summary><span>{term}</span><b>+</b></summary><p>{definition}</p></details>)}</div></section>
      <section className="buyer-path"><div className="section-heading"><div><span className="eyebrow">Four safer steps</span><h2>Finding a home is only the first step.</h2></div></div><ol><li><span><BookOpen /></span><div><strong>1. Know what feels safe</strong><p>Use estimates to ask questions. They do not promise that you will get a loan.</p></div></li><li><span><FileSearch /></span><div><strong>2. Compare the full cost</strong><p>Look at price, travel, space, timing, monthly fees, and trade-offs together.</p></div></li><li><span><ShieldCheck /></span><div><strong>3. Check people and papers</strong><p>Use official records and licensed professionals. A website badge is not enough.</p></div></li><li><span><Scale /></span><div><strong>4. Read before you pay</strong><p>Understand the contract, payment dates, extra fees, and what happens if there is a problem.</p></div></li></ol></section>
      <section className="warning-band"><div><span className="eyebrow">What Kubo cannot do</span><h2>Kubo cannot replace a broker, lawyer, lender, appraiser, inspector, or government office.</h2><p>This guide helps you see what is still unknown. It does not give financial, legal, investment, title, or verification services.</p></div></section>
    </div>
  );
}
