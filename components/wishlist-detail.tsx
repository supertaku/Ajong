"use client";

import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { useApp } from "@/app/app-provider";
import { listings } from "@/lib/listings";

export function WishlistDetail({ id }: { id: string }) { const { wishlists } = useApp(); const wishlist = wishlists.find((item) => item.id === id); if (!wishlist) return <div className="empty-state"><h1>Wishlist not found</h1><Link className="button primary" href="/wishlists">Back to wishlists</Link></div>; const saved = wishlist.listingIds.map((listingId) => listings.find((item) => item.id === listingId)).filter(Boolean); return <div className="container"><div className="page-title"><h1>{wishlist.name}</h1><p>{saved.length} saved rental{saved.length === 1 ? "" : "s"}</p></div><div className="property-grid">{saved.map((listing) => <PropertyCard key={listing!.id} listing={listing!} />)}</div></div>; }
