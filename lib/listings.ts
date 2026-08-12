import type { GenderPolicy, MetroCity, RentalHost, RentalListing, RentalType } from "./types";

type CitySeed = { city: MetroCity; count: number; lat: number; lng: number; neighborhoods: string[]; anchors: string[]; factor: number };
const citySeeds: CitySeed[] = [
  { city: "Quezon City", count: 14, lat: 14.6507, lng: 121.0494, neighborhoods: ["Katipunan", "Diliman", "Cubao", "Eastwood", "Commonwealth", "Fairview"], anchors: ["UP Diliman", "Ateneo de Manila", "Araneta City"], factor: 1.05 },
  { city: "Manila", count: 12, lat: 14.5995, lng: 120.9842, neighborhoods: ["Malate", "Sampaloc", "Ermita", "Taft", "Intramuros", "Tondo"], anchors: ["DLSU Manila", "University of Santo Tomas", "LRT Pedro Gil"], factor: 1 },
  { city: "Makati", count: 9, lat: 14.5547, lng: 121.0244, neighborhoods: ["Poblacion", "Salcedo Village", "Legazpi Village", "Bel-Air", "Pio del Pilar"], anchors: ["Ayala Triangle", "Greenbelt", "MRT Ayala"], factor: 1.55 },
  { city: "Taguig", count: 9, lat: 14.5176, lng: 121.0509, neighborhoods: ["BGC", "McKinley Hill", "Pembo", "Lower Bicutan"], anchors: ["Bonifacio High Street", "Market Market", "Venice Grand Canal"], factor: 1.45 },
  { city: "Pasig", count: 8, lat: 14.5764, lng: 121.0851, neighborhoods: ["Ortigas Center", "Kapitolyo", "Caniogan", "Rosario"], anchors: ["Ortigas Center", "Estancia", "MRT Shaw"], factor: 1.2 },
  { city: "Mandaluyong", count: 7, lat: 14.5794, lng: 121.0359, neighborhoods: ["Greenfield", "Highway Hills", "Wack-Wack", "Barangka"], anchors: ["Greenfield District", "MRT Shaw", "SM Megamall"], factor: 1.18 },
  { city: "Pasay", count: 7, lat: 14.5378, lng: 120.9896, neighborhoods: ["MOA Complex", "Newport City", "Libertad", "Cartimar"], anchors: ["Mall of Asia", "NAIA Terminal 3", "LRT Gil Puyat"], factor: 1.2 },
  { city: "Parañaque", count: 6, lat: 14.4793, lng: 121.0198, neighborhoods: ["Aseana City", "BF Homes", "Don Bosco", "Bicutan"], anchors: ["Ayala Malls Manila Bay", "NAIA Terminal 1", "SM Bicutan"], factor: 1.08 },
  { city: "Muntinlupa", count: 5, lat: 14.4081, lng: 121.0415, neighborhoods: ["Alabang", "Filinvest City", "Cupang", "Sucat"], anchors: ["Festival Mall", "Alabang Town Center", "Asian Hospital"], factor: 1.12 },
  { city: "Caloocan", count: 4, lat: 14.7566, lng: 121.045, neighborhoods: ["Monumento", "Grace Park", "Bagong Silang"], anchors: ["LRT Monumento", "University of Caloocan", "SM Grand Central"], factor: .78 },
  { city: "Las Piñas", count: 4, lat: 14.4445, lng: 120.9939, neighborhoods: ["Pilar Village", "Almanza", "Pamplona"], anchors: ["SM Southmall", "University of Perpetual Help", "Alabang-Zapote Road"], factor: .92 },
  { city: "Marikina", count: 4, lat: 14.6507, lng: 121.1029, neighborhoods: ["Marikina Heights", "Concepcion", "Sto. Niño"], anchors: ["Marikina Sports Center", "LRT Marikina-Pasig", "Riverbanks Center"], factor: .84 },
  { city: "San Juan", count: 3, lat: 14.6019, lng: 121.0355, neighborhoods: ["Greenhills", "Little Baguio", "Balong-Bato"], anchors: ["Greenhills Mall", "Xavier School", "Santolan Town Plaza"], factor: 1.18 },
  { city: "Valenzuela", count: 3, lat: 14.7011, lng: 120.983, neighborhoods: ["Karuhatan", "Malinta", "Marulas"], anchors: ["Valenzuela Gateway Complex", "Our Lady of Fatima University", "People's Park"], factor: .72 },
  { city: "Malabon", count: 2, lat: 14.6681, lng: 120.9658, neighborhoods: ["Potrero", "Concepcion"], anchors: ["Malabon City Square", "DLSAU", "Monumento"], factor: .7 },
  { city: "Navotas", count: 2, lat: 14.6732, lng: 120.935, neighborhoods: ["San Jose", "Tangos"], anchors: ["Navotas City Hall", "C-4 Road", "North Bay Boulevard"], factor: .68 },
  { city: "Pateros", count: 1, lat: 14.544, lng: 121.0674, neighborhoods: ["San Roque"], anchors: ["Pateros Town Plaza", "BGC", "Pasig River Ferry"], factor: .82 },
];

