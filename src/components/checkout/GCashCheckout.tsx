'use client'

import React, { useMemo, useState } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import type { Cart } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'

export function GCashCheckout() {
  const { cart, clearCart, isLoading } = useCart()
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<number | string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('gcash')

  const cartItems = cart?.items || []
  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const product = typeof item.product === 'object' ? item.product : null
      const variant = typeof item.variant === 'object' ? item.variant : null
      const price =
        variant && typeof variant.priceInUSD === 'number'
          ? variant.priceInUSD
          : product && typeof product.priceInUSD === 'number'
            ? product.priceInUSD
            : 0
      return sum + price * (item.quantity || 0)
    }, 0)
  }, [cartItems])

  if (submitted) {
    return (
      <div className="orbital-checkout-success">
        <p className="orbital-kicker">Pre-order received</p>
        <h1>Thank you!</h1>
        <p>
          Pre-order #{orderId} is recorded in Payload. The seller will verify the GCash reference or
          cash payment and contact you about school delivery or pickup.
        </p>
        <button
          type="button"
          className="orbital-button"
          onClick={() => setSubmitted(false)}
        >
          Start a new pre-order
        </button>
      </div>
    )
  }

  return (
    <div className="orbital-checkout-grid">
      <div>
        <p className="orbital-kicker">Pre-order checkout</p>
        <h1>Almost yours.</h1>
        {!user && (
          <p className="mb-4">
            You can continue as a guest, or <Link href="/login?redirect=/checkout">log in</Link> /
            {' '}<Link href="/create-account?redirect=/checkout">create an account</Link>.
          </p>
        )}
        {user && (
          <p className="mb-4">
            Checking out as <strong>{user.email}</strong>.
          </p>
        )}
        <form
          className="orbital-checkout-form"
          onSubmitCapture={async (event) => {
            event.preventDefault()
            if (!cart || !cart.items?.length) {
              setError('Your cart is empty.')
              return
            }

            setSubmitting(true)
            setError('')
            const form = new FormData(event.currentTarget)
            const paymentMethod = form.get('payment')

            try {
              const response = await fetch('/api/preorders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  cartId: cart.id,
                  name: form.get('name'),
                  contact: form.get('contact'),
                  gradeSection: form.get('section'),
                  paymentMethod,
                  reference: form.get('reference'),
                  items: cart.items.map((item) => ({
                    product:
                      typeof item.product === 'object' ? item.product?.id : item.product,
                    variant:
                      typeof item.variant === 'object' ? item.variant?.id : item.variant,
                    quantity: item.quantity,
                  })),
                }),
              })
              const result = await response.json()
              if (!response.ok) throw new Error(result.error || 'Could not create the pre-order.')

              setOrderId(result.orderId)
              await clearCart()
              setSubmitted(true)
            } catch (submitError) {
              setError(
                submitError instanceof Error
                  ? submitError.message
                  : 'Could not create the pre-order.',
              )
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <label>
            Full name
            <input name="name" defaultValue={user?.name || ''} required />
          </label>
          <label>
            Email or messenger
            <input name="contact" type="email" defaultValue={user?.email || ''} required />
          </label>
          <label>
            Grade and section
            <input name="section" defaultValue="12 - Abad" required />
          </label>
          <fieldset>
            <legend>Payment</legend>
            <label className="orbital-payment-option">
              <input
                type="radio"
                name="payment"
                value="gcash"
                checked={paymentMethod === 'gcash'}
                onChange={() => setPaymentMethod('gcash')}
              />
              GCash
            </label>
            <label className="orbital-payment-option">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
              />
              Cash / school pickup
            </label>
          </fieldset>
          {paymentMethod === 'gcash' && (
            <label>
              GCash reference number
              <input name="reference" placeholder="Enter GCash reference" required />
            </label>
          )}
          {error && <p className="text-red-600">{error}</p>}
          <button className="orbital-button" type="submit" disabled={submitting || isLoading}>
            {submitting ? 'Placing pre-order...' : 'Place pre-order'}
          </button>
        </form>
      </div>

      <aside className="orbital-order-summary">
        <h2>Order summary</h2>
        {cartItems.length ? (
          <>
            <ul>
              {cartItems.map((item: NonNullable<Cart['items']>[number], index) => {
                const product = typeof item.product === 'object' ? item.product : null
                const variant = typeof item.variant === 'object' ? item.variant : null
                return (
                  <li key={`${product?.id || 'item'}-${index}`}>
                    {item.quantity} x {product?.title || 'Charm'}
                    {variant?.title ? ` - ${variant.title}` : ''}
                  </li>
                )
              })}
            </ul>
            <div className="orbital-order-total">
              <span>Pre-order total</span>
              <strong>₱{total}</strong>
            </div>
          </>
        ) : (
          <p>No custom bracelet configuration found. Return to the builder to create one.</p>
        )}
        <p className="orbital-preorder-note">
          This is a school project pre-order flow. No live payment is processed.
        </p>
      </aside>
    </div>
  )
}
