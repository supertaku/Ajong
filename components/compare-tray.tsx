"use client";

import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";
import { compactPeso } from "@/lib/finance";
import { listings } from "@/lib/listings";

export function CompareTray() {
  const { compare, toggleCompare, t } = useApp();
  const [open, setOpen] = useState(false);
  const selected = compare.map((id) => listings.find((listing) => listing.id === id)).filter(Boolean);
  if (!selected.length) return null;
  return (
    <>
      <button type="button" className="compare-tray" onClick={() => setOpen(true)}><Scale size={18} />{t("listing.compare")} ({selected.length}/3)</button>
      {open && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="dialog-heading"><div><span className="eyebrow">Side by side</span><h2 id="compare-title">Compare homes</h2></div><button type="button" className="close-button" onClick={() => setOpen(false)} aria-label="Close comparison"><X /></button></div>
            <div className="compare-grid">
              {selected.map((listing) => listing && (
                <article key={listing.id}>
                  <button type="button" className="remove-compare" onClick={() => toggleCompare(listing.id)} aria-label={`Remove ${listing.title}`}><X size={15} /></button>
                  <h3>{listing.title}</h3><strong>{compactPeso(listing.price)}</strong>
                  <dl><div><dt>Bedrooms</dt><dd>{listing.bedrooms}</dd></div><div><dt>Floor area</dt><dd>{listing.floorArea} sqm</dd></div><div><dt>Parking</dt><dd>{listing.parking}</dd></div><div><dt>Move-in</dt><dd>{listing.moveIn}</dd></div></dl>
                  <Link href={`/properties/${listing.id}`}>View details →</Link>
                </article>
              ))}
            </div>
            <p className="fine-print">Comparison highlights differences but does not represent quality, investment value, or legal due diligence.</p>
          </section>
        </div>
      )}
    </>
  );
}
