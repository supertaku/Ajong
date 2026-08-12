"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Globe2, Heart, HelpCircle, Menu, Plane, UserRound } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";
import { Modal } from "@/components/modal";
import { metroCities } from "@/lib/listings";
import type { MetroCity, RentalType } from "@/lib/types";

export function SiteHeader() {
  const pathname = usePathname();
  const { addHostInterest, showToast } = useApp();
  const [menu, setMenu] = useState(false);
  const [hostOpen, setHostOpen] = useState(false);
  const [host, setHost] = useState({ name: "", email: "", phone: "", city: "Quezon City" as MetroCity, propertyType: "condo" as RentalType });
  const submitHost = () => { addHostInterest(host); setHostOpen(false); showToast("Thanks. Our hosting team will be in touch."); };
  return <>
    <header className="site-header"><div className="header-inner">
      <Link href="/" className="brand" aria-label="Kubo home"><Image src="/images/kubo-mascot.png" alt="" width={42} height={42} priority unoptimized /><span>Kubo</span></Link>
      <nav className="home-tabs" aria-label="Rental categories"><Link className={!pathname.includes("properties") ? "active" : ""} href="/">All rentals</Link><Link href="/properties?type=home">Homes</Link><Link href="/properties?type=dorm">Dorms</Link></nav>
      <div className="header-actions"><button type="button" className="host-link" onClick={() => setHostOpen(true)}>Become a host</button><button type="button" className="round-button" aria-label="Language and currency"><Globe2 size={19} /></button><button type="button" className="profile-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Open profile menu"><Menu size={19} /><UserRound size={24} /></button></div>
      {menu && <div className="profile-menu" role="menu">
        <Link href="/wishlists" onClick={() => setMenu(false)}><Heart size={18} />Wishlists</Link><Link href="/trips" onClick={() => setMenu(false)}><Plane size={18} />Trips</Link><Link href="/help" onClick={() => setMenu(false)}><HelpCircle size={18} />Help center</Link>
        <button type="button" onClick={() => { setMenu(false); setHostOpen(true); }}><Building2 size={18} /><span><b>Become a host</b><small>List your place with Kubo</small></span></button>
      </div>}
    </div></header>
    <Modal open={hostOpen} onClose={() => setHostOpen(false)} title="Tell us about your place" footer={<button className="button primary wide" disabled={!host.name || !host.email || !host.phone} onClick={submitHost}>Send my details</button>}>
      <p className="modal-intro">Share a few details. A Kubo hosting specialist will contact you.</p>
      <div className="form-grid"><label className="field-block"><span>Full name</span><input value={host.name} onChange={(event) => setHost({ ...host, name: event.target.value })} /></label><label className="field-block"><span>Email</span><input type="email" value={host.email} onChange={(event) => setHost({ ...host, email: event.target.value })} /></label><label className="field-block"><span>Phone</span><input type="tel" value={host.phone} onChange={(event) => setHost({ ...host, phone: event.target.value })} /></label><label className="field-block"><span>City</span><select value={host.city} onChange={(event) => setHost({ ...host, city: event.target.value as MetroCity })}>{metroCities.map((city) => <option key={city}>{city}</option>)}</select></label><label className="field-block full"><span>Property type</span><select value={host.propertyType} onChange={(event) => setHost({ ...host, propertyType: event.target.value as RentalType })}><option value="condo">Condo</option><option value="apartment">Apartment</option><option value="studio">Studio</option><option value="house">House or townhouse</option><option value="dorm">Dorm room</option><option value="bedspace">Bedspace</option><option value="private-room">Private room</option></select></label></div>
    </Modal>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><Link href="/"><Globe2 size={21} />Explore</Link><Link href="/wishlists"><Heart size={21} />Wishlists</Link><Link href="/trips"><Plane size={21} />Trips</Link><button type="button" onClick={() => setMenu(!menu)}><UserRound size={21} />Profile</button></nav>
  </>;
}
