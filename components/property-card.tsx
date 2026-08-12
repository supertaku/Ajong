"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";
import { LoginModal } from "@/components/login-modal";
import { peso } from "@/lib/finance";
import { listingTypeLabels } from "@/lib/listings";
import type { RentalListing } from "@/lib/types";

export function PropertyCard({ listing, priority = false, onHover, discoveryLink = false }: { listing: RentalListing; priority?: boolean; onHover?: (id: string | null) => void; discoveryLink?: boolean }) {
  const { isSaved } = useApp();
  const [imageIndex, setImageIndex] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const saved = isSaved(listing.id);
  const href = discoveryLink ? `/properties?where=${encodeURIComponent(listing.city)}&selected=${listing.id}` : `/properties/${listing.slug}`;
  return <article className="property-card" onMouseEnter={() => onHover?.(listing.id)} onMouseLeave={() => onHover?.(null)}>
    <div className="property-photo"><Link href={href} aria-label={`View ${listing.title}`}><Image src={listing.gallery[imageIndex]} alt={`${listing.title}, photo ${imageIndex + 1}`} fill sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 320px" priority={priority} unoptimized /></Link>
      {listing.badge && <span className="listing-badge">{listing.badge}</span>}
      <button type="button" className={`heart-button ${saved ? "saved" : ""}`} onClick={() => setLoginOpen(true)} aria-label="Save to wishlist"><Heart size={23} fill={saved ? "currentColor" : "rgba(24,49,43,.25)"} /></button>
      {imageIndex > 0 && <button type="button" className="photo-arrow left" onClick={() => setImageIndex(imageIndex - 1)} aria-label="Previous photo"><ChevronLeft size={18} /></button>}
      {imageIndex < listing.gallery.length - 1 && <button type="button" className="photo-arrow right" onClick={() => setImageIndex(imageIndex + 1)} aria-label="Next photo"><ChevronRight size={18} /></button>}
      <div className="photo-dots" aria-hidden="true">{listing.gallery.map((_, index) => <span className={index === imageIndex ? "active" : ""} key={index} />)}</div>
    </div>
    <Link href={href} className="property-copy"><div className="property-topline"><strong>{listing.neighborhood}, {listing.city}</strong><span><Star size={13} fill="currentColor" />{listing.rating}</span></div><p>{listing.title}</p><small>{listingTypeLabels[listing.type]} · {listing.beds} bed{listing.beds === 1 ? "" : "s"} · {listing.bathrooms} bath</small><div className="property-price"><strong>{peso(listing.monthlyRent)}</strong> month</div></Link>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
  </article>;
}
