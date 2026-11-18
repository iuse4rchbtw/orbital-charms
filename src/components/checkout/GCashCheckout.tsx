'use client'

import React, { useEffect, useState } from 'react'

type Preorder = {
  type: string
  slots: number
  charms: string[]
  total: number
}

export function GCashCheckout() {
  const [preorder, setPreorder] = useState<Preorder | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('orbital-preorder')
    if (saved) setPreorder(JSON.parse(saved))
  }, [])

  if (submitted) {
    return (
      <div className="orbital-checkout-success">
        <p className="orbital-kicker">Pre-order received</p>
        <h1>Thank you!</h1>
        <p>
          Your reservation is complete. The seller will verify the GCash reference or cash payment
          and contact you about school delivery or pickup before the order is finalized.
        </p>
        <button
          type="button"
          className="orbital-button"
          onClick={() => {
            localStorage.removeItem('orbital-preorder')
            setSubmitted(false)
            setPreorder(null)
          }}
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
        <form
          className="orbital-checkout-form"
          onSubmitCapture={(event) => {
            event.preventDefault()
            setSubmitted(true)
          }}
        >
          <label>
            Full name
            <input name="name" required />
          </label>
          <label>
            Email or messenger
            <input name="contact" required />
          </label>
          <label>
            Grade and section
            <input name="section" defaultValue="12 - Abad" required />
          </label>
          <fieldset>
            <legend>Payment</legend>
            <label className="orbital-payment-option">
              <input type="radio" name="payment" value="gcash" defaultChecked />
              GCash
            </label>
            <label className="orbital-payment-option">
              <input type="radio" name="payment" value="pickup" />
              Cash / school pickup
            </label>
          </fieldset>
          <label>
            GCash reference number
            <input name="reference" placeholder="Use a demo reference for this scaffold" />
          </label>
          <button className="orbital-button" type="submit">
            Place pre-order
          </button>
        </form>
      </div>

      <aside className="orbital-order-summary">
        <h2>Order summary</h2>
        {preorder ? (
          <>
            <p>
              <strong>{preorder.type}</strong>
              <span>{preorder.slots} charm slots</span>
            </p>
            {preorder.charms.length ? (
              <ul>
                {preorder.charms.map((charm, index) => (
                  <li key={`${charm}-${index}`}>{charm}</li>
                ))}
              </ul>
            ) : (
              <p>No charms selected yet.</p>
            )}
            <div className="orbital-order-total">
              <span>Pre-order total</span>
              <strong>₱{preorder.total}</strong>
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
