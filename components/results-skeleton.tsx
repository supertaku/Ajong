export function ResultsSkeleton() {
  return <div className="results-page results-skeleton" aria-busy="true" aria-label="Loading rental results">
    <div className="results-header"><div className="container skeleton-filter-row">{[82, 96, 70, 82, 126, 88, 66, 66, 84, 106].map((width, index) => <span className="skeleton-block skeleton-pill" style={{ width }} key={index} />)}</div></div>
    <div className="results-layout">
      <section className="results-list">
        <div className="results-copy skeleton-results-copy"><span className="skeleton-block skeleton-heading" /><span className="skeleton-block skeleton-subheading" /></div>
        <div className="property-grid skeleton-property-grid">{Array.from({ length: 6 }, (_, index) => <article className="skeleton-card" key={index}>
          <div className="skeleton-block skeleton-photo" />
          <div className="skeleton-card-line"><span className="skeleton-block skeleton-title" /><span className="skeleton-block skeleton-rating" /></div>
          <span className="skeleton-block skeleton-copy-line" />
          <span className="skeleton-block skeleton-copy-short" />
          <span className="skeleton-block skeleton-price" />
        </article>)}</div>
      </section>
      <aside className="results-map skeleton-map"><span className="skeleton-block skeleton-map-surface" /><div className="skeleton-map-markers" aria-hidden="true">{["18% 28%", "38% 44%", "61% 31%", "72% 61%", "46% 72%"].map((position) => { const [left, top] = position.split(" "); return <span className="skeleton-block skeleton-map-marker" style={{ left, top }} key={position} />; })}</div></aside>
    </div>
  </div>;
}
