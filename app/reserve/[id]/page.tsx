import { Suspense } from "react";
import { ReservationCheckout } from "@/components/reservation-checkout";
import { getListing, listings } from "@/lib/listings";

export const generateStaticParams = () => listings.map((listing) => ({ id: listing.slug }));
export default async function ReservePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const listing = getListing(id); if (!listing) return <div className="empty-state"><h1>Rental not found</h1></div>; return <Suspense fallback={<div className="container page-title"><h1>Preparing your reservation</h1></div>}><ReservationCheckout listing={listing} /></Suspense>; }
