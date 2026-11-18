import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { GCashCheckout } from '@/components/checkout/GCashCheckout'

export default function Checkout() {
  return (
    <div className="orbital-page">
      <h1 className="sr-only">Checkout</h1>
      <GCashCheckout />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
  title: 'Checkout',
}
