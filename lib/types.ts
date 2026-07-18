export type Language = "en" | "fil";
export type Theme = "light" | "dark";
export type PropertyType = "condo" | "townhouse" | "house";
export type AreaGroup = "Metro Manila" | "Cavite" | "Laguna" | "Rizal" | "Bulacan";
export type MoveInTiming = "ready" | "within-year" | "pre-selling";
export type EvidenceStatus = "demo-checked" | "not-provided" | "needs-review";
export type Priority = "space" | "parking" | "accessibility" | "transit" | "quiet" | "proximity";

export interface TourAsset {
  kind: "video" | "point-cloud";
  status: "none" | "queued" | "processing" | "ready" | "failed";
  source?: string;
  viewer?: string;
}

export interface SellerProfile {
  id: string;
  name: string;
  role: "owner" | "licensed-broker" | "accredited-salesperson" | "developer-representative";
  prcNumber?: string;
}

export interface VerificationEvidence {
  identity: EvidenceStatus;
  authorityToSell: EvidenceStatus;
  professionalCredential: EvidenceStatus;
  projectLicense: EvidenceStatus;
  note: string;
}

export interface Listing {
  id: string;
  title: string;
  city: string;
  areaGroup: AreaGroup;
  propertyType: PropertyType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  floorArea: number;
  lotArea?: number;
  parking: number;
  latitude: number;
  longitude: number;
  image: string;
  moveIn: MoveInTiming;
  priorities: Priority[];
  commuteMinutes: Record<"Makati" | "BGC" | "Ortigas" | "Quezon City" | "Alabang", number>;
  seller: SellerProfile;
  verification: VerificationEvidence;
  description: string;
  monthlyDues?: number;
  tour?: TourAsset;
  demo: true;
}

export interface AffordabilityAssumptions {
  monthlyBudget: number;
  cashAvailable: number;
  downPaymentPercent: number;
  annualInterestRate: number;
  termYears: number;
}

export interface GuideAnswers extends AffordabilityAssumptions {
  areas: AreaGroup[];
  commuteAnchor: keyof Listing["commuteMinutes"];
  maxCommute: number;
  householdSize: number;
  minBedrooms: number;
  propertyTypes: PropertyType[];
  moveIn: MoveInTiming;
  priorities: Priority[];
}

export interface SearchFilters {
  areas: AreaGroup[];
  propertyTypes: PropertyType[];
  maxPrice: number | null;
  minBedrooms: number;
}

export interface FilterImpact {
  id: string;
  label: string;
  before: number;
  after: number;
  rankingOnly?: boolean;
}

export interface MatchBreakdown {
  location: number;
  budget: number;
  space: number;
  timing: number;
  parkingAccessibility: number;
  priorities: number;
  total: number;
  reasons: string[];
}

export interface MatchResult {
  listing: Listing;
  score: MatchBreakdown;
}

export interface SellerSubmission {
  id: string;
  sellerRole: SellerProfile["role"];
  sellerName: string;
  propertyType: PropertyType;
  city: string;
  areaGroup: AreaGroup;
  price: number;
  bedrooms: number;
  bathrooms: number;
  floorArea: number;
  mediaFiles: string[];
  evidenceFiles: string[];
  prcNumber: string;
  dhsudNumber: string;
  disclosuresAccepted: boolean;
  submittedAt?: string;
}

export interface ModerationDecision {
  status: "draft" | "submitted" | "approved" | "changes-requested" | "rejected";
  note: string;
  decidedAt?: string;
}
