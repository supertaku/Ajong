"use client";

import { Building2, MapPin, Navigation, Search, TrainFront } from "lucide-react";
import { motion } from "motion/react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useApp } from "@/app/app-provider";
import { Counter } from "@/components/modal";
import { destinationSuggestions } from "@/lib/listings";
import { DEFAULT_SEARCH, searchToParams } from "@/lib/search";
import type { SearchState } from "@/lib/types";

type SearchPanel = "destination" | "renters" | null;

const destinationCopy: Record<string, string> = {
  "Metro Manila": "Explore rentals across the capital region",
  "Quezon City": "Universities, neighborhoods, and business hubs",
  Manila: "Taft, España, Intramuros, and the city center",
  Makati: "Close to Ayala and the central business district",
  Taguig: "Homes near BGC and major offices",
  Pasig: "Ortigas, Kapitolyo, and nearby transit",
  Mandaluyong: "Central access to Ortigas and Makati",
  Pasay: "Near MOA, Newport, and transport links",
  Parañaque: "Southern neighborhoods near the airport",
  Muntinlupa: "Alabang homes and quieter communities",
};

function suggestionMeta(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("station") || lower.includes("mrt") || lower.includes("lrt")) return { Icon: TrainFront, copy: "Convenient access to public transport" };
  if (lower.includes("university") || lower.includes("taft") || lower.includes("katipunan") || lower.includes("diliman") || lower.includes("españa")) return { Icon: Building2, copy: "Student rentals near leading campuses" };
  return { Icon: MapPin, copy: destinationCopy[name] ?? "Homes and rooms in this Metro Manila area" };
}

function SearchPopover({ panel, label, side, onClose, children }: { panel: Exclude<SearchPanel, null> | null; label: string; side: "left" | "right"; onClose: () => void; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel, onClose]);
  if (!panel) return null;
  return <motion.div ref={panelRef} layout data-panel={panel} className={`search-popover search-popover-${side}`} role="dialog" aria-modal="true" aria-label={label} transition={{ layout: { duration: .36, ease: [.22, 1, .36, 1] } }}>
    <motion.div key={panel} initial={{ opacity: 0, x: panel === "destination" ? -6 : 6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .28, ease: [.22, 1, .36, 1] }}>{children}</motion.div>
  </motion.div>;
}

