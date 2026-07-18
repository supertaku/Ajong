import type { Metadata } from "next";
import Link from "next/link";
import { PropertyDetail } from "@/components/property-detail";
import { getListing, listings } from "@/lib/listings";

export const generateStaticParams = () => listings.map((listing) => ({ id: listing.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = getListing(id);
  return { title: listing?.title ?? "Property", description: listing?.description };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) return <div className="page-shell empty-state"><h1>Property not found</h1><Link href="/properties">Return to search</Link></div>;
  return <PropertyDetail listing={listing} />;
}
