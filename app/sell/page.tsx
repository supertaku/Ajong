"use client";

import Link from "next/link";
import { Camera, CheckCircle2, FileCheck2, UploadCloud } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { useApp } from "@/app/app-provider";
import type { AreaGroup, PropertyType, SellerProfile, SellerSubmission } from "@/lib/types";

const areaGroups: AreaGroup[] = ["Metro Manila", "Cavite", "Laguna", "Rizal", "Bulacan"];
const propertyTypes: PropertyType[] = ["condo", "townhouse", "house"];
const sellerRoles: Array<{ value: SellerProfile["role"]; label: string }> = [
  { value: "owner", label: "Property owner" },
  { value: "licensed-broker", label: "Licensed real-estate broker" },
  { value: "accredited-salesperson", label: "Accredited salesperson" },
  { value: "developer-representative", label: "Developer representative" },
];

const steps = ["Seller", "Property", "Evidence", "Preview"];

export default function SellPage() {
  const { t, sellerSubmission, setSellerSubmission, moderation, setModeration } = useApp();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const update = <K extends keyof SellerSubmission>(key: K, value: SellerSubmission[K]) => {
    setSellerSubmission((current) => ({ ...current, [key]: value }));
    setModeration({ status: "draft", note: "Draft changed on this device." });
    setError("");
  };

  const captureFiles = (event: ChangeEvent<HTMLInputElement>, key: "mediaFiles" | "evidenceFiles") => {
    const names = Array.from(event.target.files ?? []).map((file) => file.name);
    update(key, names);
    event.target.value = "";
  };

  const validateStep = () => {
    if (step === 0 && !sellerSubmission.sellerName.trim()) return "Enter the seller name to continue.";
    if (step === 1 && (!sellerSubmission.city.trim() || sellerSubmission.price <= 0 || sellerSubmission.floorArea <= 0)) return "Add a city, price, and floor area to continue.";
    if (step === 2 && sellerSubmission.evidenceFiles.length === 0) return "Select at least one evidence file to continue.";
    return "";
  };

  const next = () => {
    const message = validateStep();
    if (message) return setError(message);
    setStep((current) => Math.min(current + 1, 3));
  };

  const submit = () => {
    if (!sellerSubmission.disclosuresAccepted) return setError("Confirm the seller declaration before submitting.");
    const submittedAt = new Date().toISOString();
    setSellerSubmission((current) => ({ ...current, submittedAt }));
    setModeration({ status: "submitted", note: "Waiting for review." });
    setError("");
  };

  return (
    <div className="page-shell seller-page">
      <header className="page-hero compact-hero">
        <div>
          <p className="eyebrow">{t("sell.eyebrow")}</p>
          <h1>{t("sell.title")}</h1>
          <p>{t("sell.body")}</p>
        </div>
      </header>

      {moderation.status !== "draft" && (
        <section className="status-banner" aria-live="polite">
          <div><strong>Current status: {moderation.status.replace("-", " ")}</strong><span>{moderation.note}</span></div>
          <Link href="/seller/status" className="text-link">View seller status</Link>
        </section>
      )}

      <div className="seller-layout">
        <aside className="stepper" aria-label="Submission steps">
          {steps.map((label, index) => (
            <button key={label} type="button" className={index === step ? "active" : index < step ? "done" : ""} onClick={() => index <= step && setStep(index)} aria-current={index === step ? "step" : undefined}>
              <span>{index < step ? <CheckCircle2 size={18} /> : index + 1}</span>{label}
            </button>
          ))}
        </aside>

        <section className="seller-form-card" aria-labelledby={`seller-step-${step}`}>
          {step === 0 && (
            <div className="form-stack">
              <div><p className="eyebrow">Step 1 of 4</p><h2 id="seller-step-0">Who is submitting?</h2><p>Roles affect which credentials and authority documents a real review would require.</p></div>
              <fieldset><legend>Seller role</legend><div className="option-grid two-columns">
                {sellerRoles.map((role) => <label className="choice-card" key={role.value}><input type="radio" name="seller-role" checked={sellerSubmission.sellerRole === role.value} onChange={() => update("sellerRole", role.value)} /><span>{role.label}</span></label>)}
              </div></fieldset>
              <label className="field-label">Seller name<input value={sellerSubmission.sellerName} onChange={(event) => update("sellerName", event.target.value)} autoComplete="off" /></label>
              {sellerSubmission.sellerRole !== "owner" && <label className="field-label">PRC credential reference<input value={sellerSubmission.prcNumber} onChange={(event) => update("prcNumber", event.target.value)} placeholder="Enter reference number" /></label>}
            </div>
          )}

          {step === 1 && (
            <div className="form-stack">
              <div><p className="eyebrow">Step 2 of 4</p><h2 id="seller-step-1">Describe the property</h2><p>Add the details buyers need to understand the home.</p></div>
              <div className="field-grid">
                <label className="field-label">Property type<select value={sellerSubmission.propertyType} onChange={(event) => update("propertyType", event.target.value as PropertyType)}>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className="field-label">Area<select value={sellerSubmission.areaGroup} onChange={(event) => update("areaGroup", event.target.value as AreaGroup)}>{areaGroups.map((area) => <option key={area}>{area}</option>)}</select></label>
                <label className="field-label">City<input value={sellerSubmission.city} onChange={(event) => update("city", event.target.value)} /></label>
                <label className="field-label">Asking price (PHP)<input type="number" min="0" step="50000" value={sellerSubmission.price} onChange={(event) => update("price", Number(event.target.value))} /></label>
                <label className="field-label">Bedrooms<input type="number" min="0" max="20" value={sellerSubmission.bedrooms} onChange={(event) => update("bedrooms", Number(event.target.value))} /></label>
                <label className="field-label">Bathrooms<input type="number" min="0" max="20" value={sellerSubmission.bathrooms} onChange={(event) => update("bathrooms", Number(event.target.value))} /></label>
                <label className="field-label">Floor area (m²)<input type="number" min="1" value={sellerSubmission.floorArea} onChange={(event) => update("floorArea", Number(event.target.value))} /></label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-stack">
              <div><p className="eyebrow">Step 3 of 4</p><h2 id="seller-step-2">Add evidence and media</h2><p>Provide clear documents and images for the review team.</p></div>
              <label className="file-drop"><FileCheck2 aria-hidden="true" /><strong>Ownership or authority evidence</strong><span>Add a title copy, authorization, ID, or authority-to-sell document.</span><input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => captureFiles(event, "evidenceFiles")} /></label>
              <FileList names={sellerSubmission.evidenceFiles} empty="No evidence filenames selected." />
              <label className="file-drop"><Camera aria-hidden="true" /><strong>Property photos or walkthrough</strong><span>Add clear photos or a walkthrough video of the property.</span><input type="file" multiple accept="image/*,video/*" onChange={(event) => captureFiles(event, "mediaFiles")} /></label>
              <FileList names={sellerSubmission.mediaFiles} empty="No media filenames selected." />
              <label className="field-label">DHSUD project reference, when applicable<input value={sellerSubmission.dhsudNumber} onChange={(event) => update("dhsudNumber", event.target.value)} placeholder="Optional reference" /></label>
            </div>
          )}

          {step === 3 && (
            <div className="form-stack">
              <div><p className="eyebrow">Step 4 of 4</p><h2 id="seller-step-3">Preview the submission</h2><p>Check every detail before sending it for review.</p></div>
              <dl className="submission-summary">
                <div><dt>Seller</dt><dd>{sellerSubmission.sellerName} · {sellerSubmission.sellerRole.replaceAll("-", " ")}</dd></div>
                <div><dt>Property</dt><dd>{sellerSubmission.bedrooms}BR {sellerSubmission.propertyType} in {sellerSubmission.city}, {sellerSubmission.areaGroup}</dd></div>
                <div><dt>Price and space</dt><dd>₱{sellerSubmission.price.toLocaleString("en-PH")} · {sellerSubmission.floorArea} m²</dd></div>
                <div><dt>Evidence filenames</dt><dd>{sellerSubmission.evidenceFiles.join(", ") || "None"}</dd></div>
                <div><dt>Media filenames</dt><dd>{sellerSubmission.mediaFiles.join(", ") || "None"}</dd></div>
              </dl>
              <label className="disclosure-check"><input type="checkbox" checked={sellerSubmission.disclosuresAccepted} onChange={(event) => update("disclosuresAccepted", event.target.checked)} /><span>I confirm that the information is accurate and that I am authorized to submit this property for review.</span></label>
            </div>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions">
            {step > 0 && <button type="button" className="button secondary" onClick={() => { setStep(step - 1); setError(""); }}>Back</button>}
            {step < 3 ? <button type="button" className="button primary" onClick={next}>{t("sell.next")}</button> : <button type="button" className="button primary" onClick={submit}><UploadCloud size={18} />{t("sell.submit")}</button>}
          </div>
        </section>
      </div>
    </div>
  );
}

function FileList({ names, empty }: { names: string[]; empty: string }) {
  return <ul className="filename-list" aria-live="polite">{names.length ? names.map((name) => <li key={name}>{name}</li>) : <li className="muted">{empty}</li>}</ul>;
}
