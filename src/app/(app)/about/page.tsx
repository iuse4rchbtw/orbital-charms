import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Orbital Charms',
  description:
    'Learn about Orbital Charms, a student-led pre-order business for modular Italian bracelets.',
}

export default function AboutPage() {
  return (
    <section className="orbital-page orbital-prose">
      <p className="orbital-kicker">Our story</p>
      <h1>Small charms. Big possibilities.</h1>
      <div className="orbital-about-grid">
        <p>
          Orbital Charms is a student-led business created for the Entrepreneurship subject of
          Grade 12 - Abad. Our venture brings customizable, modular Italian bracelets to students
          and teaching or non-teaching personnel at Santa Rosa Science and Technology High School.
        </p>
        <p>
          The name reflects our idea of style as a collection of pieces that revolve around an
          individual. Our tagline, “Styles that Orbit Your Charm,” celebrates friendship memories,
          celebrations, interests, and everyday favorites.
        </p>
      </div>
      <div className="orbital-about-grid" style={{ marginTop: '2.5rem' }}>
        <p>
          We use a pre-selling model: customers choose designs, place reservations, and then their
          pieces are purchased, assembled, packaged, and released for delivery or school pickup.
          This keeps production connected to actual demand.
        </p>
        <p>
          The business accepts cash and GCash. We aim to use recyclable or reusable packaging,
          manage inventory carefully, and offer a mix of colorful basics, 3D pieces, deluxe charms,
          keychains, and limited-edition accessories.
        </p>
      </div>
    </section>
  )
}
