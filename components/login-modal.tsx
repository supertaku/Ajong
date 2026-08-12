"use client";

import Image from "next/image";
import { Apple } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Modal } from "@/components/modal";

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [identity, setIdentity] = useState("");
  const [error, setError] = useState("");
  const continueLogin = (event: FormEvent) => {
    event.preventDefault();
    if (!identity.trim()) { setError("Enter your phone number or email address."); return; }
    setError("");
  };
  return <Modal open={open} onClose={() => { setError(""); onClose(); }} title="Log in or sign up" size="small" variant="auth">
    <div className="login-modal-body">
      <Image className="login-brand-mark" src="/images/kubo-mascot.png" alt="Kubo" width={58} height={58} priority unoptimized />
      <h2>Log in or sign up</h2>
      <form onSubmit={continueLogin} noValidate>
        <label className={`login-identity ${error ? "has-error" : ""}`}><span className="sr-only">Phone number or email</span><input autoComplete="username" inputMode="email" placeholder="Phone number or email" value={identity} onChange={(event) => { setIdentity(event.target.value); if (error) setError(""); }} aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} /></label>
        {error && <p className="login-error" id="login-error" role="alert">{error}</p>}
        <button className="login-continue" type="submit">Continue</button>
      </form>
      <div className="login-divider"><span>or</span></div>
      <div className="social-login-row"><button type="button" aria-label="Continue with Google"><span className="google-mark" aria-hidden="true">G</span></button><button type="button" aria-label="Continue with Apple"><Apple size={24} fill="currentColor" /></button></div>
    </div>
  </Modal>;
}
