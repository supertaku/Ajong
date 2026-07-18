"use client";

import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Heart, Ruler, Scale, SquareParking } from "lucide-react";
import { useApp } from "@/app/app-provider";
import { compactPeso } from "@/lib/finance";
import type { Listing } from "@/lib/types";

export function PropertyCard({ listing, score, priority = false }: { listing: Listing; score?: number; priority?: boolean }) {
  const { favorites, toggleFavorite, compare, toggleCompare, t } = useApp();
  const saved = favorites.includes(listing.id);
  const compared = compare.includes(listing.id);
  return (
    <article className="property-card">
      <div className="property-image-wrap">
        <Image src={listing.image} alt={`Illustrated fictional ${listing.propertyType} in ${listing.city}`} fill sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 360px" className="property-image" priority={priority} unoptimized />
        <span className="demo-pill">{t("listing.demo")}</span>
        {score !== undefined && <span className="fit-pill"><strong>{score}</strong>/100 {t("listing.score")}</span>}
        <button type="button" className={`icon-action ${saved ? "active" : ""}`} onClick={() => toggleFavorite(listing.id)} aria-label={saved ? `Remove ${listing.title} from saved homes` : `Save ${listing.title}`} aria-pressed={saved}><Heart size={19} fill={saved ? "currentColor" : "none"} /></button>
      </div>
      <div className="property-card-body">
        <div className="property-location">{listing.city} · {listing.areaGroup}</div>
        <h3>{listing.title}</h3>
        <div className="property-price">{compactPeso(listing.price)}</div>
        <div className="property-specs" aria-label="Property details">
          <span><BedDouble size={16} />{listing.bedrooms}</span><span><Bath size={16} />{listing.bathrooms}</span><span><Ruler size={16} />{listing.floorArea} sqm</span><span><SquareParking size={16} />{listing.parking}</span>
        </div>
        <div className="property-card-actions">
          <Link className="text-link" href={`/properties/${listing.id}`}>{t("listing.view")} <span aria-hidden>→</span></Link>
          <button type="button" className={`compare-button ${compared ? "active" : ""}`} onClick={() => toggleCompare(listing.id)} disabled={!compared && compare.length >= 3}><Scale size={16} />{t("listing.compare")}</button>
        </div>
      </div>
    </article>
  );
}