const typeAllocation: RentalType[] = [
  ...Array<RentalType>(26).fill("condo"), ...Array<RentalType>(22).fill("apartment"), ...Array<RentalType>(14).fill("studio"),
  ...Array<RentalType>(10).fill("house"), ...Array<RentalType>(12).fill("dorm"), ...Array<RentalType>(10).fill("bedspace"), ...Array<RentalType>(6).fill("private-room"),
];
const typeLabel: Record<RentalType, string> = { condo: "Condo", apartment: "Apartment", studio: "Studio", house: "Townhome", dorm: "Dorm room", bedspace: "Bedspace", "private-room": "Private room" };
const baseRent: Record<RentalType, number> = { condo: 25000, apartment: 19000, studio: 15000, house: 36000, dorm: 10500, bedspace: 6500, "private-room": 9000 };
const hostNames = ["Maya Santos", "Paolo Reyes", "Trina Villanueva", "Carlo Mendoza", "Aya Navarro", "Miguel Lim", "Bea Castillo", "Nico Garcia", "Samira Cruz", "Luis de Guzman"];
const reviewAuthors = ["Andrea", "Joshua", "Bea", "Marco", "Lianne", "Paolo", "Mika", "Rafael"];
const allAmenities = ["Wi-Fi", "Air conditioning", "Kitchen", "Washer", "Security", "Elevator", "Gym", "Pool", "Study area", "Backup power", "Hot shower", "CCTV"];
const descriptors = ["Sunlit", "Quiet", "Fresh", "Corner", "City-view", "Relaxed", "Well-planned", "Airy"];

const hosts: RentalHost[] = hostNames.map((name, index) => ({ id: `host-${index + 1}`, name, avatar: `/images/hosts/host-${String(index + 1).padStart(2, "0")}.jpg`, verified: true, yearsHosting: 2 + (index % 7), responseRate: 93 + (index % 7), responseTime: index % 3 === 0 ? "within an hour" : "within a few hours" }));
const seeded = (index: number, salt: number) => ((index * 9301 + salt * 49297 + 233280) % 233280) / 233280;
const pad = (value: number) => String(value).padStart(3, "0");

