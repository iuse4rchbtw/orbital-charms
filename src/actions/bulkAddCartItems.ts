'use server'

import { Cart } from '@/payload-types'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

export type BulkCartItemInput = Pick<NonNullable<Cart['items']>[number], 'product' | 'variant' | 'quantity'>;

const getRelationID = (rel: unknown): string | undefined => {
  if (!rel) return undefined
  if (typeof rel === 'object' && rel !== null && 'id' in rel) {
    return String((rel as { id: number | string }).id)
  }
  return String(rel)
}

export async function bulkAddCartItems({
  cartID,
  items,
  secret,
}: {
  cartID?: number | string | null
  items: BulkCartItemInput[]
  secret?: string | null
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false as const, error: 'Items array cannot be empty.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const headers = await getHeaders()

    // Authenticate the current logged-in customer (if any) from Next.js request headers
    const { user } = await payload.auth({ headers })

    // Build normalized items list for new or existing cart
    const normalizeNewItems = (list: BulkCartItemInput[]) =>
      list
        .filter((item) => Boolean(item?.product))
        .map((item) => ({
          product: item.product,
          ...(item.variant ? { variant: item.variant } : {}),
          quantity: Math.max(1, Number(item.quantity ?? 1)),
        }))

    // Case A: No cartID yet -> create a new cart with all items in one write
    if (!cartID) {
      const createdCart = await payload.create({
        collection: 'carts',
        data: {
          ...(user ? { customer: user.id } : {}),
          items: normalizeNewItems(items),
        },
        user,
        overrideAccess: false,
      })

      return { success: true as const, cart: createdCart }
    }

    // Case B: Existing cart -> fetch, merge quantities, and update in one write
    // Note: Pass query context if your cart access control checks guest secrets
    const existingCart = await payload.findByID({
      collection: 'carts',
      id: cartID,
      depth: 0,
      user,
      overrideAccess: false,
      context: secret ? { secret } : undefined,
    })

    const mergedItems = Array.isArray(existingCart.items) ? [...existingCart.items] : []

    for (const incoming of items) {
      if (!incoming?.product) continue

      const incomingProductID = String(incoming.product)
      const incomingVariantID = getRelationID(incoming.variant)
      const qtyToAdd = Math.max(1, Number(incoming.quantity ?? 1))

      const existingIndex = mergedItems.findIndex((existing: Record<string, unknown>) => {
        const existingProductID = getRelationID(existing.product)
        const existingVariantID = getRelationID(existing.variant)
        return existingProductID === incomingProductID && existingVariantID === incomingVariantID
      })

      if (existingIndex > -1) {
        const currentQty = Number(mergedItems[existingIndex].quantity ?? 1)
        mergedItems[existingIndex] = {
          ...mergedItems[existingIndex],
          quantity: currentQty + qtyToAdd,
        }
      } else {
        mergedItems.push({
          product: incoming.product,
          ...(incoming.variant ? { variant: incoming.variant } : {}),
          quantity: qtyToAdd,
        })
      }
    }

    const updatedCart = await payload.update({
      collection: 'carts',
      id: cartID,
      data: {
        items: mergedItems,
      },
      user,
      overrideAccess: false,
      context: secret ? { secret } : undefined,
    })

    return { success: true as const, cart: updatedCart }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add items to cart.'
    return { success: false as const, error: message }
  }
}