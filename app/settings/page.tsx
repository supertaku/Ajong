"use client";

import { Languages, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";

export default function SettingsPage() {
  const { language, setLanguage, resetDemo, t } = useApp();
  const [resetComplete, setResetComplete] = useState(false);

  const chooseLanguage = (nextLanguage: "en" | "fil") => {
    setLanguage(nextLanguage);
    setResetComplete(false);
  };

  const handleReset = () => {
    resetDemo();
    setResetComplete(true);
  };

  return (
    <div className="settings-page">
      <header className="settings-hero page-shell">
        <span className="eyebrow">{t("settings.eyebrow")}</span>
        <h1>{t("settings.title")}</h1>
        <p>{t("settings.body")}</p>
      </header>

      <section className="settings-grid page-shell" aria-label={t("settings.title")}>
        <article className="settings-card">
          <div className="settings-card-heading">
            <span className="settings-card-icon" aria-hidden="true"><Languages size={24} /></span>
            <div>
              <h2>{t("settings.language.title")}</h2>
              <p>{t("settings.language.body")}</p>
            </div>
          </div>
          <div className="settings-language-toggle" aria-label={t("settings.language.title")}>
            <button type="button" className={language === "en" ? "active" : ""} onClick={() => chooseLanguage("en")} aria-pressed={language === "en"} aria-label={t("settings.language.english")}>
              <strong>EN</strong><span>{t("settings.language.english")}</span>
            </button>
            <button type="button" className={language === "fil" ? "active" : ""} onClick={() => chooseLanguage("fil")} aria-pressed={language === "fil"} aria-label={t("settings.language.filipino")}>
              <strong>FIL</strong><span>{t("settings.language.filipino")}</span>
            </button>
          </div>
        </article>

        <article className="settings-card settings-data-card">
          <div className="settings-card-heading">
            <span className="settings-card-icon warning" aria-hidden="true"><RotateCcw size={24} /></span>
            <div>
              <h2>{t("settings.data.title")}</h2>
              <p>{t("settings.data.body")}</p>
            </div>
          </div>
          <p className="settings-data-note">{t("settings.data.note")}</p>
          <button type="button" className="settings-reset-button" onClick={handleReset}>
            <RotateCcw size={17} aria-hidden="true" />{t("demo.reset")}
          </button>
          {resetComplete && <p className="settings-success" role="status">{t("settings.reset.done")}</p>}
        </article>
      </section>
    </div>
  );
}
