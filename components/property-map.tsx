"use client";

import Map, { AttributionControl, Layer, Marker, NavigationControl, Source, type MapRef } from "react-map-gl/maplibre";
import type { StyleSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import { compactPeso } from "@/lib/finance";
import { listings as allListings } from "@/lib/listings";
import type { RentalListing } from "@/lib/types";

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    positron: {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
      maxzoom: 19,
    },
  },
  layers: [{ id: "positron", type: "raster", source: "positron", minzoom: 0, maxzoom: 19 }],
};

function focusedCityArea(listings: RentalListing[], city?: string | null) {
  const cityListings = city ? listings.filter((item) => item.city === city) : [];
  if (!cityListings.length) return null;
  const lngs = cityListings.map((item) => item.longitude); const lats = cityListings.map((item) => item.latitude);
  const west = Math.min(...lngs); const east = Math.max(...lngs); const south = Math.min(...lats); const north = Math.max(...lats);
  const lngPad = Math.max((east - west) * .28, .01); const latPad = Math.max((north - south) * .28, .008);
  const ring = [[west - lngPad, south - latPad], [east + lngPad, south - latPad], [east + lngPad, north + latPad], [west - lngPad, north + latPad], [west - lngPad, south - latPad]];
  return { type: "Feature" as const, properties: { city }, geometry: { type: "Polygon" as const, coordinates: [ring] } };
}

function listingBounds(listings: RentalListing[]): [[number, number], [number, number]] | null {
  if (!listings.length) return null;
  const lngs = listings.map((item) => item.longitude); const lats = listings.map((item) => item.latitude);
  const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs); const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
  if (minLng === maxLng && minLat === maxLat) return [[minLng - .012, minLat - .009], [maxLng + .012, maxLat + .009]];
  return [[minLng, minLat], [maxLng, maxLat]];
}

export function PropertyMap({ listings, selectedId, onSelect, focusedCity, boundaryListings = allListings }: { listings: RentalListing[]; selectedId?: string | null; onSelect?: (listing: RentalListing) => void; focusedCity?: string | null; boundaryListings?: RentalListing[] }) {
  const mapRef = useRef<MapRef>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const bounds = useMemo(() => listingBounds(listings), [listings]);
  const inferredCity = focusedCity ?? (listings.length && listings.every((item) => item.city === listings[0].city) ? listings[0].city : null);
  const cityArea = useMemo(() => focusedCityArea(boundaryListings, inferredCity), [boundaryListings, inferredCity]);
  const cityBounds = useMemo<[[number, number], [number, number]] | null>(() => {
    const ring = cityArea?.geometry.coordinates[0];
    if (!ring) return null;
    const lngs = ring.map(([lng]) => lng); const lats = ring.map(([, lat]) => lat);
    return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
  }, [cityArea]);
  useEffect(() => { const target = cityBounds ?? bounds; if (target) mapRef.current?.fitBounds(target, { padding: 54, maxZoom: 12, duration: 650 }); }, [bounds, cityBounds]);
  useEffect(() => { const selected = listings.find((item) => item.id === selectedId); if (selected) mapRef.current?.easeTo({ center: [selected.longitude, selected.latitude], duration: 500 }); }, [selectedId, listings]);
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(shell);
    requestAnimationFrame(() => mapRef.current?.resize());
    return () => observer.disconnect();
  }, []);

  const collapseAttribution = () => requestAnimationFrame(() => {
    const attribution = mapRef.current?.getContainer().querySelector<HTMLDetailsElement>(".maplibregl-ctrl-attrib");
    attribution?.removeAttribute("open");
    attribution?.classList.remove("maplibregl-compact-show");
  });

  return <div ref={shellRef} className="map-shell"><Map ref={mapRef} initialViewState={{ longitude: 121.01, latitude: 14.5995, zoom: 11 }} mapStyle={MAP_STYLE} attributionControl={false} onLoad={collapseAttribution} aria-label="Map of Metro Manila rentals">
    <AttributionControl compact customAttribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>' />
    <NavigationControl position="top-right" showCompass={false} />
    {cityArea && <Source id="focused-city" type="geojson" data={cityArea}><Layer id="focused-city-fill" type="fill" paint={{ "fill-color": "#9ab69a", "fill-opacity": .2 }} /><Layer id="focused-city-halo" type="line" paint={{ "line-color": "#fffdf8", "line-width": 7, "line-opacity": .92, "line-blur": .4 }} /><Layer id="focused-city-outline" type="line" paint={{ "line-color": "#173f35", "line-width": 3.5, "line-opacity": 1 }} /></Source>}
    {listings.map((listing) => <Marker key={listing.id} className={selectedId === listing.id ? "selected-price-marker" : ""} latitude={listing.latitude} longitude={listing.longitude} anchor="center" onClick={(event) => { event.originalEvent.stopPropagation(); onSelect?.(listing); }}><button type="button" className={`price-marker ${selectedId === listing.id ? "selected" : ""}`} aria-label={`${listing.title}, ${compactPeso(listing.monthlyRent)} monthly`}>{compactPeso(listing.monthlyRent)}</button></Marker>)}
  </Map></div>;
}
