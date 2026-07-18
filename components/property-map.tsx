"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import { compactPeso } from "@/lib/finance";
import type { Listing } from "@/lib/types";

function FitResults({ listings }: { listings: Listing[] }) {
  const map = useMap();
  useEffect(() => {
    if (!listings.length) return;
    const bounds = latLngBounds(listings.map((listing) => [listing.latitude, listing.longitude]));
    map.fitBounds(bounds, { padding: [35, 35], maxZoom: 11 });
  }, [listings, map]);
  return null;
}

export function PropertyMap({ listings }: { listings: Listing[] }) {
  return (
    <div className="map-shell">
      <MapContainer center={[14.58, 121.02]} zoom={9} scrollWheelZoom className="leaflet-map" aria-label="Map of properties">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitResults listings={listings} />
        {listings.map((listing) => (
          <CircleMarker key={listing.id} center={[listing.latitude, listing.longitude]} radius={9} pathOptions={{ color: "#f5f0e4", weight: 3, fillColor: "#c96e45", fillOpacity: 1 }}>
            <Popup><div className="map-popup"><span>Demo · not for sale</span><strong>{listing.title}</strong><b>{compactPeso(listing.price)}</b><Link href={`/properties/${listing.id}`}>View details →</Link></div></Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
