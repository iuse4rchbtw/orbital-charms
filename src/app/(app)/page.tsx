import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <section className="orbital-hero">
        <div className="orbital-hero-copy">
          <p className="orbital-kicker">Modular Italian bracelets</p>
          <h1>Charm every moment.</h1>
          <p>
            Build a bracelet around your story. Pre-order a pastel, modular piece made uniquely by
            you.
          </p>
          <div className="orbital-actions">
            <Link className="orbital-button" href="/customize">
              Build a bracelet
            </Link>
            <Link className="orbital-button orbital-button-secondary" href="/shop">
              Shop charms
            </Link>
          </div>
        </div>
        <div className="orbital-hero-art" aria-label="Orbital Charms bracelet preview">
          <div className="orbital-hero-charm">♡</div>
          <div className="orbital-hero-charm">✿</div>
          <div className="orbital-hero-charm">★</div>
          <div className="orbital-hero-charm">A</div>
        </div>
      </section>

      <section className="orbital-page">
        <div className="orbital-section-heading">
          <p className="orbital-kicker">The collection</p>
          <h2>Design it your way</h2>
        </div>
        <div className="orbital-category-grid">
          {[
            ['Colored charms', '₱10', 'Simple color designs'],
            ['Image charms', '₱20', 'University, pop culture & trends'],
            ['3D charms', '₱40', 'Dimensional statement pieces'],
            ['Dangled Deluxe', '₱50', 'Charms with playful movement'],
            ['Chained Deluxe', '₱65', 'Layered chain details'],
            ['Custom images', '₱25', 'Made personal by you'],
          ].map(([title, price, copy]) => (
            <article className="orbital-category-card" key={title}>
              <span>{price}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
