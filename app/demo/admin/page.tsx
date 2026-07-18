"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileSearch, MessageSquareWarning, XCircle } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";
import type { ModerationDecision } from "@/lib/types";

export default function AdminDemoPage() {
  const { t, sellerSubmission, moderation, setModeration } = useApp();
  const [note, setNote] = useState(moderation.note);
  const decide = (status: ModerationDecision["status"]) => setModeration({ status, note: note.trim() || defaultNotes[status], decidedAt: new Date().toISOString() });

  return (
    <div className="page-shell admin-page">
      <header className="page-hero compact-hero">
        <div><p className="eyebrow">{t("admin.eyebrow")}</p><h1>{t("admin.title")}</h1><p>{t("admin.body")}</p></div>
      </header>

      <div className="admin-layout">
        <section className="review-card">
          <div className="review-heading"><div><p className="eyebrow">Submission {sellerSubmission.id}</p><h2>{sellerSubmission.bedrooms}BR {sellerSubmission.propertyType} in {sellerSubmission.city}</h2></div><span className={`status-pill ${moderation.status}`}>{moderation.status.replace("-", " ")}</span></div>
          <dl className="submission-summary">
            <div><dt>Seller role</dt><dd>{sellerSubmission.sellerName} · {sellerSubmission.sellerRole.replaceAll("-", " ")}</dd></div>
            <div><dt>Price</dt><dd>₱{sellerSubmission.price.toLocaleString("en-PH")}</dd></div>
            <div><dt>Specifications</dt><dd>{sellerSubmission.bedrooms} bedrooms · {sellerSubmission.bathrooms} bathrooms · {sellerSubmission.floorArea} m²</dd></div>
            <div><dt>PRC reference</dt><dd>{sellerSubmission.prcNumber || "Not supplied / not applicable"}</dd></div>
            <div><dt>DHSUD reference</dt><dd>{sellerSubmission.dhsudNumber || "Not supplied / applicability needs review"}</dd></div>
          </dl>
          <div className="review-files"><FileSearch aria-hidden="true" /><div><strong>Evidence filenames</strong><p>{sellerSubmission.evidenceFiles.join(", ") || "None selected"}</p><strong>Media filenames</strong><p>{sellerSubmission.mediaFiles.join(", ") || "None selected"}</p></div></div>
        </section>

        <aside className="decision-card">
          <h2>Human review decision</h2>
          <ul className="review-checklist">
            <li><CheckCircle2 /> Seller role supplied</li>
            <li><CheckCircle2 /> Property basics supplied</li>
            <li className={sellerSubmission.evidenceFiles.length ? "" : "needs-attention"}><CheckCircle2 /> Evidence filename present</li>
            <li className="needs-attention"><AlertTriangle /> Authenticity still unverified</li>
          </ul>
          <label className="field-label">Decision note<textarea rows={5} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain what the seller should know next." /></label>
          <div className="decision-actions">
            <button type="button" className="button approve" onClick={() => decide("approved")}><CheckCircle2 size={18} />Approve</button>
            <button type="button" className="button request" onClick={() => decide("changes-requested")}><MessageSquareWarning size={18} />Request changes</button>
            <button type="button" className="button reject" onClick={() => decide("rejected")}><XCircle size={18} />Reject</button>
          </div>
          <Link href="/seller/status" className="text-link">Open seller-facing status →</Link>
        </aside>
      </div>
    </div>
  );
}

const defaultNotes: Record<ModerationDecision["status"], string> = {
  draft: "Draft saved on this device.",
  submitted: "Waiting for review.",
  approved: "Approved. Complete the publication checks before the listing goes live.",
  "changes-requested": "Please update the highlighted information and resubmit.",
  rejected: "Rejected. Review the reason before creating a new submission.",
};
