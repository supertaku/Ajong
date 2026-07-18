import type { AreaGroup, Listing, MoveInTiming, Priority, PropertyType, SellerSubmission } from "./types";

type LocationSeed = {
  city: string;
  areaGroup: AreaGroup;
  latitude: number;
  longitude: number;
  priceFactor: number;
  commute: Listing["commuteMinutes"];
};

const locations: LocationSeed[] = [
  { city: "Quezon City", areaGroup: "Metro Manila", latitude: 14.676, longitude: 121.0437, priceFactor: 1.08, commute: { Makati: 52, BGC: 58, Ortigas: 39, "Quezon City": 18, Alabang: 86 } },
  { city: "Marikina", areaGroup: "Metro Manila", latitude: 14.6507, longitude: 121.1029, priceFactor: 0.96, commute: { Makati: 58, BGC: 54, Ortigas: 37, "Quezon City": 31, Alabang: 88 } },
  { city: "Pasig", areaGroup: "Metro Manila", latitude: 14.5764, longitude: 121.0851, priceFactor: 1.15, commute: { Makati: 38, BGC: 31, Ortigas: 18, "Quezon City": 45, Alabang: 68 } },
  { city: "Mandaluyong", areaGroup: "Metro Manila", latitude: 14.5794, longitude: 121.0359, priceFactor: 1.2, commute: { Makati: 27, BGC: 32, Ortigas: 16, "Quezon City": 41, Alabang: 61 } },
  { city: "Parañaque", areaGroup: "Metro Manila", latitude: 14.4793, longitude: 121.0198, priceFactor: 1.06, commute: { Makati: 39, BGC: 38, Ortigas: 52, "Quezon City": 73, Alabang: 31 } },
  { city: "Las Piñas", areaGroup: "Metro Manila", latitude: 14.4445, longitude: 120.9939, priceFactor: 0.98, commute: { Makati: 47, BGC: 49, Ortigas: 64, "Quezon City": 82, Alabang: 24 } },
  { city: "Muntinlupa", areaGroup: "Metro Manila", latitude: 14.4081, longitude: 121.0415, priceFactor: 1.02, commute: { Makati: 50, BGC: 48, Ortigas: 68, "Quezon City": 88, Alabang: 15 } },
  { city: "Caloocan", areaGroup: "Metro Manila", latitude: 14.7566, longitude: 121.045, priceFactor: 0.9, commute: { Makati: 68, BGC: 74, Ortigas: 55, "Quezon City": 29, Alabang: 101 } },
  { city: "Antipolo", areaGroup: "Rizal", latitude: 14.5863, longitude: 121.1754, priceFactor: 0.82, commute: { Makati: 68, BGC: 63, Ortigas: 47, "Quezon City": 55, Alabang: 92 } },
  { city: "Cainta", areaGroup: "Rizal", latitude: 14.5786, longitude: 121.1222, priceFactor: 0.86, commute: { Makati: 58, BGC: 52, Ortigas: 36, "Quezon City": 49, Alabang: 84 } },
  { city: "Bacoor", areaGroup: "Cavite", latitude: 14.4129, longitude: 120.9737, priceFactor: 0.76, commute: { Makati: 64, BGC: 67, Ortigas: 82, "Quezon City": 98, Alabang: 36 } },
  { city: "Imus", areaGroup: "Cavite", latitude: 14.4297, longitude: 120.9367, priceFactor: 0.7, commute: { Makati: 76, BGC: 79, Ortigas: 94, "Quezon City": 111, Alabang: 45 } },
  { city: "Santa Rosa", areaGroup: "Laguna", latitude: 14.2843, longitude: 121.0889, priceFactor: 0.74, commute: { Makati: 79, BGC: 76, Ortigas: 94, "Quezon City": 113, Alabang: 43 } },
  { city: "Biñan", areaGroup: "Laguna", latitude: 14.3427, longitude: 121.0807, priceFactor: 0.71, commute: { Makati: 71, BGC: 70, Ortigas: 88, "Quezon City": 106, Alabang: 35 } },
  { city: "San Jose del Monte", areaGroup: "Bulacan", latitude: 14.8139, longitude: 121.0453, priceFactor: 0.62, commute: { Makati: 96, BGC: 103, Ortigas: 83, "Quezon City": 52, Alabang: 128 } },
  { city: "Malolos", areaGroup: "Bulacan", latitude: 14.8527, longitude: 120.816, priceFactor: 0.66, commute: { Makati: 98, BGC: 106, Ortigas: 89, "Quezon City": 72, Alabang: 132 } },
];

const typeSeeds: Record<PropertyType, { basePrice: number; image: string; label: string }> = {
  condo: { basePrice: 5_400_000, image: "/images/property-condo.png", label: "Condo" },
  townhouse: { basePrice: 6_600_000, image: "/images/property-townhouse.png", label: "Townhouse" },
  house: { basePrice: 8_200_000, image: "/images/property-house.png", label: "House" },
};

