"use client";

import dynamic from "next/dynamic";
import { List, Map as MapIcon, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { PropertyCard } from "@/components/property-card";
import { SearchBar } from "@/components/search-bar";
import { listings, listingTypeLabels } from "@/lib/listings";
import { DEFAULT_FILTERS, filterRentals, paramsToSearch } from "@/lib/search";
import type { Furnishing, GenderPolicy, RentalFilters, RentalListing, RentalType } from "@/lib/types";

const PropertyMap = dynamic(() => import("@/components/property-map").then((module) => module.PropertyMap), { ssr: false, loading: () => <div className="map-shell" aria-label="Loading map" /> });
const amenities = ["Wi-Fi", "Air conditioning", "Kitchen", "Washer", "Security", "Elevator", "Gym", "Pool", "Study area", "Backup power", "Hot shower", "CCTV"];
const rentalTypes = Object.entries(listingTypeLabels) as [RentalType, string][];

export function PropertiesExplorer() {
  const params = useSearchParams();
  const search = useMemo(() => paramsToSearch(new URLSearchParams(params.toString())), [params]);
  const initialType = params.get("type");
  const [filters, setFilters] = useState<RentalFilters>({ ...DEFAULT_FILTERS, types: initialType === "dorm" ? ["dorm", "bedspace"] : initialType === "home" ? ["condo", "apartment", "studio", "house"] : [] });
  const [draft, setDraft] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [selected, setSelected] = useState<RentalListing | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const filtered = useMemo(() => {
    const result = filterRentals(listings, search, filters);
    return [...result].sort((a, b) => sort === "price-low" ? a.monthlyRent - b.monthlyRent : sort === "price-high" ? b.monthlyRent - a.monthlyRent : sort === "rating" ? b.rating - a.rating : (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.rating - a.rating);
  }, [search, filters, sort]);
  const activeFilters = filters.types.length + filters.amenities.length + Number(filters.bedrooms > 0) + Number(filters.parking) + Number(filters.pets) + Number(filters.accessible) + Number(filters.maxPrice < 100000);
  const toggleType = (type: RentalType) => setDraft((current) => ({ ...current, types: current.types.includes(type) ? current.types.filter((item) => item !== type) : [...current.types, type] }));
  const toggleAmenity = (amenity: string) => setDraft((current) => ({ ...current, amenities: current.amenities.includes(amenity) ? current.amenities.filter((item) => item !== amenity) : [...current.amenities, amenity] }));
  return <div className="results-page">
    <div className="results-header"><div className="container"><div className="results-search"><SearchBar compact initial={search} /></div></div><div className="container quick-filters"><button type="button" className={`filter-button ${activeFilters ? "active" : ""}`} onClick={() => { setDraft(filters); setFiltersOpen(true); }}><SlidersHorizontal size={16} />Filters {activeFilters ? `(${activeFilters})` : ""}</button><button type="button" className="filter-button" onClick={() => setFilters({ ...filters, types: ["condo"] })}>Condos</button><button type="button" className="filter-button" onClick={() => setFilters({ ...filters, types: ["dorm", "bedspace"] })}>Student housing</button><button type="button" className={`filter-button ${filters.pets ? "active" : ""}`} onClick={() => setFilters({ ...filters, pets: !filters.pets })}>Pets allowed</button><button type="button" className={`filter-button ${filters.parking ? "active" : ""}`} onClick={() => setFilters({ ...filters, parking: !filters.parking })}>Parking</button><select className="filter-button" aria-label="Sort rentals" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Lowest price</option><option value="price-high">Highest price</option><option value="rating">Top rated</option></select></div></div>
    <div className={`results-layout ${mapVisible ? "map-visible" : ""}`}><section className="results-list"><div className="results-copy"><h1>{search.destination === "Metro Manila" ? "Places to rent in Metro Manila" : `Places to rent near ${search.destination}`}</h1><p>{filtered.length} homes · {search.leaseMonths}-month lease · {search.adults + search.children} renter{search.adults + search.children === 1 ? "" : "s"}</p></div>{filtered.length ? <div className="property-grid">{filtered.map((listing, index) => <PropertyCard listing={listing} key={listing.id} priority={index < 4} onHover={(id) => setSelected(listings.find((item) => item.id === id) ?? null)} />)}</div> : <div className="empty-state"><h2>No rentals match those choices</h2><p>Try a nearby area, a higher price range, or fewer amenities.</p><button type="button" className="button primary" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</button></div>}</section><aside className="results-map"><PropertyMap listings={filtered} selectedId={selected?.id} onSelect={setSelected} />{selected && <div className="map-card"><PropertyCard listing={selected} /></div>}</aside></div>
    <button type="button" className="map-toggle" onClick={() => setMapVisible(!mapVisible)}>{mapVisible ? <List size={18} /> : <MapIcon size={18} />}{mapVisible ? "Show list" : "Show map"}</button>
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
