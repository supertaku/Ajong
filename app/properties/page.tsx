"use client";

import dynamic from "next/dynamic";
import { List, Map, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "@/app/app-provider";
import { CompareTray } from "@/components/compare-tray";
import { FilterCheckbox } from "@/components/filter-checkbox";
import { PropertyCard } from "@/components/property-card";
import { listings } from "@/lib/listings";
import type { AreaGroup, PropertyType, SearchFilters } from "@/lib/types";

const PropertyMap = dynamic(() => import("@/components/property-map").then((module) => module.PropertyMap), { ssr: false, loading: () => <div className="map-loading">Preparing the map…</div> });
const areaOptions: AreaGroup[] = ["Metro Manila", "Rizal", "Cavite", "Laguna", "Bulacan"];
const typeOptions: { value: PropertyType; label: string }[] = [{ value: "condo", label: "Condo" }, { value: "townhouse", label: "Townhouse" }, { value: "house", label: "House" }];
const EMPTY_FILTERS: SearchFilters = { areas: [], propertyTypes: [], maxPrice: null, minBedrooms: 0 };

export default function PropertiesPage() {
  const { t } = useApp();
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState("recommended");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const toggle = <T,>(values: T[], value: T) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  const filtered = useMemo(() => {
    const result = listings.filter((listing) =>
      (!filters.areas.length || filters.areas.includes(listing.areaGroup)) &&
      (!filters.propertyTypes.length || filters.propertyTypes.includes(listing.propertyType)) &&
      (!filters.maxPrice || listing.price <= filters.maxPrice) &&
      listing.bedrooms >= filters.minBedrooms,
    );
    return [...result].sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "space" ? b.floorArea - a.floorArea : a.city.localeCompare(b.city));
  }, [filters, sort]);
  const activeCount = filters.areas.length + filters.propertyTypes.length + (filters.maxPrice ? 1 : 0) + (filters.minBedrooms ? 1 : 0);

  return (
    <div className="search-page">
      <header className="page-hero search-hero page-shell"><div><span className="eyebrow">{t("search.eyebrow")}</span><h1>{t("search.title")}</h1><p>{t("search.body")}</p></div><div className="result-count"><strong>{filtered.length}</strong><span>of 48 {t("search.results")}</span></div></header>
      <div className="search-toolbar page-shell">
        <button type="button" className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><SlidersHorizontal size={17} />{t("search.filters")}{activeCount > 0 && <b>{activeCount}</b>}</button>
        <div className="mobile-view-toggle"><button type="button" className={mobileView === "list" ? "active" : ""} onClick={() => setMobileView("list")}><List size={16} />{t("search.list")}</button><button type="button" className={mobileView === "map" ? "active" : ""} onClick={() => setMobileView("map")}><Map size={16} />{t("search.map")}</button></div>
        <label className="sort-field">{t("search.sort")}<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">City A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="space">Largest floor area</option></select></label>
      </div>
      {filtersOpen && <section className="filter-panel page-shell" aria-label="Property filters"><fieldset><legend>Area</legend>{areaOptions.map((area) => <FilterCheckbox key={area} label={area} checked={filters.areas.includes(area)} onChange={() => setFilters((current) => ({ ...current, areas: toggle(current.areas, area) }))} />)}</fieldset><fieldset><legend>Home type</legend>{typeOptions.map((type) => <FilterCheckbox key={type.value} label={type.label} checked={filters.propertyTypes.includes(type.value)} onChange={() => setFilters((current) => ({ ...current, propertyTypes: toggle(current.propertyTypes, type.value) }))} />)}</fieldset><label>Maximum price<select value={filters.maxPrice ?? ""} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value ? Number(event.target.value) : null }))}><option value="">Any price</option><option value={4_000_000}>₱4M</option><option value={6_000_000}>₱6M</option><option value={8_000_000}>₱8M</option><option value={10_000_000}>₱10M</option></select></label><label>Minimum bedrooms<select value={filters.minBedrooms} onChange={(event) => setFilters((current) => ({ ...current, minBedrooms: Number(event.target.value) }))}><option value={0}>Any</option><option value={1}>1+</option><option value={2}>2+</option><option value={3}>3+</option><option value={4}>4+</option></select></label><button type="button" className="clear-filters" onClick={() => setFilters(EMPTY_FILTERS)}><X size={15} />{t("search.clear")}</button></section>}
      <div className="search-layout">
        <section className={`search-results ${mobileView === "map" ? "mobile-hidden" : ""}`} aria-label="Property results">
          <div className="search-result-label"><strong>{filtered.length} of 48</strong><span>Filters never change the map and list separately.</span></div>
          {filtered.length ? <div className="search-property-grid">{filtered.map((listing, index) => <PropertyCard key={listing.id} listing={listing} priority={index < 2} />)}</div> : <div className="empty-state"><h2>No homes match these filters.</h2><p>Your filters were not changed. Clear one to see more.</p><button type="button" className="button primary" onClick={() => setFilters(EMPTY_FILTERS)}>{t("search.clear")}</button></div>}
        </section>
        <aside className={`search-map ${mobileView === "list" ? "mobile-hidden-map" : ""}`}><PropertyMap listings={filtered} /></aside>
      </div>
      <CompareTray />
    </div>
  );
}
