import { HomeCollection } from "@/components/home-collection";
import { listings } from "@/lib/listings";

const collections = [
  { title: "Near top universities", body: "Shorter commutes around Taft, España, Katipunan, and Diliman.", items: listings.filter((item) => item.nearby.some((place) => place.kind === "university")).slice(0, 8) },
  { title: "Central business districts", body: "Live close to Makati, BGC, Ortigas, Eastwood, and Alabang.", items: listings.filter((item) => ["Makati", "Taguig", "Pasig", "Mandaluyong", "Muntinlupa"].includes(item.city)).slice(0, 8) },
  { title: "Rentals under ₱15,000", body: "Practical spaces that keep your monthly budget comfortable.", items: listings.filter((item) => item.monthlyRent < 15000).slice(0, 8) },
  { title: "Pet-friendly homes", body: "More room for every member of the household.", items: listings.filter((item) => item.petsAllowed).slice(0, 8) },
  { title: "Available this season", body: "Move-in-ready choices across all of Metro Manila.", items: listings.slice(32, 40) },
];

export default function HomePage() {
  return <>
    <section className="hero" aria-hidden="true"><div className="home-search-space" /></section>
    {collections.map((collection, sectionIndex) => <HomeCollection key={collection.title} {...collection} priority={sectionIndex === 0} />)}
  </>;
}
