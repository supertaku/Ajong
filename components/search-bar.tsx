"use client";

import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp } from "@/app/app-provider";
import { Counter, Modal } from "@/components/modal";
import { destinationSuggestions } from "@/lib/listings";
import { DEFAULT_SEARCH, searchToParams } from "@/lib/search";
import type { SearchState } from "@/lib/types";

export function SearchBar({ compact = false, initial = DEFAULT_SEARCH }: { compact?: boolean; initial?: SearchState }) {
  const router = useRouter();
  const { addRecentSearch, state } = useApp();
  const [search, setSearch] = useState<SearchState>(initial);
  const [open, setOpen] = useState<"destination" | "moveIn" | "renters" | null>(null);
  const suggestions = useMemo(() => destinationSuggestions.filter((item) => !search.destination || item.toLowerCase().includes(search.destination.toLowerCase())).slice(0, 12), [search.destination]);
  const submit = () => { addRecentSearch(search.destination); router.push(`/properties?${searchToParams(search)}`); setOpen(null); };
  return <>
    <div className={`search-bar ${compact ? "compact" : ""}`} role="search">
      <button type="button" className="search-field" onClick={() => setOpen("destination")}><MapPin size={18} /><span><b>Where</b><small>{search.destination || "Search Metro Manila"}</small></span></button>
      <button type="button" className="search-field" onClick={() => setOpen("moveIn")}><CalendarDays size={18} /><span><b>Move in</b><small>{search.moveIn || "Add date"}</small></span></button>
      <button type="button" className="search-field lease-field" onClick={() => setOpen("moveIn")}><span><b>Lease</b><small>{search.leaseMonths} months</small></span></button>
      <button type="button" className="search-field" onClick={() => setOpen("renters")}><Users size={18} /><span><b>Renters</b><small>{search.adults + search.children} resident{search.adults + search.children === 1 ? "" : "s"}</small></span></button>
      <button type="button" className="search-submit" onClick={submit} aria-label="Search rentals"><Search size={19} /><span>Search</span></button>
    </div>
    <Modal open={open === "destination"} onClose={() => setOpen(null)} title="Where do you want to live?" footer={<button className="button primary wide" type="button" onClick={() => setOpen("moveIn")}>Choose move-in</button>}>
      <label className="field-block"><span>Destination</span><div className="input-icon"><Search size={18} /><input autoFocus value={search.destination} onChange={(event) => setSearch({ ...search, destination: event.target.value })} placeholder="City, neighborhood, university, or station" /></div></label>
      {state.recentSearches.length > 0 && <><h3 className="modal-section-title">Recent searches</h3><div className="chip-row">{state.recentSearches.map((item) => <button type="button" className="chip" key={item} onClick={() => setSearch({ ...search, destination: item })}>{item}</button>)}</div></>}
      <h3 className="modal-section-title">Explore Metro Manila</h3><div className="suggestion-list">{suggestions.map((item) => <button type="button" key={item} onClick={() => { setSearch({ ...search, destination: item }); setOpen("moveIn"); }}><span className="suggestion-icon"><MapPin size={18} /></span><span><strong>{item}</strong><small>Metro Manila</small></span></button>)}</div>
    </Modal>
    <Modal open={open === "moveIn"} onClose={() => setOpen(null)} title="When will you move?" footer={<button className="button primary wide" type="button" onClick={() => setOpen("renters")}>Choose renters</button>}>
      <div className="calendar-tabs"><button className="active" type="button">Exact date</button><button type="button">Flexible month</button></div>
      <label className="field-block"><span>Move-in date</span><input type="date" min="2026-08-13" value={search.moveIn} onChange={(event) => setSearch({ ...search, moveIn: event.target.value })} /></label>
      <h3 className="modal-section-title">How long will you stay?</h3><div className="lease-grid">{[3, 6, 12, 18, 24].map((months) => <button type="button" key={months} className={search.leaseMonths === months ? "active" : ""} onClick={() => setSearch({ ...search, leaseMonths: months })}><b>{months}</b><span>months</span></button>)}</div>
    </Modal>
    <Modal open={open === "renters"} onClose={() => setOpen(null)} title="Who's moving in?" footer={<button className="button primary wide" type="button" onClick={submit}>Show rentals</button>}>
      <Counter label="Adults" helper="Ages 18 or above" min={1} value={search.adults} onChange={(adults) => setSearch({ ...search, adults })} />
      <Counter label="Children" helper="Ages 0 to 17" value={search.children} onChange={(children) => setSearch({ ...search, children })} />
      <Counter label="Pets" helper="Bringing a pet?" value={search.pets} onChange={(pets) => setSearch({ ...search, pets })} />
    </Modal>
  </>;
}
