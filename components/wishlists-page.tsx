"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";
import { Modal } from "@/components/modal";
import { listings } from "@/lib/listings";

export function WishlistsPage() {
  const { wishlists, createWishlist, renameWishlist, removeWishlist } = useApp(); const [createOpen, setCreateOpen] = useState(false); const [editing, setEditing] = useState<string | null>(null); const [name, setName] = useState("");
  return <div className="container"><div className="page-title"><h1>Wishlists</h1><p>Keep the places you love organized in one spot.</p></div>{wishlists.length ? <div className="wishlist-grid">{wishlists.map((wishlist) => { const saved = wishlist.listingIds.map((id) => listings.find((listing) => listing.id === id)).filter(Boolean); return <article className="wishlist-card" key={wishlist.id}><Link href={`/wishlists/${wishlist.id}`}><div className="wishlist-cover">{saved.slice(0,3).map((listing) => <div key={listing!.id}><Image src={listing!.gallery[0]} alt="" fill unoptimized /></div>)}</div><h2>{wishlist.name}</h2><p className="muted">{saved.length} saved rental{saved.length === 1 ? "" : "s"}</p></Link><button className="round-button" type="button" onClick={() => { setEditing(wishlist.id); setName(wishlist.name); }} aria-label={`Edit ${wishlist.name}`}><MoreHorizontal size={20} /></button></article>; })}</div> : <div className="empty-state"><Heart size={44} /><h2>Create your first wishlist</h2><p>Save rentals as you explore, then compare your favorites whenever you are ready.</p><button type="button" className="button primary" onClick={() => setCreateOpen(true)}>Create a wishlist</button></div>}
    <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a wishlist" footer={<button className="button primary wide" disabled={!name.trim()} type="button" onClick={() => { createWishlist(name.trim()); setName(""); setCreateOpen(false); }}>Create</button>}><label className="field-block"><span>Wishlist name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Near work" /></label></Modal>
    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit wishlist" footer={<div className="filter-footer"><button className="button ghost" type="button" onClick={() => { if (editing) removeWishlist(editing); setEditing(null); }}>Delete</button><button className="button primary" type="button" onClick={() => { if (editing && name.trim()) renameWishlist(editing, name.trim()); setEditing(null); }}>Save</button></div>}><label className="field-block"><span>Wishlist name</span><input value={name} onChange={(event) => setName(event.target.value)} /></label></Modal>
  </div>;
}
