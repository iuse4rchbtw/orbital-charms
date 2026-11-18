'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

import { Price } from '@/components/Price'

type Charm = {
  id: string
  productId: string
  name: string
  price: number
  image: string
}

type Props = {
  base: {
    productId: string
    variantId?: string
  }
  charms: Charm[]
}

export function CharmCustomizer({ base, charms }: Props) {
  const router = useRouter()
  const { addItem, isLoading } = useCart()
  const [adding, setAdding] = useState(false)
  const [slots, setSlots] = useState(16)
  const [selected, setSelected] = useState<(Charm | null)[]>(() =>
    Array.from({ length: 16 }, () => null),
  )
  const [active, setActive] = useState<Charm | null>(charms[0])
  const [dragged, setDragged] = useState<Charm | null>(null)

  const changeSlots = (count: number) => {
    const nextCount = Math.max(1, Math.min(24, count))
    setSlots(nextCount)
    setSelected((current) => {
      const next = Array.from({ length: nextCount }, (_, index) => current[index] ?? null)
      return next
    })
  }

  const placeCharm = (charm: Charm, index: number) => {
    setSelected((current) => {
      const nextEmptyIndex = current.findIndex((item) => item === null)
      if (index !== nextEmptyIndex) return current

      return current.map((item, itemIndex) => (itemIndex === index ? charm : item))
    })
  }

  const total = useMemo(
    () => selected.reduce((sum, charm) => sum + (charm?.price ?? 0), 0),
    [selected],
  )

  const saveConfiguration = async () => {
    localStorage.setItem(
      'orbital-preorder',
      JSON.stringify({
        type: 'Custom Italian Bracelet',
        slots,
        charms: selected.map((charm) => charm?.name).filter(Boolean),
        total,
      }),
    )

    if (!base.productId) {
      toast.error('The bracelet base is not available.')
      return
    }

    setAdding(true)
    try {
      await addItem({
        product: Number(base.productId),
        variant: base.variantId ? Number(base.variantId) : undefined,
      })

      for (const charm of selected.filter((item): item is Charm => Boolean(item))) {
        await addItem({
          product: Number(charm.productId),
          variant: Number(charm.id),
        })
      }

      toast.success('Custom bracelet added to your cart.')
      router.push('/checkout')
    } catch {
      toast.error('Could not add the bracelet to your cart.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <section className="orbital-customizer">
      <div className="orbital-customizer-header">
        <div>
          <p className="orbital-kicker">Interactive pre-order</p>
          <h1>Build your bracelet</h1>
        </div>
        <div className="orbital-slot-control">
          <label htmlFor="slots">Charm slots</label>
          <input
            id="slots"
            type="range"
            min="1"
            max="24"
            value={slots}
            onChange={(event) => changeSlots(Number(event.target.value))}
          />
          <span>{slots}</span>
        </div>
      </div>

      <div className="orbital-customizer-grid">
        <aside className="orbital-charm-panel">
          <h2>Charms</h2>
          <p>Drag a charm onto the bracelet, or select it and tap an empty slot.</p>
          <div className="orbital-charm-list">
            {charms.map((charm) => (
              <button
                type="button"
                key={charm.id}
                className={`orbital-charm-card ${active?.id === charm.id ? 'is-active' : ''}`}
                draggable
                onDragStart={() => setDragged(charm)}
                onDragEnd={() => setDragged(null)}
                onClick={() => setActive(charm)}
              >
                <span className="orbital-mini-charm">
                  {charm.image ? <img src={charm.image} alt="" /> : <span>Charm</span>}
                </span>
                <span>
                  <strong>{charm.name}</strong>
                  <small>
                    <Price amount={charm.price} as="span" />
                  </small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="orbital-bracelet-panel">
          <div className="orbital-bracelet" aria-label="Custom bracelet preview">
            {selected.map((charm, index) => (
              <button
                type="button"
                aria-label={
                  charm ? `Remove ${charm.name} from slot ${index + 1}` : `Slot ${index + 1}`
                }
                key={index}
                className={`orbital-bracelet-slot ${charm ? 'is-filled' : ''}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  if (dragged) placeCharm(dragged, index)
                }}
                onClick={() => {
                  if (charm) {
                    setSelected((current) => {
                      const remaining = current.filter((item): item is Charm => Boolean(item))
                      remaining.splice(index, 1)
                      return [...remaining, ...Array(current.length - remaining.length).fill(null)]
                    })
                  } else if (active && index === selected.findIndex((item) => item === null)) {
                    placeCharm(active, index)
                  }
                }}
              >
                {charm ? (
                  <span>{charm.image ? <img src={charm.image} alt="" /> : charm.name}</span>
                ) : (
                  <span className="orbital-empty-slot">+</span>
                )}
              </button>
            ))}
          </div>

          <div className="orbital-summary">
            <div>
              <span>Bracelet</span>
              <strong>
                <Price amount={0} as="span" />
              </strong>
            </div>
            <div>
              <span>{selected.filter(Boolean).length} selected charm(s)</span>
              <strong>
                <Price amount={total} as="span" />
              </strong>
            </div>
            <div className="orbital-summary-total">
              <span>Pre-order total</span>
              <strong>
                <Price amount={total} as="span" />
              </strong>
            </div>
            <button
              type="button"
              className="orbital-button"
              disabled={adding || isLoading}
              onClick={() => void saveConfiguration()}
            >
              {adding ? 'Adding to cart...' : 'Pre-order this bracelet'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
