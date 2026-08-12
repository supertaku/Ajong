"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PropertyCard } from "@/components/property-card";
import type { RentalListing } from "@/lib/types";

export function HomeCollection({ title, body, items, priority = false }: { title: string; body: string; items: RentalListing[]; priority?: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateControls = () => {
    const row = rowRef.current;
    if (!row) return;
    setCanBack(row.scrollLeft > 2);
    setCanNext(row.scrollLeft + row.clientWidth < row.scrollWidth - 2);
  };

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const resize = new ResizeObserver(updateControls);
    resize.observe(row);
    updateControls();
    return () => resize.disconnect();
  }, []);

  const move = (direction: -1 | 1) => rowRef.current?.scrollBy({ left: direction * rowRef.current.clientWidth * 0.86, behavior: "smooth" });

  return <section className="page-section"><div className="container">
    <div className="section-heading">
      <div><div className="section-title-row"><h2>{title}</h2><Link className="show-all-arrow" href="/properties" aria-label={`Show all ${title}`}><ArrowRight size={17} /></Link></div><p>{body}</p></div>
      <div className="carousel-controls" aria-label={`${title} carousel controls`}><button type="button" onClick={() => move(-1)} disabled={!canBack} aria-label="Previous listings"><ChevronLeft size={18} /></button><button type="button" onClick={() => move(1)} disabled={!canNext} aria-label="Next listings"><ChevronRight size={18} /></button></div>
    </div>
    <div className="rental-row" ref={rowRef} onScroll={updateControls}>{items.map((listing, index) => <PropertyCard key={listing.id} listing={listing} priority={priority && index < 7} discoveryLink />)}</div>
  </div></section>;
}
