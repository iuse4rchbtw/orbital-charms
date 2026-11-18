import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Orbital Charms.',
}

export default function AboutPage() {
  return (
    <section className="orbital-page orbital-prose">
      <p className="orbital-kicker">Our story</p>
      <h1>Small charms. Big possibilities.</h1>
      <div className="orbital-about-grid">
        <p>
          Orbital Charms is a student-led pre-order business where personal style comes together,
          one charm at a time. We create modular Italian bracelets that let you build something
          meaningful, playful, and completely yours.
        </p>
        <p>
          Our collection is made for friendships, school memories, celebrations, and everyday
          favorites. Choose a preset bracelet or arrange a one-of-a-kind combination before it goes
          into production.
        </p>
      </div>
    </section>
  )
}
