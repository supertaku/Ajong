"use client";

import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Calculator, CarFront, CheckCircle2, ExternalLink, Heart, Info, Ruler, Scale, ShieldCheck, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/app/app-provider";
import { estimatedMonthlyPayment, peso } from "@/lib/finance";
import { scoreListing } from "@/lib/matching";
import type { EvidenceStatus, Listing } from "@/lib/types";

const statusText: Record<EvidenceStatus, { label: string; className: string }> = {
  "demo-checked": { label: "Evidence supplied", className: "status-present" },
  "needs-review": { label: "Needs human review", className: "status-review" },
  "not-provided": { label: "Not provided", className: "status-missing" },
};

export function PropertyDetail({ listing }: { listing: Listing }) {
  const { guideAnswers, favorites, toggleFavorite, compare, toggleCompare } = useApp();
  const [downPayment, setDownPayment] = useState(20);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);
  const payment = estimatedMonthlyPayment(listing.price, downPayment, rate, years);
  const score = useMemo(() => scoreListing(listing, guideAnswers), [listing, guideAnswers]);
  const saved = favorites.includes(listing.id);
  const compared = compare.includes(listing.id);
  const evidence = [
    { label: "Seller identity", value: listing.verification.identity },
    { label: "Authority to sell", value: listing.verification.authorityToSell },
    { label: "Professional credential", value: listing.verification.professionalCredential },
    { label: "Project license, if applicable", value: listing.verification.projectLicense },
  ];
  return (
    <div className="property-detail page-shell">
      <div className="detail-breadcrumb"><Link href="/properties">← All homes</Link><span>/</span><span>{listing.city}</span></div>
      <section className="detail-hero">
        <div className="detail-image"><Image src={listing.image} alt={`Illustrated fictional ${listing.propertyType} in ${listing.city}`} fill priority sizes="(max-width: 900px) 100vw, 60vw" unoptimized /><span className="demo-pill">Demo property · not for sale</span></div>
        <div className="detail-summary">
          <span className="eyebrow">{listing.city} · {listing.areaGroup}</span><h1>{listing.title}</h1><div className="detail-price">{peso(listing.price)}</div>
          <div className="detail-specs"><span><BedDouble />{listing.bedrooms}<small>bedrooms</small></span><span><Bath />{listing.bathrooms}<small>bathrooms</small></span><span><Ruler />{listing.floorArea}<small>sqm floor</small></span><span><CarFront />{listing.parking}<small>parking</small></span></div>
          <p>{listing.description}</p>
          <div className="detail-actions"><button type="button" className={`button ${saved ? "primary" : "secondary"}`} onClick={() => toggleFavorite(listing.id)}><Heart size={18} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save home"}</button><button type="button" className={`button secondary ${compared ? "active" : ""}`} disabled={!compared && compare.length >= 3} onClick={() => toggleCompare(listing.id)}><Scale size={18} />{compared ? "In comparison" : "Compare"}</button></div>
          <div className="seller-line"><ShieldCheck size={18} /><span><strong>{listing.seller.name}</strong><small>{listing.seller.role.replaceAll("-", " ")}</small></span></div>
        </div>
      </section>

      <div className="detail-columns">
        <div className="detail-main">
          <section className="content-card"><span className="eyebrow">Based on your saved guide answers</span><div className="fit-heading"><h2>{score.total}/100 fit</h2><span>Not a quality or investment score</span></div><div className="score-bars">{([ ["Location & commute", score.location, 30], ["Budget comfort", score.budget, 25], ["Usable space", score.space, 15], ["Move-in timing", score.timing, 10], ["Parking & access", score.parkingAccessibility, 10], ["Family priorities", score.priorities, 10] ] as [string, number, number][]).map(([label, value, max]) => <div key={label}><span>{label}<b>{value}/{max}</b></span><div><i style={{ width: `${value / max * 100}%` }} /></div></div>)}</div><ul className="reason-list">{score.reasons.map((reason) => <li key={reason}><CheckCircle2 size={16} />{reason}</li>)}</ul></section>
          <section className="content-card"><span className="eyebrow">Evidence explainer</span><h2>What these evidence statuses mean</h2><p className="card-intro">See what was supplied and what still needs human review. Always confirm important records with official sources.</p><div className="evidence-list">{evidence.map((item) => <div key={item.label}><span>{item.label}</span><b className={statusText[item.value].className}>{statusText[item.value].label}</b></div>)}</div><div className="warning-note"><TriangleAlert size={18} /><p>{listing.verification.note}</p></div></section>
          <section className="content-card"><span className="eyebrow">Before you commit</span><h2>A practical buyer checklist</h2><ol className="buyer-checklist"><li>Visit the actual site and confirm the location and specifications.</li><li>Ask who owns the property and who is legally authorized to sell it.</li><li>For covered projects, ask for DHSUD registration and License to Sell details.</li><li>Verify a broker or salesperson through the PRC—not a profile badge alone.</li><li>Request a Certified True Copy of the title and involve qualified legal help.</li><li>Read the full contract, payment schedule, fees, dues, taxes and fine print.</li></ol><div className="official-links"><a href="https://dhsud.gov.ph/buyers-awareness-rights-and-general-remedies-hred-faqs/" target="_blank" rel="noreferrer">DHSUD buyer guidance <ExternalLink size={14} /></a><a href="https://verification.prc.gov.ph/" target="_blank" rel="noreferrer">PRC verification <ExternalLink size={14} /></a><a href="https://lra.gov.ph/frequently-asked-questions/" target="_blank" rel="noreferrer">LRA title guidance <ExternalLink size={14} /></a></div></section>
        </div>
        <aside className="calculator-card"><div className="calculator-title"><Calculator /><div><span className="eyebrow">Illustrative only</span><h2>Monthly estimate</h2></div></div><div className="payment-result"><strong>{peso(payment)}</strong><span>per month, principal and interest only</span></div><label>Down payment<input type="range" min={5} max={50} step={5} value={downPayment} onChange={(event) => setDownPayment(Number(event.target.value))} /><span>{downPayment}% · {peso(listing.price * downPayment / 100)}</span></label><label>Annual interest assumption<div className="number-suffix"><input type="number" min={0} max={20} step={0.25} value={rate} onChange={(event) => setRate(Number(event.target.value))} /><span>%</span></div></label><label>Loan term<select value={years} onChange={(event) => setYears(Number(event.target.value))}><option value={10}>10 years</option><option value={15}>15 years</option><option value={20}>20 years</option><option value={25}>25 years</option><option value={30}>30 years</option></select></label>{listing.monthlyDues && <div className="dues-note">Association dues: {peso(listing.monthlyDues)}/month</div>}<div className="assumption-box compact"><Info size={17} /><p>Not a lender quote. Excludes taxes, insurance, transaction costs and any unlisted dues.</p></div><button type="button" className="button primary wide" onClick={() => window.alert("Information requests are not available yet.")}>Request information</button></aside>
      </div>
    </div>
  );
}
