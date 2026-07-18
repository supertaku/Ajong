"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, FilePenLine, ShieldAlert, XCircle } from "lucide-react";
import { useApp } from "@/app/app-provider";

const statusMeta = {
  draft: { title: "Draft on this device", icon: FilePenLine },
  submitted: { title: "Submitted for review", icon: Clock3 },
  approved: { title: "Approved", icon: CheckCircle2 },
  "changes-requested": { title: "Changes requested", icon: ShieldAlert },
  rejected: { title: "Rejected", icon: XCircle },
};

export default function SellerStatusPage() {
  const { sellerSubmission, moderation } = useApp();
  const meta = statusMeta[moderation.status];
  const Icon = meta.icon;
  return (
    <div className="page-shell narrow-page">
      <header className="page-hero compact-hero"><div><p className="eyebrow">Seller status</p><h1>One clear place for what happens next.</h1><p>Follow the review and see whether any changes are needed.</p></div></header>
      <section className={`seller-status-card ${moderation.status}`} aria-live="polite">
        <Icon aria-hidden="true" />
        <div><p className="eyebrow">{sellerSubmission.id}</p><h2>{meta.title}</h2><p>{moderation.note}</p>{moderation.decidedAt && <small>Decision recorded {new Date(moderation.decidedAt).toLocaleString("en-PH")}</small>}</div>
      </section>
      <section className="what-next-card">
        <h2>What happens next</h2>
        <p>Approved submissions still need final publication checks. A request for changes explains what to update before submitting again.</p>
        <div className="button-row"><Link href="/sell" className="button secondary">Edit submission</Link><Link href="/demo/admin" className="button primary">Open review</Link></div>
      </section>
    </div>
  );
}
