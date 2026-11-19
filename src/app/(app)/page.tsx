import Link from 'next/link'

export const metadata = {
  title: 'Orbital Charms',
  description:
    'Styles that Orbit Your Charm. Customizable Italian bracelets, designed through a student-led pre-order venture.',
}

export default function HomePage() {
  return (
    <>
      <section className="orbital-hero">
        <div className="orbital-hero-copy">
          <p className="orbital-kicker">Styles that Orbit Your Charm</p>
          <h1>Charm every moment.</h1>
          <p>
            A student-led jewelry pre-order venture for the Santa Rosa Science and Technology High
            School community. Build a modular Italian bracelet that reflects your story.
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
          <img className="orbital-hero-charm" src="/charms/9.png" alt="Butterfly charm" />
          <img className="orbital-hero-charm" src="/charms/14.png" alt="Bow charm" />
          <img className="orbital-hero-charm" src="/charms/17.png" alt="Crystal star charm" />
          <img className="orbital-hero-charm" src="/charms/24.png" alt="Pink butterfly charm" />
        </div>
      </section>

      <section className="orbital-page">
        <div className="orbital-section-heading">
          <p className="orbital-kicker">The collection</p>
          <h2>Choose the details that feel like you</h2>
        </div>
        <div className="orbital-category-grid">
          {[
            ['Plain charms', '₱10', 'Basic charms in silver or gold', '/charms/0.png'],
            [
              'Image charms',
              '₱20',
              'Basic charms featuring images and familiar themes',
              '/charms/3.png',
            ],
            ['3D charms', '₱40', 'Dimensional statement pieces', '/charms/9.png'],
            ['Dangling Deluxe', '₱50', 'Charms with playful movement', '/charms/14.png'],
            ['Chained Deluxe', '₱65', 'Layered chain details', '/charms/25.png'],
            ['Premade bracelets', '₱170', 'Ready-to-wear bracelet designs', '/charms/32.png'],
          ].map(([title, price, copy, image]) => (
            <article className="orbital-category-card" key={title}>
              <span>{price}</span>
              <img className="orbital-category-photo" src={image} alt={title} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="orbital-page orbital-prose">
        <div className="orbital-section-heading">
          <p className="orbital-kicker">How pre-order works</p>
          <h2>Design, reserve, collect</h2>
        </div>
        <div className="orbital-about-grid">
          <p>
            Choose a premade bracelet or arrange your own charm combination in the interactive
            builder. Submit the pre-order and select cash or GCash as your payment option.
          </p>
          <p>
            Orders are collected before purchase, then prepared and delivered or made available for
            school pickup. Each piece is planned as a keepsake, gift, or everyday expression of
            personal style.
          </p>
        </div>
      </section>
    </>
  )
}
