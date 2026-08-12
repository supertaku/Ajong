import type { Metadata } from "next";
import Link from "next/link";
import { PropertyDetail } from "@/components/property-detail";
import { getListing, listings } from "@/lib/listings";

export const generateStaticParams = () => listings.map((listing) => ({ id: listing.slug }));
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; const listing = getListing(id); return { title: listing?.title ?? "Rental", description: listing?.description }; }
export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const listing = getListing(id); if (!listing) return <div className="empty-state"><h1>Rental not found</h1><Link className="button primary" href="/properties">Explore rentals</Link></div>; return <PropertyDetail listing={listing} />; }
