"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Heart, List, Map as MapIcon, SlidersHorizontal, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { LoginModal } from "@/components/login-modal";
import { PropertyCard } from "@/components/property-card";
import { listings, listingTypeLabels } from "@/lib/listings";
import { peso } from "@/lib/finance";
import { DEFAULT_FILTERS, filterRentals, paramsToSearch } from "@/lib/search";
import type { Furnishing, GenderPolicy, RentalFilters, RentalListing, RentalType } from "@/lib/types";

const PropertyMap = dynamic(() => import("@/components/property-map").then((module) => module.PropertyMap), { ssr: false, loading: () => <div className="map-shell" aria-label="Loading map" /> });
const amenities = ["Wi-Fi", "Air conditioning", "Kitchen", "Washer", "Security", "Elevator", "Gym", "Pool", "Study area", "Backup power", "Hot shower", "CCTV"];
const quickAmenities = ["Wi-Fi", "Washer", "Air conditioning", "Kitchen", "Pool", "Gym", "Security"];
const rentalTypes = Object.entries(listingTypeLabels) as [RentalType, string][];

export function PropertiesExplorer() {
  const params = useSearchParams();
  const search = useMemo(() => paramsToSearch(new URLSearchParams(params.toString())), [params]);
  const initialType = params.get("type");
  const [filters, setFilters] = useState<RentalFilters>({ ...DEFAULT_FILTERS, pets: search.pets > 0, types: initialType === "dorm" ? ["dorm", "bedspace"] : initialType === "home" ? ["condo", "apartment", "studio", "house"] : [] });
  const [draft, setDraft] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selected, setSelected] = useState<RentalListing | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => document.body.classList.remove("results-loading-active"), 420);
    return () => window.clearTimeout(timer);
  }, [params]);
  const selectedFromUrl = listings.find((listing) => listing.id === params.get("selected"));
  const filtered = useMemo(() => {
    const result = filterRentals(listings, search, filters);
    return [...result].sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.rating - a.rating);
  }, [search, filters]);
  const activeFilters = filters.types.length + filters.amenities.length + Number(filters.bedrooms > 0) + Number(filters.parking) + Number(filters.pets) + Number(filters.accessible) + Number(filters.maxPrice < 100000);
  const toggleType = (type: RentalType) => setDraft((current) => ({ ...current, types: current.types.includes(type) ? current.types.filter((item) => item !== type) : [...current.types, type] }));
  const toggleAmenity = (amenity: string) => setDraft((current) => ({ ...current, amenities: current.amenities.includes(amenity) ? current.amenities.filter((item) => item !== amenity) : [...current.amenities, amenity] }));
  const toggleQuickAmenity = (amenity: string) => setFilters((current) => ({ ...current, amenities: current.amenities.includes(amenity) ? current.amenities.filter((item) => item !== amenity) : [...current.amenities, amenity] }));
  const featured = selectedFromUrl && filtered.some((listing) => listing.id === selectedFromUrl.id) ? selectedFromUrl : filtered[0];
  const supporting = featured ? filtered.filter((listing) => listing.id !== featured.id) : filtered;
  return <div className={`results-page ${selectedFromUrl ? "featured-results-page" : ""}`} onClickCapture={(event) => { if ((event.target as Element).closest(".featured-heart")) setLoginOpen(true); }}>
    <div className="results-header"><div className="container quick-filters"><button type="button" className={`filter-button ${activeFilters ? "active" : ""}`} onClick={() => { setDraft(filters); setFiltersOpen(true); }}><SlidersHorizontal size={16} />Filters {activeFilters ? `(${activeFilters})` : ""}</button><span className="quick-filter-divider" aria-hidden="true" /><button type="button" className={`filter-button ${filters.pets ? "active" : ""}`} aria-pressed={filters.pets} onClick={() => setFilters((current) => ({ ...current, pets: !current.pets }))}>Allows pets</button>{quickAmenities.map((amenity) => <button type="button" className={`filter-button ${filters.amenities.includes(amenity) ? "active" : ""}`} aria-pressed={filters.amenities.includes(amenity)} onClick={() => toggleQuickAmenity(amenity)} key={amenity}>{amenity}</button>)}<button type="button" className={`filter-button ${filters.parking ? "active" : ""}`} aria-pressed={filters.parking} onClick={() => setFilters((current) => ({ ...current, parking: !current.parking }))}>Free parking</button></div></div>
    <div className={`results-layout ${mapVisible ? "map-visible" : ""}`}><section className="results-list"><div className="results-copy"><h1>{filtered.length} rental{filtered.length === 1 ? "" : "s"} in {search.destination}</h1><p>Prices shown monthly · {search.leaseMonths}-month lease · {search.adults + search.children} renter{search.adults + search.children === 1 ? "" : "s"}</p></div>{filtered.length ? <>{featured && selectedFromUrl && <article className="featured-result" onMouseEnter={() => setSelected(featured)} onMouseLeave={() => setSelected(null)}><Link href={`/properties/${featured.slug}`} className="featured-result-image"><Image src={featured.gallery[0]} alt={featured.title} fill sizes="360px" priority unoptimized /><span className="listing-badge">{featured.badge ?? "Featured rental"}</span></Link><div className="featured-result-copy"><button type="button" className="featured-heart" aria-label="Save rental"><Heart size={23} /></button><small>{listingTypeLabels[featured.type]} in {featured.city}</small><Link href={`/properties/${featured.slug}`}><h2>{featured.title}</h2></Link><p>{featured.neighborhood} · {featured.bedrooms} bedroom{featured.bedrooms === 1 ? "" : "s"} · {featured.beds} bed{featured.beds === 1 ? "" : "s"} · {featured.bathrooms} bath</p><span className="featured-availability">Available {new Date(featured.availableFrom).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span><div className="featured-price"><strong>{peso(featured.monthlyRent)}</strong> month <span>· <Star size={15} fill="currentColor" /> {featured.rating} ({featured.reviewCount})</span></div></div></article>}<div className="property-grid">{supporting.map((listing, index) => <PropertyCard listing={listing} key={listing.id} priority={!selectedFromUrl && index < 4} onHover={(id) => setSelected(listings.find((item) => item.id === id) ?? null)} />)}</div></> : <div className="empty-state"><h2>No rentals match those choices</h2><p>Try a nearby area, a higher price range, or fewer amenities.</p><button type="button" className="button primary" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</button></div>}</section><aside className="results-map"><PropertyMap listings={filtered} selectedId={selected?.id ?? featured?.id} onSelect={setSelected} /></aside></div>
    <button type="button" className="map-toggle" onClick={() => setMapVisible(!mapVisible)}>{mapVisible ? <List size={18} /> : <MapIcon size={18} />}{mapVisible ? "Show list" : "Show map"}</button>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" size="large" footer={<div className="filter-footer"><button type="button" className="button ghost" onClick={() => setDraft(DEFAULT_FILTERS)}>Clear all</button><button type="button" className="button primary" onClick={() => { setFilters(draft); setFiltersOpen(false); }}>Show {filterRentals(listings, search, draft).length} rentals</button></div>}>
      <div className="filter-sections"><section className="filter-section"><h3>Monthly price range</h3><div className="range-row"><label className="field-block"><span>Minimum</span><input type="number" value={draft.minPrice} onChange={(event) => setDraft({ ...draft, minPrice: Number(event.target.value) })} /></label><span>to</span><label className="field-block"><span>Maximum</span><input type="number" value={draft.maxPrice} onChange={(event) => setDraft({ ...draft, maxPrice: Number(event.target.value) })} /></label></div></section>
      <section className="filter-section"><h3>Property type</h3><div className="option-grid">{rentalTypes.map(([value, label]) => <button type="button" className={draft.types.includes(value) ? "active" : ""} key={value} onClick={() => toggleType(value)}>{label}</button>)}</div></section>
      <section className="filter-section"><h3>Rooms and beds</h3><div className="form-grid"><label className="field-block"><span>Bedrooms</span><select value={draft.bedrooms} onChange={(event) => setDraft({ ...draft, bedrooms: Number(event.target.value) })}>{[0,1,2,3,4].map((value) => <option value={value} key={value}>{value ? `${value}+` : "Any"}</option>)}</select></label><label className="field-block"><span>Beds</span><select value={draft.beds} onChange={(event) => setDraft({ ...draft, beds: Number(event.target.value) })}>{[0,1,2,3,4].map((value) => <option value={value} key={value}>{value ? `${value}+` : "Any"}</option>)}</select></label><label className="field-block"><span>Bathrooms</span><select value={draft.bathrooms} onChange={(event) => setDraft({ ...draft, bathrooms: Number(event.target.value) })}>{[0,1,2,3].map((value) => <option value={value} key={value}>{value ? `${value}+` : "Any"}</option>)}</select></label><label className="field-block"><span>Furnishing</span><select value={draft.furnishing} onChange={(event) => setDraft({ ...draft, furnishing: event.target.value as Furnishing | "any" })}><option value="any">Any</option><option value="fully furnished">Fully furnished</option><option value="semi-furnished">Semi-furnished</option><option value="unfurnished">Unfurnished</option></select></label></div></section>
      <section className="filter-section"><h3>Amenities</h3><div className="check-grid">{amenities.map((amenity) => <label key={amenity}><input type="checkbox" checked={draft.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />{amenity}</label>)}</div></section>
      <section className="filter-section"><h3>Features</h3><div className="option-grid"><button type="button" className={draft.parking ? "active" : ""} onClick={() => setDraft({ ...draft, parking: !draft.parking })}>Parking</button><button type="button" className={draft.pets ? "active" : ""} onClick={() => setDraft({ ...draft, pets: !draft.pets })}>Pets allowed</button><button type="button" className={draft.accessible ? "active" : ""} onClick={() => setDraft({ ...draft, accessible: !draft.accessible })}>Step-free access</button></div></section>
      <section className="filter-section"><h3>Dorm resident policy</h3><div className="option-grid">{(["any", "women only", "men only"] as (GenderPolicy | "any")[]).map((value) => <button type="button" className={draft.genderPolicy === value ? "active" : ""} onClick={() => setDraft({ ...draft, genderPolicy: value })} key={value}>{value === "any" ? "Any" : value}</button>)}</div></section></div>
    </Modal>
  </div>;
}
