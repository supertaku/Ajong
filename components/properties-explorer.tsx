"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Accessibility,
  Bath,
  BedDouble,
  Building,
  Building2,
  CalendarDays,
  Cctv,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  DoorOpen,
  Dumbbell,
  Heart,
  Hotel,
  House,
  KeyRound,
  LampDesk,
  List,
  Map as MapIcon,
  MapPin,
  Minus,
  ParkingCircle,
  PawPrint,
  Plus,
  ShieldCheck,
  ShowerHead,
  SlidersHorizontal,
  Snowflake,
  Star,
  UsersRound,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Modal } from "@/components/modal";
import { LoginModal } from "@/components/login-modal";
import { PropertyCard } from "@/components/property-card";
import { listings, listingTypeLabels } from "@/lib/listings";
import { peso } from "@/lib/finance";
import { DEFAULT_FILTERS, filterRentals, paramsToSearch } from "@/lib/search";
import type { GenderPolicy, RentalFilters, RentalListing, RentalType } from "@/lib/types";

const PropertyMap = dynamic(() => import("@/components/property-map").then((module) => module.PropertyMap), {
  ssr: false,
  loading: () => <div className="map-shell" aria-label="Loading map" />,
});

const PRICE_LIMIT = 100000;
const PRICE_STEP = 1000;
const RESULTS_PER_PAGE = 18;
const NEARBY_CAROUSEL_SIZE = 9;
const amenities = ["Wi-Fi", "Air conditioning", "Kitchen", "Washer", "Security", "Elevator", "Gym", "Pool", "Study area", "Backup power", "Hot shower", "CCTV"];
const quickAmenities = ["Wi-Fi", "Washer", "Air conditioning", "Kitchen", "Pool", "Gym", "Security"];
const rentalTypes = Object.entries(listingTypeLabels) as [RentalType, string][];

const typeIcons: Record<RentalType, LucideIcon> = {
  condo: Building2,
  apartment: Building,
  studio: LampDesk,
  house: House,
  dorm: Hotel,
  bedspace: UsersRound,
  "private-room": DoorOpen,
};

const amenityIcons: Record<string, LucideIcon> = {
  "Wi-Fi": Wifi,
  "Air conditioning": Snowflake,
  Kitchen: CookingPot,
  Washer: WashingMachine,
  Security: ShieldCheck,
  Elevator: Building2,
  Gym: Dumbbell,
  Pool: Waves,
  "Study area": LampDesk,
  "Backup power": KeyRound,
  "Hot shower": ShowerHead,
  CCTV: Cctv,
};

const recommendedAmenities = ["Kitchen", "Washer", "Pool", "Gym"];
const furnishingLabels = { any: "Any", "fully furnished": "Fully furnished", "semi-furnished": "Semi-furnished", unfurnished: "Unfurnished" } as const;
const priceHistogram = (() => {
  const bins = Array.from({ length: 36 }, () => 0);
  listings.forEach((listing) => {
    const index = Math.min(bins.length - 1, Math.floor((listing.monthlyRent / PRICE_LIMIT) * bins.length));
    bins[index] += 1;
  });
  const peak = Math.max(...bins, 1);
  return bins.map((count) => Math.max(5, Math.round((count / peak) * 58)));
})();

function paginationItems(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "end-gap", total] as const;
  if (current >= total - 3) return [1, "start-gap", total - 4, total - 3, total - 2, total - 1, total] as const;
  return [1, "start-gap", current - 1, current, current + 1, "end-gap", total] as const;
}

function FilterStepper({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="filter-stepper">
      <span>{label}</span>
      <div className="filter-stepper-controls">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0} aria-label={`Decrease ${label}`}>
          <Minus size={17} />
        </button>
        <strong aria-live="polite">{value === 0 ? "Any" : `${value}+`}</strong>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value === max} aria-label={`Increase ${label}`}>
          <Plus size={17} />
        </button>
      </div>
    </div>
  );
}

