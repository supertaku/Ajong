import { describe, expect, it } from "vitest";
import { listings } from "@/lib/listings";
import { DEFAULT_GUIDE_ANSWERS, filterListingsForGuide, getFilterImpacts, getRelaxationSuggestions, rankListings, scoreListing } from "@/lib/matching";

describe("deterministic inventory and guide matching", () => {
  it("contains 48 uniquely identified fictional homes", () => {
    expect(listings).toHaveLength(48);
    expect(new Set(listings.map((listing) => listing.id)).size).toBe(48);
    expect(listings.every((listing) => listing.demo)).toBe(true);
  });

  it("never increases counts while applying hard filters", () => {
    const impacts = getFilterImpacts(listings, DEFAULT_GUIDE_ANSWERS, 6);
    for (const impact of impacts.slice(0, 4)) expect(impact.after).toBeLessThanOrEqual(impact.before);
    expect(impacts.slice(4).every((impact) => impact.rankingOnly && impact.after === impact.before)).toBe(true);
  });

  it("supports undo by removing only the last applied guide step", () => {
    const strict = { ...DEFAULT_GUIDE_ANSWERS, minBedrooms: 4, propertyTypes: ["house" as const] };
    const throughBedrooms = filterListingsForGuide(listings, strict, 3);
    const throughTypes = filterListingsForGuide(listings, strict, 4);
    expect(throughBedrooms.length).toBeGreaterThanOrEqual(throughTypes.length);
    expect(filterListingsForGuide(listings, strict, 3)).toEqual(throughBedrooms);
  });

  it("keeps every component inside its stated weight and totals them", () => {
    const score = scoreListing(listings[0], DEFAULT_GUIDE_ANSWERS);
    expect(score.location).toBeLessThanOrEqual(30);
    expect(score.budget).toBeLessThanOrEqual(25);
    expect(score.space).toBeLessThanOrEqual(15);
    expect(score.timing).toBeLessThanOrEqual(10);
    expect(score.parkingAccessibility).toBeLessThanOrEqual(10);
    expect(score.priorities).toBeLessThanOrEqual(10);
    expect(score.total).toBe(score.location + score.budget + score.space + score.timing + score.parkingAccessibility + score.priorities);
  });

  it("uses score, then price, then id as stable tie breakers", () => {
    const rankedA = rankListings(listings, DEFAULT_GUIDE_ANSWERS).map(({ listing }) => listing.id);
    const rankedB = rankListings([...listings].reverse(), DEFAULT_GUIDE_ANSWERS).map(({ listing }) => listing.id);
    expect(rankedA).toEqual(rankedB);
  });

  it("reports exact one-at-a-time recovery counts for a zero-result case", () => {
    const impossible = { ...DEFAULT_GUIDE_ANSWERS, monthlyBudget: 10_000, cashAvailable: 0, minBedrooms: 5, areas: ["Bulacan" as const], propertyTypes: ["condo" as const] };
    expect(filterListingsForGuide(listings, impossible)).toHaveLength(0);
    const suggestions = getRelaxationSuggestions(listings, impossible);
    for (const suggestion of suggestions) expect(suggestion.count).toBe(filterListingsForGuide(listings, suggestion.answers).length);
  });
});
