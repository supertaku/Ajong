import type { HostInterest, Reservation, Wishlist } from "./types";

export const STORAGE_KEY = "kubo-rentals-v1";
export interface AppState { version: 1; wishlists: Wishlist[]; reservations: Reservation[]; recentSearches: string[]; hostInterests: HostInterest[]; }
export const DEFAULT_STATE: AppState = { version: 1, wishlists: [], reservations: [], recentSearches: [], hostInterests: [] };

export function parseAppState(serialized: string | null): AppState {
  if (!serialized) return DEFAULT_STATE;
  try {
    const value = JSON.parse(serialized) as Partial<AppState>;
    if (value.version !== 1) return DEFAULT_STATE;
    return {
      version: 1,
      wishlists: Array.isArray(value.wishlists) ? value.wishlists : [],
      reservations: Array.isArray(value.reservations) ? value.reservations : [],
      recentSearches: Array.isArray(value.recentSearches) ? value.recentSearches.filter((item): item is string => typeof item === "string").slice(0, 6) : [],
      hostInterests: Array.isArray(value.hostInterests) ? value.hostInterests : [],
    };
  } catch { return DEFAULT_STATE; }
}