export function PropertiesExplorer() {
  const params = useSearchParams();
  const search = useMemo(() => paramsToSearch(new URLSearchParams(params.toString())), [params]);
  const initialType = params.get("type");
  const initialMaxPrice = Number(params.get("maxPrice"));
  const initialTypes: RentalType[] = initialType === "dorm" ? ["dorm", "bedspace"] : initialType === "home" ? ["condo", "apartment", "studio", "house"] : initialType && initialType in listingTypeLabels ? [initialType as RentalType] : [];
  const [filters, setFilters] = useState<RentalFilters>({
    ...DEFAULT_FILTERS,
    pets: search.pets > 0,
    maxPrice: initialMaxPrice > 0 && initialMaxPrice <= PRICE_LIMIT ? initialMaxPrice : DEFAULT_FILTERS.maxPrice,
    types: initialTypes,
  });
  const [draft, setDraft] = useState(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selected, setSelected] = useState<RentalListing | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [nearbySlide, setNearbySlide] = useState(0);
  const nearbyCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => document.body.classList.remove("results-loading-active"), 420);
    return () => window.clearTimeout(timer);
  }, [params]);

  const selectedFromUrl = listings.find((listing) => listing.id === params.get("selected"));
  const filtered = useMemo(() => {
    const result = filterRentals(listings, search, filters);
    return [...result].sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.rating - a.rating);
  }, [search, filters]);
  const draftResultCount = useMemo(() => filterRentals(listings, search, draft).length, [search, draft]);
  const activeFilters = filters.types.length + filters.amenities.length + Number(filters.bedrooms > 0) + Number(filters.parking) + Number(filters.pets) + Number(filters.accessible) + Number(filters.maxPrice < PRICE_LIMIT);
  const toggleType = (type: RentalType) => setDraft((current) => ({ ...current, types: current.types.includes(type) ? current.types.filter((item) => item !== type) : [...current.types, type] }));
  const toggleAmenity = (amenity: string) => setDraft((current) => ({ ...current, amenities: current.amenities.includes(amenity) ? current.amenities.filter((item) => item !== amenity) : [...current.amenities, amenity] }));
  const toggleQuickAmenity = (amenity: string) => setFilters((current) => ({ ...current, amenities: current.amenities.includes(amenity) ? current.amenities.filter((item) => item !== amenity) : [...current.amenities, amenity] }));
  const featured = selectedFromUrl && filtered.some((listing) => listing.id === selectedFromUrl.id) ? selectedFromUrl : filtered[0];
  const orderedResults = selectedFromUrl && featured ? [featured, ...filtered.filter((listing) => listing.id !== featured.id)] : filtered;
  const totalPages = Math.max(1, Math.ceil(orderedResults.length / RESULTS_PER_PAGE));
  const pageResults = orderedResults.slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE);
  const pageFeatured = selectedFromUrl && currentPage === 1 ? featured : undefined;
  const pageListings = pageFeatured ? pageResults.filter((listing) => listing.id !== pageFeatured.id) : pageResults;
  const firstPageListings = pageListings.slice(0, 6);
  const remainingPageListings = pageListings.slice(6);
  const nearbyListings = useMemo(() => {
    if (!filtered.length) return [];
    const visibleIds = new Set(pageResults.map((listing) => listing.id));
    const exactCity = listings.some((listing) => listing.city.toLowerCase() === search.destination.trim().toLowerCase());
    const anchor = filtered.reduce((position, listing) => ({ latitude: position.latitude + listing.latitude / filtered.length, longitude: position.longitude + listing.longitude / filtered.length }), { latitude: 0, longitude: 0 });
    const metroMatches = filterRentals(listings, { ...search, destination: "Metro Manila" }, filters);
    return metroMatches
      .filter((listing) => !visibleIds.has(listing.id) && (!exactCity || listing.city.toLowerCase() !== search.destination.trim().toLowerCase()))
      .sort((a, b) => ((a.latitude - anchor.latitude) ** 2 + (a.longitude - anchor.longitude) ** 2) - ((b.latitude - anchor.latitude) ** 2 + (b.longitude - anchor.longitude) ** 2))
      .slice(0, NEARBY_CAROUSEL_SIZE);
  }, [filtered, filters, pageResults, search]);
  const nearbyCarouselPages = Math.max(1, Math.ceil(nearbyListings.length / 3));
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 6);
  const priceStyle = {
    "--range-start": `${(draft.minPrice / PRICE_LIMIT) * 100}%`,
    "--range-end": `${(draft.maxPrice / PRICE_LIMIT) * 100}%`,
  } as CSSProperties;

  useEffect(() => {
    setCurrentPage(1);
    setNearbySlide(0);
  }, [filters, params]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const moveNearbyCarousel = (direction: -1 | 1) => {
    const nextSlide = Math.min(nearbyCarouselPages - 1, Math.max(0, nearbySlide + direction));
    setNearbySlide(nextSlide);
    nearbyCarouselRef.current?.scrollTo({ left: nextSlide * nearbyCarouselRef.current.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setNearbySlide(0);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <div className={`results-page ${selectedFromUrl ? "featured-results-page" : ""}`} onClickCapture={(event) => { if ((event.target as Element).closest(".featured-heart")) setLoginOpen(true); }}>
      <div className="results-header">
        <div className="container quick-filters">
          <button type="button" className={`filter-button ${activeFilters ? "active" : ""}`} onClick={() => { setDraft(filters); setShowAllAmenities(false); setFiltersOpen(true); }}>
            <SlidersHorizontal size={16} />Filters {activeFilters ? `(${activeFilters})` : ""}
          </button>
          <span className="quick-filter-divider" aria-hidden="true" />
          <button type="button" className={`filter-button ${filters.pets ? "active" : ""}`} aria-pressed={filters.pets} onClick={() => setFilters((current) => ({ ...current, pets: !current.pets }))}>Allows pets</button>
          {quickAmenities.map((amenity) => <button type="button" className={`filter-button ${filters.amenities.includes(amenity) ? "active" : ""}`} aria-pressed={filters.amenities.includes(amenity)} onClick={() => toggleQuickAmenity(amenity)} key={amenity}>{amenity}</button>)}
          <button type="button" className={`filter-button ${filters.parking ? "active" : ""}`} aria-pressed={filters.parking} onClick={() => setFilters((current) => ({ ...current, parking: !current.parking }))}>Free parking</button>
        </div>
      </div>

      <div className={`results-layout ${mapVisible ? "map-visible" : ""}`}>
        <section className="results-list">
          <div className="results-copy"><h1>{filtered.length} rental{filtered.length === 1 ? "" : "s"} in {search.destination}</h1><p>Prices shown monthly • {search.leaseMonths}-month lease • {search.adults + search.children} renter{search.adults + search.children === 1 ? "" : "s"}</p></div>
          {filtered.length ? (
            <>
              {pageFeatured && (
                <article className="featured-result" onMouseEnter={() => setSelected(pageFeatured)} onMouseLeave={() => setSelected(null)}>
                  <Link href={`/properties/${pageFeatured.slug}`} className="featured-result-image"><Image src={pageFeatured.gallery[0]} alt={pageFeatured.title} fill sizes="360px" priority unoptimized /><span className="listing-badge">{pageFeatured.badge ?? "Featured rental"}</span></Link>
                  <div className="featured-result-copy">
                    <button type="button" className="featured-heart" aria-label="Save rental"><Heart size={21} /></button>
                    <div className="featured-result-kicker"><Building2 size={16} aria-hidden="true" /><span>{listingTypeLabels[pageFeatured.type]}</span><small>{pageFeatured.city}</small></div>
                    <Link href={`/properties/${pageFeatured.slug}`} className="featured-result-title"><h2>{pageFeatured.title}</h2></Link>
                    <div className="featured-facts">
                      <span><MapPin size={16} aria-hidden="true" />{pageFeatured.neighborhood}</span>
                      <span><BedDouble size={17} aria-hidden="true" />{pageFeatured.bedrooms} bedroom{pageFeatured.bedrooms === 1 ? "" : "s"} · {pageFeatured.beds} bed{pageFeatured.beds === 1 ? "" : "s"}</span>
                      <span><Bath size={16} aria-hidden="true" />{pageFeatured.bathrooms} bath</span>
                    </div>
                    <div className="featured-availability"><CalendarDays size={17} aria-hidden="true" /><span>Available {new Date(pageFeatured.availableFrom).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span></div>
                    <footer className="featured-result-footer"><div className="featured-price"><strong>{peso(pageFeatured.monthlyRent)}</strong><span>per month</span></div><div className="featured-rating" aria-label={`${pageFeatured.rating} out of 5 from ${pageFeatured.reviewCount} reviews`}><Star size={16} fill="currentColor" aria-hidden="true" /><strong>{pageFeatured.rating}</strong><span>{pageFeatured.reviewCount} reviews</span></div></footer>
                  </div>
                </article>
              )}
              <div className="property-grid">{firstPageListings.map((listing, index) => <PropertyCard listing={listing} key={listing.id} priority={currentPage === 1 && !pageFeatured && index < 4} onHover={(id) => setSelected(listings.find((item) => item.id === id) ?? null)} />)}</div>
              {nearbyListings.length > 0 && <section className="nearby-locations-section" aria-labelledby="nearby-locations-title">
                <header className="nearby-locations-header"><h2 id="nearby-locations-title">Available in nearby locations</h2><div className="nearby-carousel-controls"><span>{nearbySlide + 1} / {nearbyCarouselPages}</span><button type="button" onClick={() => moveNearbyCarousel(-1)} disabled={nearbySlide === 0} aria-label="Previous nearby homes"><ChevronLeft size={20} /></button><button type="button" onClick={() => moveNearbyCarousel(1)} disabled={nearbySlide >= nearbyCarouselPages - 1} aria-label="Next nearby homes"><ChevronRight size={20} /></button></div></header>
                <div className="nearby-carousel-track" ref={nearbyCarouselRef}>{nearbyListings.map((listing) => <PropertyCard listing={listing} key={`nearby-${listing.id}`} discoveryLink onHover={(id) => setSelected(listings.find((item) => item.id === id) ?? null)} />)}</div>
              </section>}
              {remainingPageListings.length > 0 && <div className="property-grid results-continuation-grid">{remainingPageListings.map((listing) => <PropertyCard listing={listing} key={listing.id} onHover={(id) => setSelected(listings.find((item) => item.id === id) ?? null)} />)}</div>}
              {totalPages > 1 && <nav className="results-pagination" aria-label="Property results pages"><button type="button" className="pagination-arrow" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"><ChevronLeft size={19} /></button>{paginationItems(currentPage, totalPages).map((item) => typeof item === "number" ? <button type="button" className={item === currentPage ? "current" : ""} aria-current={item === currentPage ? "page" : undefined} onClick={() => goToPage(item)} key={item}>{item}</button> : <span aria-hidden="true" key={item}>...</span>)}<button type="button" className="pagination-arrow" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page"><ChevronRight size={19} /></button></nav>}
            </>
          ) : (
            <div className="empty-state"><h2>No rentals match those choices</h2><p>Try a nearby area, a higher price range, or fewer amenities.</p><button type="button" className="button primary" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</button></div>
          )}
        </section>
        <aside className="results-map"><PropertyMap listings={filtered} selectedId={selected?.id ?? featured?.id} onSelect={setSelected} focusedCity={search.destination} /></aside>
      </div>

      <button type="button" className="map-toggle" onClick={() => setMapVisible(!mapVisible)}>{mapVisible ? <List size={18} /> : <MapIcon size={18} />}{mapVisible ? "Show list" : "Show map"}</button>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        size="large"
        variant="filter"
        footer={(
          <div className="filter-footer">
            <button type="button" className="button ghost" onClick={() => setDraft(DEFAULT_FILTERS)}>Clear all</button>
            <button type="button" className="button primary" onClick={() => { setFilters(draft); setFiltersOpen(false); }}>Show {draftResultCount} rental{draftResultCount === 1 ? "" : "s"}</button>
          </div>
        )}
      >
        <div className="airbnb-filter-sections">
          <section className="airbnb-filter-section filter-recommended">
            <h3>Popular with renters</h3>
            <div className="filter-visual-grid">
              {recommendedAmenities.map((amenity) => {
                const Icon = amenityIcons[amenity];
                const active = draft.amenities.includes(amenity);
                return <button type="button" className={active ? "active" : ""} aria-pressed={active} onClick={() => toggleAmenity(amenity)} key={amenity}><Icon size={30} strokeWidth={1.7} /><span>{amenity}</span></button>;
              })}
            </div>
          </section>

          <section className="airbnb-filter-section">
            <h3>Property type</h3>
            <div className="filter-type-grid">
              {rentalTypes.map(([value, label]) => {
                const Icon = typeIcons[value];
                const active = draft.types.includes(value);
                return <button type="button" className={active ? "active" : ""} aria-pressed={active} key={value} onClick={() => toggleType(value)}><Icon size={25} strokeWidth={1.7} /><span>{label}</span></button>;
              })}
            </div>
          </section>

          <section className="airbnb-filter-section">
            <h3>Monthly price range</h3>
            <p className="filter-section-helper">Choose a monthly rent before utilities and deposits.</p>
            <div className="price-range-control" style={priceStyle}>
              <div className="price-histogram" aria-hidden="true">
                {priceHistogram.map((height, index) => {
                  const position = (index / (priceHistogram.length - 1)) * PRICE_LIMIT;
                  const selectedBar = position >= draft.minPrice && position <= draft.maxPrice;
                  return <span className={selectedBar ? "selected" : ""} style={{ height }} key={index} />;
                })}
              </div>
              <div className="price-slider-track" aria-hidden="true" />
              <input className="price-range-input price-range-min" type="range" min="0" max={PRICE_LIMIT} step={PRICE_STEP} value={draft.minPrice} aria-label="Minimum monthly price" onChange={(event) => setDraft((current) => ({ ...current, minPrice: Math.min(Number(event.target.value), current.maxPrice) }))} />
              <input className="price-range-input price-range-max" type="range" min="0" max={PRICE_LIMIT} step={PRICE_STEP} value={draft.maxPrice} aria-label="Maximum monthly price" onChange={(event) => setDraft((current) => ({ ...current, maxPrice: Math.max(Number(event.target.value), current.minPrice) }))} />
            </div>
            <div className="price-input-row">
              <label><span>Minimum</span><div><b>₱</b><input type="number" min="0" max={draft.maxPrice} step={PRICE_STEP} value={draft.minPrice} onChange={(event) => setDraft((current) => ({ ...current, minPrice: Math.max(0, Math.min(Number(event.target.value), current.maxPrice)) }))} /></div></label>
              <span className="price-input-separator" aria-hidden="true" />
              <label><span>Maximum</span><div><b>₱</b><input type="number" min={draft.minPrice} max={PRICE_LIMIT} step={PRICE_STEP} value={draft.maxPrice} onChange={(event) => setDraft((current) => ({ ...current, maxPrice: Math.min(PRICE_LIMIT, Math.max(Number(event.target.value), current.minPrice)) }))} /></div></label>
            </div>
          </section>

          <section className="airbnb-filter-section">
            <h3>Rooms and beds</h3>
            <FilterStepper label="Bedrooms" value={draft.bedrooms} max={4} onChange={(bedrooms) => setDraft({ ...draft, bedrooms })} />
            <FilterStepper label="Beds" value={draft.beds} max={4} onChange={(beds) => setDraft({ ...draft, beds })} />
            <FilterStepper label="Bathrooms" value={draft.bathrooms} max={3} onChange={(bathrooms) => setDraft({ ...draft, bathrooms })} />
          </section>

          <section className="airbnb-filter-section">
            <h3>Furnishing</h3>
            <div className="filter-segmented" role="group" aria-label="Furnishing">
              {(["any", "fully furnished", "semi-furnished", "unfurnished"] as const).map((value) => <button type="button" className={draft.furnishing === value ? "active" : ""} aria-pressed={draft.furnishing === value} onClick={() => setDraft({ ...draft, furnishing: value })} key={value}>{furnishingLabels[value]}</button>)}
            </div>
          </section>

          <section className="airbnb-filter-section">
            <h3>Amenities</h3>
            <div className="filter-chip-grid">
              {visibleAmenities.map((amenity) => {
                const Icon = amenityIcons[amenity];
                const active = draft.amenities.includes(amenity);
                return <button type="button" className={active ? "active" : ""} aria-pressed={active} onClick={() => toggleAmenity(amenity)} key={amenity}><Icon size={21} strokeWidth={1.8} /><span>{amenity}</span></button>;
              })}
            </div>
            <button type="button" className="filter-show-more" onClick={() => setShowAllAmenities((current) => !current)}>{showAllAmenities ? "Show less" : "Show all amenities"}</button>
          </section>

          <section className="airbnb-filter-section">
            <h3>Features</h3>
            <div className="filter-chip-grid feature-chips">
              <button type="button" className={draft.parking ? "active" : ""} aria-pressed={draft.parking} onClick={() => setDraft({ ...draft, parking: !draft.parking })}><ParkingCircle size={22} /><span>Parking</span></button>
              <button type="button" className={draft.pets ? "active" : ""} aria-pressed={draft.pets} onClick={() => setDraft({ ...draft, pets: !draft.pets })}><PawPrint size={22} /><span>Pets allowed</span></button>
              <button type="button" className={draft.accessible ? "active" : ""} aria-pressed={draft.accessible} onClick={() => setDraft({ ...draft, accessible: !draft.accessible })}><Accessibility size={22} /><span>Step-free access</span></button>
            </div>
          </section>

          <section className="airbnb-filter-section">
            <h3>Dorm resident policy</h3>
            <div className="filter-segmented filter-segmented-three" role="group" aria-label="Dorm resident policy">
              {(["any", "women only", "men only"] as (GenderPolicy | "any")[]).map((value) => <button type="button" className={draft.genderPolicy === value ? "active" : ""} aria-pressed={draft.genderPolicy === value} onClick={() => setDraft({ ...draft, genderPolicy: value })} key={value}>{value === "any" ? "Any" : value}</button>)}
            </div>
          </section>
        </div>
      </Modal>
    </div>
  );
}
