import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-grid"><section><h3>Support</h3><Link href="/help">Help center</Link><Link href="/help#renting">Renting on Kubo</Link><Link href="/help#safety">Safety and trust</Link></section><section><h3>Hosting</h3><Link href="/">List your home</Link><Link href="/help#hosting">Hosting responsibly</Link><Link href="/help#resources">Host resources</Link></section><section><h3>Kubo</h3><Link href="/properties">Explore rentals</Link><Link href="/wishlists">Wishlists</Link><Link href="/trips">Trips</Link></section></div><div className="footer-bottom"><span>© 2026 Kubo</span><span>English (PH)</span><span>PHP</span></div></footer>;
}
