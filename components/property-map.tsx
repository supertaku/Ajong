"use client";

import { divIcon, latLngBounds } from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { compactPeso } from "@/lib/finance";
import type { RentalListing } from "@/lib/types";

function MapSync({ listings, selectedId }: { listings: RentalListing[]; selectedId?: string | null }) {
  const map = useMap();
  useEffect(() => { if (listings.length) map.fitBounds(latLngBounds(listings.map((item) => [item.latitude, item.longitude])), { padding: [40, 40], maxZoom: 12 }); }, [listings, map]);
  useEffect(() => { const selected = listings.find((item) => item.id === selectedId); if (selected) map.panTo([selected.latitude, selected.longitude], { animate: true }); }, [selectedId, listings, map]);
  return null;
}
function ZoomWatcher({ onZoom }: { onZoom: (zoom: number) => void }) { useMapEvents({ zoomend: (event) => onZoom(event.target.getZoom()) }); return null; }

export function PropertyMap({ listings, selectedId, onSelect }: { listings: RentalListing[]; selectedId?: string | null; onSelect?: (listing: RentalListing) => void }) {
  const [zoom, setZoom] = useState(11);
  const cityGroups = useMemo(() => Object.values(listings.reduce<Record<string, RentalListing[]>>((groups, listing) => { (groups[listing.city] ??= []).push(listing); return groups; }, {})), [listings]);
  return <div className="map-shell"><MapContainer center={[14.5995, 121.01]} zoom={11} scrollWheelZoom className="leaflet-map" aria-label="Map of Metro Manila rentals"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><ZoomWatcher onZoom={setZoom} /><MapSync listings={listings} selectedId={selectedId} />
    {zoom < 12 ? cityGroups.map((group) => { const lat = group.reduce((sum, item) => sum + item.latitude, 0) / group.length; const lng = group.reduce((sum, item) => sum + item.longitude, 0) / group.length; return <Marker key={group[0].city} position={[lat, lng]} icon={divIcon({ className: "", html: `<div class="city-marker"><strong>${group.length}</strong><span>${group[0].city}</span></div>`, iconSize: [100, 46], iconAnchor: [50, 23] })} eventHandlers={{ click: () => onSelect?.(group[0]) }} />; }) : listings.map((listing) => <Marker key={listing.id} position={[listing.latitude, listing.longitude]} icon={divIcon({ className: "", html: `<div class="price-marker ${selectedId === listing.id ? "selected" : ""}">${compactPeso(listing.monthlyRent)}</div>`, iconSize: [72, 34], iconAnchor: [36, 17] })} eventHandlers={{ click: () => onSelect?.(listing) }} />)}
  </MapContainer></div>;
}
