import { maxAffordablePrice } from "./finance";
import type { FilterImpact, GuideAnswers, Listing, MatchBreakdown, MatchResult } from "./types";

export const DEFAULT_GUIDE_ANSWERS: GuideAnswers = {
  monthlyBudget: 60_000,
  cashAvailable: 1_200_000,
  downPaymentPercent: 20,
  annualInterestRate: 7,
  termYears: 20,
  areas: ["Metro Manila", "Rizal", "Cavite", "Laguna", "Bulacan"],
  commuteAnchor: "Makati",
  maxCommute: 60,
  householdSize: 4,
  minBedrooms: 2,
  propertyTypes: ["condo", "townhouse", "house"],
  moveIn: "within-year",
  priorities: ["space", "parking", "proximity"],
};

export function filterListingsForGuide(source: Listing[], answers: GuideAnswers, completedSteps = 6) {
  let result = [...source];
  if (completedSteps >= 1) result = result.filter((listing) => listing.price <= maxAffordablePrice(answers));
  if (completedSteps >= 2 && answers.areas.length) result = result.filter((listing) => answers.areas.includes(listing.areaGroup));
  if (completedSteps >= 3) result = result.filter((listing) => listing.bedrooms >= answers.minBedrooms);
  if (completedSteps >= 4 && answers.propertyTypes.length) result = result.filter((listing) => answers.propertyTypes.includes(listing.propertyType));
  return result;
}

export function getFilterImpacts(source: Listing[], answers: GuideAnswers, completedSteps: number): FilterImpact[] {
  const labels = ["Budget", "Areas", "Bedrooms", "Home types", "Move-in timing", "Family priorities"];
  return labels.slice(0, completedSteps).map((label, index) => {
    const before = filterListingsForGuide(source, answers, index).length;
    const after = filterListingsForGuide(source, answers, index + 1).length;
    return { id: String(index), label, before, after, rankingOnly: index >= 4 };
  });
}

const timingScore = (listing: Listing, answer: GuideAnswers["moveIn"]) => {
  if (listing.moveIn === answer) return 10;
  if (answer === "pre-selling" || listing.moveIn === "within-year") return 6;
  return 3;
};

export function scoreListing(listing: Listing, answers: GuideAnswers): MatchBreakdown {
  const commute = listing.commuteMinutes[answers.commuteAnchor];
  const areaPoints = answers.areas.includes(listing.areaGroup) ? 15 : 4;
  const commutePoints = Math.max(0, Math.round(15 * (1 - Math.max(0, commute - answers.maxCommute) / 75)));
  const location = Math.min(30, areaPoints + commutePoints);

  const ceiling = maxAffordablePrice(answers);
  const budgetRatio = ceiling > 0 ? listing.price / ceiling : 2;
  const budget = budgetRatio <= 0.82 ? 25 : budgetRatio <= 0.92 ? 22 : budgetRatio <= 1 ? 18 : 0;

  const targetSpace = Math.max(45, answers.householdSize * 22);
  const space = Math.min(15, Math.round(15 * Math.min(1, listing.floorArea / targetSpace)));
  const timing = timingScore(listing, answers.moveIn);

  const parkingPoints = listing.parking > 0 ? 6 : answers.priorities.includes("parking") ? 0 : 3;
  const accessibilityPoints = answers.priorities.includes("accessibility")
    ? listing.propertyType === "condo" ? 4 : 2
    : 4;
  const parkingAccessibility = Math.min(10, parkingPoints + accessibilityPoints);

  const overlaps = answers.priorities.filter((priority) => listing.priorities.includes(priority)).length;
  const priorities = answers.priorities.length ? Math.round(10 * overlaps / answers.priorities.length) : 10;
  const total = location + budget + space + timing + parkingAccessibility + priorities;

  const reasons = [
    `${commute} min estimated travel time to ${answers.commuteAnchor}`,
    budgetRatio <= 0.9 ? "Keeps useful room below your estimated ceiling" : "Near the top of your estimated ceiling",
    `${listing.floorArea} sqm for a household of ${answers.householdSize}`,
    overlaps ? `${overlaps} of your ${answers.priorities.length} family priorities matched` : "Few selected family priorities matched",
  ];

  return { location, budget, space, timing, parkingAccessibility, priorities, total, reasons };
}

export function rankListings(source: Listing[], answers: GuideAnswers): MatchResult[] {
  return filterListingsForGuide(source, answers)
    .map((listing) => ({ listing, score: scoreListing(listing, answers) }))
    .sort((a, b) => b.score.total - a.score.total || a.listing.price - b.listing.price || a.listing.id.localeCompare(b.listing.id));
}

export function getRelaxationSuggestions(source: Listing[], answers: GuideAnswers) {
  const candidates = [
    { id: "budget", label: "Raise the estimated ceiling by 10%", answers: { ...answers, monthlyBudget: Math.round(answers.monthlyBudget * 1.1) } },
    { id: "bedrooms", label: `Try ${Math.max(1, answers.minBedrooms - 1)}+ bedrooms`, answers: { ...answers, minBedrooms: Math.max(1, answers.minBedrooms - 1) } },
    { id: "areas", label: "Include all Greater Manila pilot areas", answers: { ...answers, areas: DEFAULT_GUIDE_ANSWERS.areas } },
  ];
  return candidates.map((candidate) => ({
    id: candidate.id,
    label: candidate.label,
    count: filterListingsForGuide(source, candidate.answers).length,
    answers: candidate.answers,
  }));
}
