import type { GuideAnswers, Language, ModerationDecision, SellerSubmission, Theme } from "./types";

export const PROTOTYPE_STORAGE_KEY = "kubo-concept-state-v1";
export const PROTOTYPE_STORAGE_VERSION = 2;

export type PrototypeState = {
  version: 2;
  language: Language;
  theme: Theme;
  favorites: string[];
  compare: string[];
  guideAnswers?: GuideAnswers;
  sellerSubmission?: SellerSubmission;
  moderation?: ModerationDecision;
};

type LegacyState = Partial<Omit<PrototypeState, "version" | "favorites">> & {
  version?: 0 | 1 | 2;
  favorites?: unknown;
  savedHomes?: unknown;
};

export function migratePrototypeState(serialized: string): PrototypeState | null {
  try {
    const parsed = JSON.parse(serialized) as LegacyState;
    if (!parsed || typeof parsed !== "object" || (parsed.version !== undefined && parsed.version !== 0 && parsed.version !== 1 && parsed.version !== 2)) return null;
    const language: Language = parsed.language === "fil" ? "fil" : "en";
    const theme: Theme = parsed.theme === "dark" ? "dark" : "light";
    const favorites = stringArray(parsed.favorites) ?? stringArray(parsed.savedHomes) ?? [];
    const compare = (stringArray(parsed.compare) ?? []).slice(0, 3);
    return {
      version: PROTOTYPE_STORAGE_VERSION,
      language,
      theme,
      favorites,
      compare,
      guideAnswers: parsed.guideAnswers,
      sellerSubmission: parsed.sellerSubmission,
      moderation: parsed.moderation,
    };
  } catch {
    return null;
  }
}

const stringArray = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === "string") ? value : null;
