import type { RentalFilters, RentalListing, SearchState } from "./types";

export const DEFAULT_SEARCH: SearchState = { destination: "Metro Manila", moveIn: "", leaseMonths: 12, adults: 1, children: 0, pets: 0 };
export const DEFAULT_FILTERS: RentalFilters = { minPrice: 0, maxPrice: 100000, types: [], bedrooms: 0, beds: 0, bathrooms: 0, furnishing: "any", amenities: [], parking: false, pets: false, accessible: false, genderPolicy: "any" };

export function filterRentals(source: RentalListing[], search: SearchState, filters: RentalFilters) {
  const needle = search.destination.trim().toLowerCase();
  const occupants = search.adults + search.children;
  return source.filter((listing) => {
    const place = `${listing.city} ${listing.neighborhood} ${listing.title} ${listing.nearby.map((item) => item.name).join(" ")}`.toLowerCase();
    return (!needle || needle === "metro manila" || place.includes(needle))
      && listing.minimumLeaseMonths <= search.leaseMonths
      && listing.capacity >= occupants
      && listing.monthlyRent >= filters.minPrice
      && listing.monthlyRent <= filters.maxPrice
      && (!filters.types.length || filters.types.includes(listing.type))
      && listing.bedrooms >= filters.bedrooms
      && listing.beds >= filters.beds
      && listing.bathrooms >= filters.bathrooms
      && (filters.furnishing === "any" || listing.furnishing === filters.furnishing)
      && (!filters.parking || listing.parking)
      && (!filters.pets || listing.petsAllowed)
      && (!filters.accessible || listing.accessible)
      && (filters.genderPolicy === "any" || listing.genderPolicy === filters.genderPolicy)
      && filters.amenities.every((amenity) => listing.amenities.includes(amenity));
  });
}

export function searchToParams(search: SearchState) {
  const params = new URLSearchParams();
  if (search.destination) params.set("where", search.destination);
  if (search.moveIn) params.set("moveIn", search.moveIn);
  params.set("lease", String(search.leaseMonths));
  params.set("adults", String(search.adults));
  if (search.children) params.set("children", String(search.children));
  if (search.pets) params.set("pets", String(search.pets));
  return params;
}

export function paramsToSearch(params: URLSearchParams): SearchState {
  const lease = Number(params.get("lease"));
  return {
    destination: params.get("where") || DEFAULT_SEARCH.destination,
    moveIn: params.get("moveIn") || "",
    leaseMonths: [3, 6, 12, 18, 24].includes(lease) ? lease : 12,
    adults: Math.max(1, Number(params.get("adults")) || 1),
    children: Math.max(0, Number(params.get("children")) || 0),
    pets: Math.max(0, Number(params.get("pets")) || 0),
  };
}
