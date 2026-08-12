"use client";

import Map, { AttributionControl, Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import type { StyleSpecification } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { compactPeso } from "@/lib/finance";
import type { RentalListing } from "@/lib/types";

type Position = [number, number];
type CityGeometry = { type: "Polygon"; coordinates: Position[][] } | { type: "MultiPolygon"; coordinates: Position[][][] };
type CityFeature = { type: "Feature"; properties: { name: string; psgc: string }; geometry: CityGeometry };
type CityBoundaries = { type: "FeatureCollection"; features: CityFeature[] };

let cityBoundariesRequest: Promise<CityBoundaries> | null = null;

function loadCityBoundaries() {
  cityBoundariesRequest ??= fetch("/data/metro-manila-cities.json").then((response) => {
    if (!response.ok) throw new Error(`Could not load city boundaries (${response.status})`);
    return response.json() as Promise<CityBoundaries>;
  });
  return cityBoundariesRequest;
}

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    voyager: {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
      maxzoom: 20,
    },
  },
  layers: [{ id: "voyager", type: "raster", source: "voyager", minzoom: 0, maxzoom: 20 }],
};

function geometryBounds(geometry: CityGeometry): [[number, number], [number, number]] {
  const positions = geometry.type === "Polygon" ? geometry.coordinates.flat() : geometry.coordinates.flat(2);
  const lngs = positions.map(([lng]) => lng);
  const lats = positions.map(([, lat]) => lat);
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}

function listingBounds(listings: RentalListing[]): [[number, number], [number, number]] | null {
  if (!listings.length) return null;
  const lngs = listings.map((item) => item.longitude); const lats = listings.map((item) => item.latitude);
  const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs); const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
  if (minLng === maxLng && minLat === maxLat) return [[minLng - .012, minLat - .009], [maxLng + .012, maxLat + .009]];
  return [[minLng, minLat], [maxLng, maxLat]];
}

export function PropertyMap({ listings, selectedId, onSelect, focusedCity }: { listings: RentalListing[]; selectedId?: string | null; onSelect?: (listing: RentalListing) => void; focusedCity?: string | null }) {
  const mapRef = useRef<MapRef>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [cityBoundaries, setCityBoundaries] = useState<CityBoundaries | null>(null);
  const bounds = useMemo(() => listingBounds(listings), [listings]);
  const inferredCity = focusedCity ?? (listings.length && listings.every((item) => item.city === listings[0].city) ? listings[0].city : null);
  const cityArea = useMemo(() => cityBoundaries?.features.find((feature) => feature.properties.name === inferredCity) ?? null, [cityBoundaries, inferredCity]);
  const cityBounds = useMemo(() => cityArea ? geometryBounds(cityArea.geometry) : null, [cityArea]);
  useEffect(() => {
    let active = true;
    loadCityBoundaries().then((data) => { if (active) setCityBoundaries(data); }).catch(() => { /* Markers remain usable if the optional overlay cannot load. */ });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const map = mapRef.current?.getMap();
    const shell = shellRef.current;
    if (!map) return;
    let overlay: HTMLCanvasElement | null = null;
    const drawBoundary = () => {
      if (!cityArea) return;
      if (!overlay) {
        overlay = document.createElement("canvas");
        overlay.classList.add("city-boundary-overlay");
        overlay.setAttribute("aria-hidden", "true");
        map.getCanvas().insertAdjacentElement("afterend", overlay);
      }
      const mapCanvas = map.getCanvas();
      const pixelRatio = window.devicePixelRatio || 1;
      overlay.width = Math.round(mapCanvas.clientWidth * pixelRatio);
      overlay.height = Math.round(mapCanvas.clientHeight * pixelRatio);
      const context = overlay.getContext("2d");
      if (!context) return;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.beginPath();
      const polygons = cityArea.geometry.type === "Polygon" ? [cityArea.geometry.coordinates] : cityArea.geometry.coordinates;
      let pointCount = 0;
      polygons.forEach((polygon) => polygon.forEach((ring) => {
        ring.forEach(([lng, lat], index) => {
          const point = map.project([lng, lat]);
          if (index) context.lineTo(point.x, point.y); else context.moveTo(point.x, point.y);
          pointCount += 1;
        });
        context.closePath();
      }));
      context.fillStyle = "rgba(201, 110, 69, .12)";
      context.fill("evenodd");
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#fffdf8";
      context.lineWidth = 8;
      context.stroke();
      context.strokeStyle = "#9f4e2f";
      context.lineWidth = 4;
      context.stroke();
      overlay.dataset.points = String(pointCount);
      if (shell) shell.dataset.focusedCity = cityArea.properties.name;
    };
    if (map.isStyleLoaded()) drawBoundary();
    else map.once("load", drawBoundary);
    map.on("move", drawBoundary);
    map.on("resize", drawBoundary);
    return () => {
      map.off("load", drawBoundary);
      map.off("move", drawBoundary);
      map.off("resize", drawBoundary);
      overlay?.remove();
      if (shell) delete shell.dataset.focusedCity;
    };
  }, [cityArea]);
  useEffect(() => { const target = cityBounds ?? bounds; if (target) mapRef.current?.fitBounds(target, { padding: 64, maxZoom: 13, duration: 650 }); }, [bounds, cityBounds]);
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

  return <div ref={shellRef} className="map-shell"><Map ref={mapRef} initialViewState={{ longitude: 121.01, latitude: 14.5995, zoom: 11 }} mapStyle={MAP_STYLE} attributionControl={false} onLoad={collapseAttribution} aria-label={cityArea ? `Map of rentals in ${cityArea.properties.name}, with the city boundary outlined` : "Map of Metro Manila rentals"}>
    <AttributionControl compact customAttribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a> · Boundaries: <a href="https://ulap-nga.georisk.gov.ph/arcgis/rest/services/PSA/MunicipalPopMF/MapServer/2">GeoRisk PH</a>' />
    <NavigationControl position="top-right" showCompass={false} />
    {listings.map((listing) => <Marker key={listing.id} className={selectedId === listing.id ? "selected-price-marker" : ""} latitude={listing.latitude} longitude={listing.longitude} anchor="center" onClick={(event) => { event.originalEvent.stopPropagation(); onSelect?.(listing); }}><button type="button" className={`price-marker ${selectedId === listing.id ? "selected" : ""}`} aria-label={`${listing.title}, ${compactPeso(listing.monthlyRent)} monthly`}>{compactPeso(listing.monthlyRent)}</button></Marker>)}
  </Map></div>;
}
