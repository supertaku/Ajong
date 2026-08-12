import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { SearchBar } from "@/components/search-bar";
import { listings, metroCities } from "@/lib/listings";

const collections = [
  { title: "Near top universities", body: "Shorter commutes around Taft, España, Katipunan, and Diliman.", items: listings.filter((item) => item.nearby.some((place) => place.kind === "university")).slice(0, 8) },
  { title: "Central business districts", body: "Live close to Makati, BGC, Ortigas, Eastwood, and Alabang.", items: listings.filter((item) => ["Makati", "Taguig", "Pasig", "Mandaluyong", "Muntinlupa"].includes(item.city)).slice(0, 8) },
  { title: "Rentals under ₱15,000", body: "Practical spaces that keep your monthly budget comfortable.", items: listings.filter((item) => item.monthlyRent < 15000).slice(0, 8) },
  { title: "Pet-friendly homes", body: "More room for every member of the household.", items: listings.filter((item) => item.petsAllowed).slice(0, 8) },
  { title: "Available this season", body: "Move-in-ready choices across all of Metro Manila.", items: listings.slice(32, 40) },
];

export default function HomePage() {
  return <>
    <section className="hero"><div className="container"><SearchBar /></div></section>
    <section className="city-strip"><div className="container"><div className="city-chips">{metroCities.map((city) => <Link className="chip" key={city} href={`/properties?where=${encodeURIComponent(city)}`}>{city}</Link>)}</div></div></section>
    {collections.map((collection, sectionIndex) => <section className="page-section" key={collection.title}><div className="container"><div className="section-heading"><div><h2>{collection.title}</h2><p>{collection.body}</p></div><Link href="/properties">Show all</Link></div><div className="rental-row">{collection.items.map((listing, index) => <PropertyCard key={listing.id} listing={listing} priority={sectionIndex === 0 && index < 4} />)}</div></div></section>)}
  </>;
}
