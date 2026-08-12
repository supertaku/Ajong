export type MetroCity = "Quezon City" | "Manila" | "Makati" | "Taguig" | "Pasig" | "Mandaluyong" | "Pasay" | "Parañaque" | "Muntinlupa" | "Caloocan" | "Las Piñas" | "Marikina" | "San Juan" | "Valenzuela" | "Malabon" | "Navotas" | "Pateros";
export type RentalType = "condo" | "apartment" | "studio" | "house" | "dorm" | "bedspace" | "private-room";
export type Furnishing = "fully furnished" | "semi-furnished" | "unfurnished";
export type GenderPolicy = "any" | "women only" | "men only";

export interface NearbyPlace { name: string; kind: "transit" | "university" | "business" | "landmark"; minutes: number; }
export interface RentalReview { id: string; author: string; date: string; rating: number; text: string; }
export interface RentalHost { id: string; name: string; avatar: string; verified: boolean; yearsHosting: number; responseRate: number; responseTime: string; }

export interface RentalListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: RentalType;
  city: MetroCity;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  monthlyRent: number;
  associationDues: number;
  utilitiesEstimate: number;
  depositMonths: number;
  advanceMonths: number;
  availableFrom: string;
  minimumLeaseMonths: 3 | 6 | 12;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  floorArea: number;
  capacity: number;
  furnishing: Furnishing;
  genderPolicy: GenderPolicy;
  parking: boolean;
  petsAllowed: boolean;
  accessible: boolean;
  amenities: string[];
  houseRules: string[];
  gallery: string[];
  rating: number;
  reviewCount: number;
  reviews: RentalReview[];
  host: RentalHost;
  nearby: NearbyPlace[];
  badge?: "Guest favorite" | "New" | "Great value";
}

export interface SearchState { destination: string; moveIn: string; leaseMonths: number; adults: number; children: number; pets: number; }
export interface RentalFilters {
  minPrice: number;
  maxPrice: number;
  types: RentalType[];
  bedrooms: number;
  beds: number;
  bathrooms: number;
  furnishing: Furnishing | "any";
  amenities: string[];
  parking: boolean;
  pets: boolean;
  accessible: boolean;
  genderPolicy: GenderPolicy | "any";
}
export interface Wishlist { id: string; name: string; listingIds: string[]; createdAt: string; }
export interface Reservation {
  id: string;
  listingId: string;
  moveIn: string;
  leaseMonths: number;
  adults: number;
  children: number;
  pets: number;
  holdingDeposit: number;
  serviceFee: number;
  amountPaid: number;
  status: "confirmed";
  createdAt: string;
}
export interface HostInterest { name: string; email: string; phone: string; city: MetroCity; propertyType: RentalType; }
