import fs from "node:fs/promises";
import path from "node:path";
import polygonClipping from "polygon-clipping";

const SOURCE_URL = new URL("https://ulap-nga.georisk.gov.ph/arcgis/rest/services/PSA/MunicipalPopMF/MapServer/2/query");
SOURCE_URL.search = new URLSearchParams({
  where: "reg_code='130000000'",
  outFields: "city_name,psgc_10d",
  returnGeometry: "true",
  outSR: "4326",
  f: "geojson",
}).toString();

const CITY_CODES = {
  "1380100000": "Caloocan",
  "1380200000": "Las Piñas",
  "1380300000": "Makati",
  "1380400000": "Malabon",
  "1380500000": "Mandaluyong",
  "1380600000": "Manila",
  "1380700000": "Marikina",
  "1380800000": "Muntinlupa",
  "1380900000": "Navotas",
  "1381000000": "Parañaque",
  "1381100000": "Pasay",
  "1381200000": "Pasig",
  "1381300000": "Quezon City",
  "1381400000": "San Juan",
  "1381500000": "Taguig",
  "1381600000": "Valenzuela",
  "1381701000": "Pateros",
};

function cityCode(psgc) {
  return psgc.startsWith("13806") ? "1380600000" : psgc;
}

function asMultiPolygon(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

const response = await fetch(SOURCE_URL, { headers: { "User-Agent": "Kubo boundary asset builder" } });
if (!response.ok) throw new Error(`Boundary download failed: ${response.status} ${response.statusText}`);

const source = await response.json();
const grouped = new Map();
for (const feature of source.features) {
  const code = cityCode(String(feature.properties.psgc_10d));
  if (!CITY_CODES[code]) continue;
  const polygons = asMultiPolygon(feature.geometry);
  grouped.set(code, grouped.has(code) ? polygonClipping.union(grouped.get(code), polygons) : polygons);
}

const missing = Object.keys(CITY_CODES).filter((code) => !grouped.has(code));
if (missing.length) throw new Error(`Missing city boundaries: ${missing.join(", ")}`);

const output = {
  type: "FeatureCollection",
  metadata: {
    source: "GeoRisk Philippines / PSA Municipal Boundary layer",
    sourceUrl: "https://ulap-nga.georisk.gov.ph/arcgis/rest/services/PSA/MunicipalPopMF/MapServer/2",
    generated: new Date().toISOString().slice(0, 10),
  },
  features: Object.entries(CITY_CODES).map(([code, name]) => ({
    type: "Feature",
    properties: { name, psgc: code },
    geometry: { type: "MultiPolygon", coordinates: grouped.get(code) },
  })),
};

const destination = path.join(process.cwd(), "public", "data", "metro-manila-cities.json");
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, JSON.stringify(output));
console.log(`Wrote ${output.features.length} city boundaries to ${destination}`);
