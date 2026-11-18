import type { Metadata } from 'next'

import { CharmCustomizer } from '@/components/CharmCustomizer'

export const metadata: Metadata = {
  title: 'Build Your Bracelet',
  description: 'Create a custom Orbital Charms Italian bracelet.',
}

export default function CustomizePage() {
  return <CharmCustomizer />
}
