"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";
import { Modal } from "@/components/modal";
import { peso } from "@/lib/finance";
import { listingTypeLabels } from "@/lib/listings";
import type { RentalListing } from "@/lib/types";

export function PropertyCard({ listing, priority = false, onHover }: { listing: RentalListing; priority?: boolean; onHover?: (id: string | null) => void }) {
  const { isSaved, toggleSaved, wishlists, createWishlist, showToast } = useApp();
  const [imageIndex, setImageIndex] = useState(0);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const saved = isSaved(listing.id);
  const save = () => { toggleSaved(listing.id); showToast(saved ? "Removed from wishlists" : "Saved to your wishlist"); setWishlistOpen(false); };
  return <article className="property-card" onMouseEnter={() => onHover?.(listing.id)} onMouseLeave={() => onHover?.(null)}>
    <div className="property-photo"><Link href={`/properties/${listing.slug}`} aria-label={`View ${listing.title}`}><Image src={listing.gallery[imageIndex]} alt={`${listing.title}, photo ${imageIndex + 1}`} fill sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 320px" priority={priority} unoptimized /></Link>
      {listing.badge && <span className="listing-badge">{listing.badge}</span>}
      <button type="button" className={`heart-button ${saved ? "saved" : ""}`} onClick={() => saved ? save() : setWishlistOpen(true)} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}><Heart size={23} fill={saved ? "currentColor" : "rgba(24,49,43,.25)"} /></button>
      {imageIndex > 0 && <button type="button" className="photo-arrow left" onClick={() => setImageIndex(imageIndex - 1)} aria-label="Previous photo"><ChevronLeft size={18} /></button>}
      {imageIndex < listing.gallery.length - 1 && <button type="button" className="photo-arrow right" onClick={() => setImageIndex(imageIndex + 1)} aria-label="Next photo"><ChevronRight size={18} /></button>}
      <div className="photo-dots" aria-hidden="true">{listing.gallery.map((_, index) => <span className={index === imageIndex ? "active" : ""} key={index} />)}</div>
    </div>
    <Link href={`/properties/${listing.slug}`} className="property-copy"><div className="property-topline"><strong>{listing.neighborhood}, {listing.city}</strong><span><Star size={13} fill="currentColor" />{listing.rating}</span></div><p>{listing.title}</p><small>{listingTypeLabels[listing.type]} · {listing.beds} bed{listing.beds === 1 ? "" : "s"} · {listing.bathrooms} bath</small><div className="property-price"><strong>{peso(listing.monthlyRent)}</strong> month</div></Link>
    <Modal open={wishlistOpen} onClose={() => setWishlistOpen(false)} title="Save to wishlist" size="small"><div className="wishlist-picker">{wishlists.map((list) => <button key={list.id} type="button" onClick={() => { toggleSaved(listing.id, list.name); setWishlistOpen(false); showToast(`Saved to ${list.name}`); }}><span className="wishlist-thumb"><Image src={listing.gallery[0]} alt="" fill unoptimized /></span><span><strong>{list.name}</strong><small>{list.listingIds.length} saved</small></span></button>)}<label className="field-block"><span>Create a new wishlist</span><div className="inline-field"><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Weekend shortlist" /><button type="button" className="button secondary" disabled={!newName.trim()} onClick={() => { createWishlist(newName.trim(), listing.id); setWishlistOpen(false); showToast(`Created ${newName.trim()}`); }}>Create</button></div></label>{wishlists.length === 0 && <button type="button" className="button primary wide" onClick={save}>Save to My favorite rentals</button>}</div></Modal>
  </article>;
}