let globalIndex = 0;
export const listings: RentalListing[] = citySeeds.flatMap((citySeed) => Array.from({ length: citySeed.count }, (_, cityIndex) => {
  const index = globalIndex++;
  const type = typeAllocation[index];
  const neighborhood = citySeed.neighborhoods[cityIndex % citySeed.neighborhoods.length];
  const building = `${["Amihan", "Luntian", "Sampaguita", "Habagat", "Narra", "Liwayway", "Tahanan"][index % 7]} ${type === "house" ? "Homes" : type === "dorm" || type === "bedspace" ? "Residences" : "Place"}`;
  const monthlyRent = Math.round(baseRent[type] * citySeed.factor * (0.88 + seeded(index, 2) * .28) / 500) * 500;
  const isShared = type === "dorm" || type === "bedspace" || type === "private-room";
  const bedrooms = type === "studio" || type === "bedspace" ? 0 : type === "house" ? 2 + (index % 3) : 1 + (type === "apartment" && index % 4 === 0 ? 1 : 0);
  const beds = type === "bedspace" ? 1 : type === "dorm" ? 1 + (index % 2) : Math.max(1, bedrooms);
  const capacity = type === "bedspace" ? 1 : type === "dorm" ? 2 : Math.max(2, beds + (type === "house" ? 2 : 0));
  const groupStart = Math.floor(index / 4) * 4;
  const cover = `/images/rentals/rental-${pad(index + 1)}.jpg`;
  const gallery = [cover, ...Array.from({ length: 4 }, (_, offset) => `/images/rentals/rental-${pad(Math.min(100, groupStart + offset + 1))}.jpg`)].filter((value, position, array) => array.indexOf(value) === position);
  while (gallery.length < 5) gallery.push(`/images/rentals/building-${String(Math.floor(index / 4) + 1).padStart(2, "0")}.jpg`);
  const genderPolicy: GenderPolicy = type === "dorm" || type === "bedspace" ? (index % 2 ? "women only" : "men only") : "any";
  const amenities = allAmenities.filter((_, amenityIndex) => amenityIndex < 5 || seeded(index, amenityIndex) > .42).slice(0, 8 + index % 4);
  const nearby = citySeed.anchors.map((name, anchorIndex) => ({ name, kind: anchorIndex === 0 ? (name.includes("University") || name.includes("DLS") || name.includes("Ateneo") || name.includes("UP ") ? "university" as const : "landmark" as const) : anchorIndex === 1 ? "business" as const : "transit" as const, minutes: 4 + Math.floor(seeded(index, anchorIndex + 20) * 16) }));
  const rating = Number((4.62 + seeded(index, 44) * .34).toFixed(2));
  const reviewCount = 7 + Math.floor(seeded(index, 51) * 112);
  return {
    id: `KUBO-${pad(index + 1)}`, slug: `${neighborhood.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${type}-${pad(index + 1)}`,
    title: `${descriptors[index % descriptors.length]} ${typeLabel[type]} in ${neighborhood}`,
    description: `${isShared ? "A comfortable, thoughtfully managed space" : "A well-kept long-term home"} in ${neighborhood}, close to daily essentials and major destinations. The layout makes everyday routines easy, with practical storage, reliable connectivity, and responsive local hosting.`,
    type, city: citySeed.city, neighborhood, address: `${20 + index} ${building} Street, ${neighborhood}, ${citySeed.city}`,
    latitude: Number((citySeed.lat + (seeded(index, 7) - .5) * .028).toFixed(6)), longitude: Number((citySeed.lng + (seeded(index, 8) - .5) * .028).toFixed(6)),
    monthlyRent, associationDues: type === "condo" ? 2200 + (index % 5) * 450 : 0, utilitiesEstimate: 1800 + (index % 6) * 400,
    depositMonths: 1, advanceMonths: 1, availableFrom: `2026-${String(9 + (index % 4)).padStart(2, "0")}-${String(1 + (index % 20)).padStart(2, "0")}`,
    minimumLeaseMonths: ([3, 6, 12] as const)[index % 3], bedrooms, beds, bathrooms: type === "house" ? 2 : 1, floorArea: isShared ? 12 + (index % 8) : type === "house" ? 72 + (index % 7) * 8 : 24 + (index % 9) * 5,
    capacity, furnishing: index % 5 === 0 ? "semi-furnished" : index % 7 === 0 ? "unfurnished" : "fully furnished", genderPolicy,
    parking: !isShared && index % 3 !== 0, petsAllowed: !isShared && index % 4 === 0, accessible: type === "condo" && index % 3 !== 0,
    amenities, houseRules: ["No smoking indoors", "Quiet hours after 10 PM", "Registered residents only", ...(type === "dorm" || type === "bedspace" ? ["Observe residence visitor hours"] : [])], gallery,
    rating, reviewCount, reviews: [0, 1, 2].map((reviewIndex) => ({ id: `${pad(index + 1)}-${reviewIndex}`, author: reviewAuthors[(index + reviewIndex) % reviewAuthors.length], date: ["July 2026", "May 2026", "February 2026"][reviewIndex], rating: reviewIndex === 2 && index % 5 === 0 ? 4 : 5, text: ["The home matched the photos and the neighborhood was easy to settle into.", "Responsive host, reliable Wi-Fi, and a very practical location for work and errands.", "Move-in was organized and the space felt comfortable from the first week."][reviewIndex] })),
    host: hosts[index % hosts.length], nearby, badge: index % 11 === 0 ? "New" : index % 5 === 0 ? "Great value" : index % 3 === 0 ? "Guest favorite" : undefined,
  } satisfies RentalListing;
}));

export const metroCities = citySeeds.map((seed) => seed.city);
export const destinationSuggestions = citySeeds.flatMap((seed) => [seed.city, ...seed.neighborhoods, ...seed.anchors]).filter((value, index, values) => values.indexOf(value) === index);
export const getListing = (idOrSlug: string) => listings.find((listing) => listing.id === idOrSlug || listing.slug === idOrSlug);
export const listingTypeLabels = typeLabel;