const titles = {
  condo: ["Garden-view", "Sunlit", "Family-ready"],
  townhouse: ["Tree-lined", "Practical", "Warm modern"],
  house: ["Leafy", "Roomy", "Quiet-corner"],
};
const moveIns: MoveInTiming[] = ["ready", "within-year", "pre-selling"];
const prioritySets: Priority[][] = [
  ["transit", "accessibility", "proximity"],
  ["space", "parking", "quiet"],
  ["space", "parking", "proximity"],
];

export const listings: Listing[] = locations.flatMap((location, locationIndex) =>
  (["condo", "townhouse", "house"] as PropertyType[]).map((propertyType, typeIndex) => {
    const seed = typeSeeds[propertyType];
    const variation = 1 + ((locationIndex + typeIndex) % 5) * 0.035;
    const price = Math.round(seed.basePrice * location.priceFactor * variation / 50_000) * 50_000;
    const bedrooms = propertyType === "condo" ? 1 + (locationIndex % 2) : propertyType === "townhouse" ? 3 : 3 + (locationIndex % 2);
    const floorArea = propertyType === "condo" ? 42 + (locationIndex % 4) * 9 : propertyType === "townhouse" ? 78 + (locationIndex % 4) * 12 : 105 + (locationIndex % 5) * 17;
    const role = locationIndex % 4 === 0 ? "owner" : locationIndex % 3 === 0 ? "accredited-salesperson" : "licensed-broker";
    return {
      id: `${location.city.toLowerCase().replaceAll(" ", "-").replaceAll("ñ", "n")}-${propertyType}`,
      title: `${titles[propertyType][locationIndex % 3]} ${bedrooms}BR ${seed.label} in ${location.city}`,
      city: location.city,
      areaGroup: location.areaGroup,
      propertyType,
      price,
      bedrooms,
      bathrooms: Math.max(1, bedrooms - (propertyType === "condo" ? 1 : 0)),
      floorArea,
      lotArea: propertyType === "condo" ? undefined : propertyType === "townhouse" ? 55 + (locationIndex % 3) * 12 : 90 + (locationIndex % 4) * 25,
      parking: propertyType === "condo" ? locationIndex % 2 : 1 + (propertyType === "house" && locationIndex % 4 === 0 ? 1 : 0),
      latitude: location.latitude + (typeIndex - 1) * 0.004,
      longitude: location.longitude + (typeIndex - 1) * 0.004,
      image: seed.image,
      moveIn: moveIns[(locationIndex + typeIndex) % moveIns.length],
      priorities: prioritySets[typeIndex],
      commuteMinutes: location.commute,
      seller: {
        id: `seller-${locationIndex}-${typeIndex}`,
        name: role === "owner" ? `Property owner ${locationIndex + 1}` : `${role === "licensed-broker" ? "Listing broker" : "Salesperson"} ${locationIndex + 1}`,
        role,
        prcNumber: role === "owner" ? undefined : String(4100 + locationIndex * 3 + typeIndex).padStart(5, "0"),
      },
      verification: {
        identity: "demo-checked",
        authorityToSell: locationIndex % 5 === 0 ? "needs-review" : "demo-checked",
        professionalCredential: role === "owner" ? "not-provided" : "demo-checked",
        projectLicense: propertyType === "condo" && locationIndex % 4 !== 0 ? "demo-checked" : "not-provided",
        note: "Confirm every document with the issuing office before making a payment or commitment.",
      },
      description: `A family-focused ${propertyType} in ${location.city} with clear price, space, timing, and daily-living details for comparison.`,
      monthlyDues: propertyType === "condo" ? 3_500 + (locationIndex % 4) * 900 : propertyType === "townhouse" ? 1_200 : undefined,
      tour: undefined,
      demo: true,
    } satisfies Listing;
  }),
);

export const getListing = (id: string) => listings.find((listing) => listing.id === id);

export const sampleSellerSubmission: SellerSubmission = {
  id: "SUB-1042",
  sellerRole: "licensed-broker",
  sellerName: "Maya Santos",
  propertyType: "townhouse",
  city: "Antipolo",
  areaGroup: "Rizal",
  price: 6_450_000,
  bedrooms: 3,
  bathrooms: 2,
  floorArea: 92,
  mediaFiles: ["front-exterior.jpg", "living-room.jpg"],
  evidenceFiles: ["authority-to-sell.pdf", "title-copy.pdf"],
  prcNumber: "04217",
  dhsudNumber: "",
  disclosuresAccepted: true,
  submittedAt: "2026-07-18T04:00:00.000Z",
};
