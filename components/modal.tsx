"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Modal({ open, onClose, title, children, footer, size = "medium", fullScreen = false, variant = "default" }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: "small" | "medium" | "large"; fullScreen?: boolean; variant?: "default" | "auth" | "filter" }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.classList.add("modal-open");
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    panel?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("modal-open"); document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(<div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={panelRef} tabIndex={-1} className={`modal-panel modal-${size} ${fullScreen ? "modal-fullscreen" : ""} ${variant === "auth" ? "modal-auth" : ""} ${variant === "filter" ? "modal-filter" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className={`modal-header ${variant === "auth" ? "modal-auth-header" : ""}`}><button className="round-button" type="button" onClick={onClose} aria-label="Close"><X size={20} /></button><h2 id={titleId} className={variant === "auth" ? "sr-only" : ""}>{title}</h2>{variant !== "auth" && <span />}</header>
      <div className="modal-content">{children}</div>
      {footer && <footer className="modal-footer">{footer}</footer>}
    </div>
  </div>, document.body);
}

export function Counter({ label, helper, value, onChange, min = 0, max = 12 }: { label: string; helper?: string; value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return <div className="counter-row"><div><strong>{label}</strong>{helper && <span>{helper}</span>}</div><div className="counter-controls"><button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`}>−</button><b>{value}</b><button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase ${label}`}>+</button></div></div>;
}
