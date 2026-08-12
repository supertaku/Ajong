"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_STATE, parseAppState, STORAGE_KEY, type AppState } from "@/lib/local-state";
import type { HostInterest, Reservation, Wishlist } from "@/lib/types";

type AppContextValue = {
  state: AppState;
  wishlists: Wishlist[];
  reservations: Reservation[];
  isSaved: (listingId: string) => boolean;
  toggleSaved: (listingId: string, wishlistName?: string) => void;
  createWishlist: (name: string, listingId?: string) => void;
  renameWishlist: (id: string, name: string) => void;
  removeWishlist: (id: string) => void;
  addReservation: (reservation: Reservation) => void;
  addRecentSearch: (search: string) => void;
  addHostInterest: (interest: HostInterest) => void;
  toast: string;
  showToast: (message: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setState(parseAppState(window.localStorage.getItem(STORAGE_KEY)));
      setHydrated(true);
    });
  }, []);
  useEffect(() => { if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [hydrated, state]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }, []);
  const isSaved = useCallback((listingId: string) => state.wishlists.some((list) => list.listingIds.includes(listingId)), [state.wishlists]);
  const toggleSaved = useCallback((listingId: string, wishlistName = "My favorite rentals") => {
    setState((current) => {
      const containing = current.wishlists.find((list) => list.listingIds.includes(listingId));
      if (containing) return { ...current, wishlists: current.wishlists.map((list) => list.id === containing.id ? { ...list, listingIds: list.listingIds.filter((id) => id !== listingId) } : list) };
      const target = current.wishlists.find((list) => list.name === wishlistName) ?? current.wishlists[0];
      if (target) return { ...current, wishlists: current.wishlists.map((list) => list.id === target.id ? { ...list, listingIds: [...list.listingIds, listingId] } : list) };
      return { ...current, wishlists: [{ id: `wishlist-${Date.now()}`, name: wishlistName, listingIds: [listingId], createdAt: new Date().toISOString() }] };
    });
  }, []);
  const createWishlist = useCallback((name: string, listingId?: string) => setState((current) => ({ ...current, wishlists: [...current.wishlists, { id: `wishlist-${Date.now()}`, name, listingIds: listingId ? [listingId] : [], createdAt: new Date().toISOString() }] })), []);
  const renameWishlist = useCallback((id: string, name: string) => setState((current) => ({ ...current, wishlists: current.wishlists.map((list) => list.id === id ? { ...list, name } : list) })), []);
  const removeWishlist = useCallback((id: string) => setState((current) => ({ ...current, wishlists: current.wishlists.filter((list) => list.id !== id) })), []);
  const addReservation = useCallback((reservation: Reservation) => setState((current) => ({ ...current, reservations: [reservation, ...current.reservations] })), []);
  const addRecentSearch = useCallback((search: string) => setState((current) => ({ ...current, recentSearches: [search, ...current.recentSearches.filter((item) => item !== search)].slice(0, 6) })), []);
  const addHostInterest = useCallback((interest: HostInterest) => setState((current) => ({ ...current, hostInterests: [...current.hostInterests, interest] })), []);
  const value = useMemo(() => ({ state, wishlists: state.wishlists, reservations: state.reservations, isSaved, toggleSaved, createWishlist, renameWishlist, removeWishlist, addReservation, addRecentSearch, addHostInterest, toast, showToast }), [state, isSaved, toggleSaved, createWishlist, renameWishlist, removeWishlist, addReservation, addRecentSearch, addHostInterest, toast, showToast]);
  return <AppContext.Provider value={value}>{children}{toast && <div className="toast" role="status">{toast}</div>}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
