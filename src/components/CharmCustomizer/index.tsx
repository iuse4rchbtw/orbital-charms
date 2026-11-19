'use client'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Price } from '@/components/Price'

import { bulkAddCartItems } from '@/actions/bulkAddCartItems'

type Charm = {
  id: string
  productId: string
  name: string
  price: number
  image: string
}

type Props = {
  charms: Charm[]
}

export function CharmCustomizer({ charms }: Props) {
  const router = useRouter()
  const { refreshCart, cart, isLoading } = useCart()
  const [adding, setAdding] = useState(false)
  const [slots, setSlots] = useState(18)
  const [selected, setSelected] = useState<(Charm | null)[]>(() =>
    Array.from({ length: 18 }, () => null),
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
  const isComplete = selected.length > 0 && selected.every((charm) => charm !== null)

  const saveConfiguration = async () => {
    if (!isComplete) {
      toast.error(`Fill all ${slots} charm slots before pre-ordering.`)
      return
    }

    setAdding(true)
    try {
      const selectedCharms = selected.filter((item): item is Charm => Boolean(item))
      const result = await bulkAddCartItems({
        cartID: cart?.id,
        items: selectedCharms.map((charm) => ({
          product: Number(charm.productId),
          variant: Number(charm.id),
          quantity: 1,
        })),
      })

      
      if (result.success) {
        // Persist cart ID / secret in localStorage if a brand-new guest cart was created
        if (!cart?.id && result.cart?.id) {
          localStorage.setItem('cart', String(result.cart.id))
          if ('secret' in result.cart && result.cart.secret) {
            localStorage.setItem('cart_secret', String(result.cart.secret))
          }
        }

        // Sync the useCart React context with the updated cart
        await refreshCart?.()
      } else {
        throw new Error(result.error ?? 'Could not add items to cart.')
      }

      const charmOrder = selected.map((charm, index) => ({
        slot: index + 1,
        charmId: charm?.id,
        productId: charm?.productId,
        name: charm?.name,
      }))

      localStorage.setItem(
        'orbital-preorder',
        JSON.stringify({
          type: 'Custom Italian Bracelet',
          slots,
          charms: charmOrder,
          total,
        }),
      )

      toast.success('Custom bracelet added to your cart.')
      if (!cart?.id) {
        window.location.assign('/checkout')
      } else {
        router.push('/checkout')
      }
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
