import { describe, expect, it } from "vitest";
import { migratePrototypeState } from "@/lib/local-state";

describe("local-state migrations", () => {
  it("migrates legacy savedHomes and caps comparisons at three", () => {
    const migrated = migratePrototypeState(JSON.stringify({ version: 0, language: "fil", savedHomes: ["a"], compare: ["a", "b", "c", "d"] }));
    expect(migrated).toMatchObject({ version: 2, language: "fil", theme: "light", favorites: ["a"], compare: ["a", "b", "c"] });
  });

  it("rejects corrupt or unknown future state", () => {
    expect(migratePrototypeState("not-json")).toBeNull();
    expect(migratePrototypeState(JSON.stringify({ version: 8 }))).toBeNull();
  });
});
