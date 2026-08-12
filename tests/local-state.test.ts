import { describe, expect, it } from "vitest";
import { DEFAULT_STATE, parseAppState } from "@/lib/local-state";

describe("local rental state", () => {
  it("loads valid state and limits recent searches", () => {
    const state = parseAppState(JSON.stringify({ version: 1, wishlists: [], reservations: [], hostInterests: [], recentSearches: ["Makati", "BGC", "Pasig", "Taft", "Cubao", "Alabang", "Manila"] }));
    expect(state.recentSearches).toHaveLength(6);
  });
  it("recovers from corrupt and future state", () => {
    expect(parseAppState("broken")).toEqual(DEFAULT_STATE);
    expect(parseAppState(JSON.stringify({ version: 8 }))).toEqual(DEFAULT_STATE);
  });
});
