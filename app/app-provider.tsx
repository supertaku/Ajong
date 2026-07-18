"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { translate, type TranslationKey } from "@/lib/i18n";
import { sampleSellerSubmission } from "@/lib/listings";
import { migratePrototypeState, PROTOTYPE_STORAGE_KEY, PROTOTYPE_STORAGE_VERSION } from "@/lib/local-state";
import { DEFAULT_GUIDE_ANSWERS } from "@/lib/matching";
import type { GuideAnswers, Language, ModerationDecision, SellerSubmission, Theme } from "@/lib/types";
import type { PrototypeState } from "@/lib/local-state";

type AppContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: TranslationKey) => string;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  guideAnswers: GuideAnswers;
  setGuideAnswers: Dispatch<SetStateAction<GuideAnswers>>;
  sellerSubmission: SellerSubmission;
  setSellerSubmission: Dispatch<SetStateAction<SellerSubmission>>;
  moderation: ModerationDecision;
  setModeration: Dispatch<SetStateAction<ModerationDecision>>;
  resetDemo: () => void;
};

const DEFAULT_MODERATION: ModerationDecision = { status: "submitted", note: "Waiting for review." };
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [guideAnswers, setGuideAnswers] = useState<GuideAnswers>(DEFAULT_GUIDE_ANSWERS);
  const [sellerSubmission, setSellerSubmission] = useState<SellerSubmission>(sampleSellerSubmission);
  const [moderation, setModeration] = useState<ModerationDecision>(DEFAULT_MODERATION);
  const [hydrated, setHydrated] = useState(false);

  const setSellerSubmissionPersistent = useCallback<Dispatch<SetStateAction<SellerSubmission>>>((action) => {
    setSellerSubmission((current) => {
      const next = typeof action === "function" ? action(current) : action;
      persistField("sellerSubmission", next);
      return next;
    });
  }, []);

  const setModerationPersistent = useCallback<Dispatch<SetStateAction<ModerationDecision>>>((action) => {
    setModeration((current) => {
      const next = typeof action === "function" ? action(current) : action;
      persistField("moderation", next);
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const stored = window.localStorage.getItem(PROTOTYPE_STORAGE_KEY);
        if (stored) {
          const parsed = migratePrototypeState(stored);
          if (parsed) {
            setLanguage(parsed.language);
            setTheme(parsed.theme);
            setFavorites(parsed.favorites);
            setCompare(parsed.compare);
            if (parsed.guideAnswers) setGuideAnswers(parsed.guideAnswers);
            if (parsed.sellerSubmission) setSellerSubmission(parsed.sellerSubmission);
            if (parsed.moderation) setModeration(parsed.moderation);
          }
        }
      } catch {
        window.localStorage.removeItem(PROTOTYPE_STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language === "fil" ? "fil" : "en";
  }, [language]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify({
      version: PROTOTYPE_STORAGE_VERSION,
      language,
      theme,
      favorites,
      compare,
      guideAnswers,
      sellerSubmission,
      moderation,
    }));
  }, [hydrated, language, theme, favorites, compare, guideAnswers, sellerSubmission, moderation]);

  const value = useMemo<AppContextValue>(() => ({
    language,
    setLanguage,
    theme,
    toggleTheme: () => setTheme((current) => current === "light" ? "dark" : "light"),
    t: (key) => translate(language, key),
    favorites,
    toggleFavorite: (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
    compare,
    toggleCompare: (id) => setCompare((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current),
    guideAnswers,
    setGuideAnswers,
    sellerSubmission,
    setSellerSubmission: setSellerSubmissionPersistent,
    moderation,
    setModeration: setModerationPersistent,
    resetDemo: () => {
      window.localStorage.removeItem(PROTOTYPE_STORAGE_KEY);
      setLanguage("en");
      setTheme("light");
      setFavorites([]);
      setCompare([]);
      setGuideAnswers(DEFAULT_GUIDE_ANSWERS);
      setSellerSubmission(sampleSellerSubmission);
      setModeration(DEFAULT_MODERATION);
    },
  }), [language, theme, favorites, compare, guideAnswers, sellerSubmission, moderation, setSellerSubmissionPersistent, setModerationPersistent]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function persistField<K extends keyof PrototypeState>(key: K, value: PrototypeState[K]) {
  if (typeof window === "undefined") return;
  const stored = window.localStorage.getItem(PROTOTYPE_STORAGE_KEY);
  const current = stored ? migratePrototypeState(stored) : null;
  const next: PrototypeState = current ?? { version: PROTOTYPE_STORAGE_VERSION, language: "en", theme: "light", favorites: [], compare: [] };
  window.localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify({ ...next, [key]: value }));
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
