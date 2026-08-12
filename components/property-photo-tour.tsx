"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";
import { LoginModal } from "@/components/login-modal";
import type { RentalListing } from "@/lib/types";

type PhotoGroup = { label: string; images: { src: string; index: number }[] };

function getPhotoGroups(listing: RentalListing): PhotoGroup[] {
  const labels = listing.type === "house"
    ? ["Living area", "Bedrooms", "Kitchen and bathroom"]
    : listing.type === "dorm" || listing.type === "bedspace" || listing.type === "private-room"
      ? ["Room area", "Shared spaces", "Building and surroundings"]
      : ["Living area", "Bedroom area", "Kitchen and bathroom"];
  const photos = listing.gallery.map((src, index) => ({ src, index }));
  return [
    { label: labels[0], images: photos.slice(0, 2) },
    { label: labels[1], images: photos.slice(2, 3) },
    { label: labels[2], images: photos.slice(3) },
  ].filter((group) => group.images.length > 0);
}

export function PropertyPhotoTour({ listing }: { listing: RentalListing }) {
  const router = useRouter();
  const { isSaved, showToast } = useApp();
  const [loginOpen, setLoginOpen] = useState(false);
  const groups = getPhotoGroups(listing);
  const saved = isSaved(listing.id);

  const goBack = () => {
    const fromThisSite = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (fromThisSite) router.back();
    else router.push(`/properties/${listing.slug}`);
  };

  const share = async () => {
    const data = { title: listing.title, text: `Take a look at ${listing.title} on Kubo`, url: window.location.href };
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(data.url);
      showToast("Link copied");
    }
  };

  return <div className="photo-tour-page">
    <header className="photo-tour-header">
      <button type="button" className="photo-tour-icon-button" onClick={goBack} aria-label="Back to property">
        <ArrowLeft size={22} />
      </button>
      <div className="photo-tour-actions">
        <button type="button" onClick={share}><Share2 size={19} /><span>Share</span></button>
        <button type="button" onClick={() => setLoginOpen(true)}><Heart size={20} fill={saved ? "currentColor" : "none"} /><span>{saved ? "Saved" : "Save"}</span></button>
      </div>
    </header>

    <main className="photo-tour-content">
      <h1>Photo tour</h1>
      <nav className="photo-tour-index" aria-label="Photo categories">
        {groups.map((group) => <a href={`#${group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={group.label}>
          <span className="photo-tour-index-image"><Image src={group.images[0].src} alt="" fill sizes="190px" unoptimized /></span>
          <strong>{group.label}</strong>
        </a>)}
      </nav>

      <div className="photo-tour-groups">
        {groups.map((group) => {
          const sectionId = group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return <section className="photo-tour-group" id={sectionId} key={group.label}>
            <h2>{group.label}</h2>
            <div className={`photo-tour-grid photo-tour-grid-${group.images.length}`}>
              {group.images.map((image) => <figure id={`photo-${image.index + 1}`} key={image.src}>
                <Image src={image.src} alt={`${listing.title}, ${group.label.toLowerCase()} photo ${image.index + 1}`} fill sizes="(max-width: 760px) 100vw, 60vw" priority={image.index === 0} unoptimized />
              </figure>)}
            </div>
          </section>;
        })}
      </div>
    </main>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
  </div>;
}
