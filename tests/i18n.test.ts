import { describe, expect, it } from "vitest";
import { translate, translations } from "@/lib/i18n";

describe("bilingual primary journeys", () => {
  it("keeps English and Filipino key coverage identical", () => {
    expect(Object.keys(translations.fil).sort()).toEqual(Object.keys(translations.en).sort());
  });

  it("never returns a raw translation key", () => {
    for (const key of Object.keys(translations.en) as Array<keyof typeof translations.en>) {
      expect(translate("en", key)).not.toBe(key);
      expect(translate("fil", key)).not.toBe(key);
    }
  });
});
