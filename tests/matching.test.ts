import { describe, expect, it } from "vitest";
import { listings } from "@/lib/listings";
import { DEFAULT_FILTERS, DEFAULT_SEARCH, filterRentals, paramsToSearch, searchToParams } from "@/lib/search";

describe("Metro Manila rental catalog", () => {
  it("contains exactly 100 complete unique rentals", () => {
    expect(listings).toHaveLength(100);
    expect(new Set(listings.map((listing) => listing.id)).size).toBe(100);
    expect(new Set(listings.map((listing) => listing.slug)).size).toBe(100);
    expect(listings.every((listing) => listing.gallery.length === 5 && listing.amenities.length >= 8 && listing.reviews.length >= 3)).toBe(true);
  });
  it("matches the requested city allocation", () => {
    const counts = Object.fromEntries(Array.from(new Set(listings.map((listing) => listing.city))).map((city) => [city, listings.filter((listing) => listing.city === city).length]));
    expect(counts).toMatchObject({ "Quezon City": 14, Manila: 12, Makati: 9, Taguig: 9, Pasig: 8, Mandaluyong: 7, Pasay: 7, Parañaque: 6, Muntinlupa: 5, Caloocan: 4, "Las Piñas": 4, Marikina: 4, "San Juan": 3, Valenzuela: 3, Malabon: 2, Navotas: 2, Pateros: 1 });
  });
  it("matches the requested property mix", () => {
    const count = (type: (typeof listings)[number]["type"]) => listings.filter((listing) => listing.type === type).length;
    expect({ condo: count("condo"), apartment: count("apartment"), studio: count("studio"), house: count("house"), dorm: count("dorm"), bedspace: count("bedspace"), privateRoom: count("private-room") }).toEqual({ condo: 26, apartment: 22, studio: 14, house: 10, dorm: 12, bedspace: 10, privateRoom: 6 });
  });
  it("filters by destination, price, capacity, and amenities", () => {
    const result = filterRentals(listings, { ...DEFAULT_SEARCH, destination: "Makati", adults: 2 }, { ...DEFAULT_FILTERS, maxPrice: 40_000, amenities: ["Wi-Fi"] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((listing) => listing.city === "Makati" && listing.monthlyRent <= 40_000 && listing.capacity >= 2)).toBe(true);
  });
  it("round-trips shareable search parameters", () => {
    const search = { ...DEFAULT_SEARCH, destination: "Taft", moveIn: "2026-10-01", leaseMonths: 6, adults: 2, pets: 1 };
    expect(paramsToSearch(searchToParams(search))).toEqual(search);
  });
});