export function SearchBar({ compact = false, headerCompact = false, initial = DEFAULT_SEARCH, onOpenChange }: { compact?: boolean; headerCompact?: boolean; initial?: SearchState; onOpenChange?: (open: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { addRecentSearch, state, showResultsLoading } = useApp();
  const experienceRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<SearchState>(initial);
  const [infants, setInfants] = useState(0);
  const [open, setOpen] = useState<SearchPanel>(null);
  const [visiblePanel, setVisiblePanel] = useState<SearchPanel>(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestions = useMemo(() => destinationSuggestions.filter((item) => search.destination === "Metro Manila" || !search.destination || item.toLowerCase().includes(search.destination.toLowerCase())).slice(0, 10), [search.destination]);
  const renterCount = search.adults + search.children;
  const changeOpen = useCallback((panel: SearchPanel) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (panel) {
      setClosing(false);
      setVisiblePanel(panel);
      setOpen(panel);
      onOpenChange?.(true);
      return;
    }
    setOpen(null);
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setVisiblePanel(null);
      setClosing(false);
      onOpenChange?.(false);
    }, 320);
  }, [onOpenChange]);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  useEffect(() => {
    document.body.classList.toggle("search-overlay-open", visiblePanel !== null);
    return () => document.body.classList.remove("search-overlay-open");
  }, [visiblePanel]);
  useEffect(() => {
    if (!visiblePanel || closing) return;
    const dismissOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !experienceRef.current?.contains(target)) changeOpen(null);
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    return () => document.removeEventListener("pointerdown", dismissOutside, true);
  }, [visiblePanel, closing, changeOpen]);
  const submit = () => {
    addRecentSearch(search.destination);
    const href = `/properties?${searchToParams(search)}`;
    if (pathname === "/properties") {
      showResultsLoading();
      window.setTimeout(() => router.push(href), 180);
    }
    else window.open(href, "_blank", "noopener,noreferrer");
    changeOpen(null);
  };
  const chooseDestination = (destination: string) => { setSearch({ ...search, destination }); changeOpen("renters"); };
  const editDestination = (destination: string) => { setSearch({ ...search, destination }); if (open !== "destination") changeOpen("destination"); };
  const destinationKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") { event.preventDefault(); submit(); } };

  return <div ref={experienceRef} className={`search-experience ${visiblePanel ? "open" : ""} ${closing ? "closing" : ""}`}>
    {visiblePanel && createPortal(<button type="button" className={`search-scrim${headerCompact ? "" : " search-scrim-expanded"}${closing ? " closing" : ""}`} onClick={() => changeOpen(null)} aria-label="Close search" />, document.body)}
    {headerCompact ? <div className="header-compact-search two-field-search" data-active={visiblePanel ?? undefined} role="search">
      <label className={`compact-destination-field ${open === "destination" ? "active" : ""}`}><MapPin size={17} /><input aria-label="Where" value={search.destination} placeholder="Anywhere" onFocus={() => changeOpen("destination")} onChange={(event) => editDestination(event.target.value)} onKeyDown={destinationKeyDown} /></label>
      <button type="button" className={open === "renters" ? "active" : ""} onClick={() => changeOpen("renters")}><span>{renterCount > 1 ? `${renterCount} renters` : "Add renters"}</span></button>
      <button type="button" className="header-compact-submit" onClick={submit} aria-label="Search rentals"><Search size={18} /></button>
    </div> : <div className={`search-bar two-field-search ${compact ? "compact" : ""}`} data-active={visiblePanel ?? undefined} role="search">
      <label className={`search-field destination-search-field ${open === "destination" ? "active" : ""}`}><span><b>Where</b><input aria-label="Where" value={search.destination} placeholder="Search destinations" onFocus={() => changeOpen("destination")} onChange={(event) => editDestination(event.target.value)} onKeyDown={destinationKeyDown} /></span></label>
      <button type="button" className={`search-field ${open === "renters" ? "active" : ""}`} onClick={() => changeOpen("renters")}><span><b>Who</b><small>{renterCount > 1 ? `${renterCount} renters${search.pets ? ` · ${search.pets} pet${search.pets === 1 ? "" : "s"}` : ""}` : "Add renters"}</small></span></button>
      <button type="button" className="search-submit" onClick={submit} aria-label="Search rentals"><Search size={19} /><span>Search</span></button>
    </div>}

    <SearchPopover panel={visiblePanel} onClose={() => changeOpen(null)} label={visiblePanel === "renters" ? "Choose renters" : "Suggested destinations"} side={visiblePanel === "renters" ? "right" : "left"}>
      {visiblePanel === "destination" ? <div className="search-popover-scroll"><h3>Suggested destinations</h3>
        <button type="button" className="destination-option" onClick={() => navigator.geolocation?.getCurrentPosition(() => chooseDestination("Metro Manila"))}><span className="destination-icon"><Navigation size={22} /></span><span><strong>Nearby</strong><small>Find rentals around your current area</small></span></button>
        {state.recentSearches.length > 0 && state.recentSearches.slice(0, 2).map((item) => <button type="button" className="destination-option" key={`recent-${item}`} onClick={() => chooseDestination(item)}><span className="destination-icon"><MapPin size={21} /></span><span><strong>{item}</strong><small>Recent search</small></span></button>)}
        {suggestions.map((item) => { const { Icon, copy } = suggestionMeta(item); return <button type="button" className="destination-option" key={item} onClick={() => chooseDestination(item)}><span className="destination-icon"><Icon size={21} /></span><span><strong>{item}</strong><small>{copy}</small></span></button>; })}
        {suggestions.length === 0 && <div className="destination-empty"><MapPin size={20} /><span><strong>No matching area yet</strong><small>Try a Metro Manila city, neighborhood, campus, or station.</small></span></div>}
      </div> :
      <div className="renter-popover"><Counter label="Adults" helper="Ages 13 or above" min={1} value={search.adults} onChange={(adults) => setSearch({ ...search, adults })} /><Counter label="Children" helper="Ages 2 – 12" value={search.children} onChange={(children) => setSearch({ ...search, children })} /><Counter label="Infants" helper="Under 2" value={infants} onChange={setInfants} /><Counter label="Pets" helper="Bringing a pet?" value={search.pets} onChange={(pets) => setSearch({ ...search, pets })} /></div>
      }
    </SearchPopover>
  </div>;
}
