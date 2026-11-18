import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

type CheckoutItem = {
  product: number | string
  variant?: number | string
  quantity: number
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })

  try {
    const body = await request.json()
    const items = Array.isArray(body.items) ? (body.items as CheckoutItem[]) : []

    if (!items.length) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    if (!body.name || !body.contact || !body.gradeSection) {
      return NextResponse.json(
        { error: 'Name, contact, and grade or section are required.' },
        { status: 400 },
      )
    }

    const orderItems: Array<{ product: number; variant?: number; quantity: number }> = []
    let amount = 0

    for (const item of items) {
      if (!item.product || item.quantity < 1) continue

      const productID = Number(item.product)
      const product = await payload.findByID({
        collection: 'products',
        id: productID,
        depth: 0,
      })

      let price = typeof product.priceInUSD === 'number' ? product.priceInUSD : 0

      if (item.variant) {
        const variantID = Number(item.variant)
        const variant = await payload.findByID({
          collection: 'variants',
          id: variantID,
          depth: 0,
        })
        if (typeof variant.priceInUSD === 'number') price = variant.priceInUSD
      }

      amount += price * item.quantity
      orderItems.push({
        product: product.id,
        ...(item.variant ? { variant: Number(item.variant) } : {}),
        quantity: item.quantity,
      })
    }

    if (!orderItems.length) {
      return NextResponse.json({ error: 'No valid products were found.' }, { status: 400 })
    }

    const paymentMethod = body.paymentMethod === 'cash' ? 'cash' : 'gcash'
    const order = await payload.create({
      collection: 'orders',
      depth: 0,
      data: {
        amount,
        currency: 'USD',
        customerEmail: body.contact,
        customerName: body.name,
        gradeSection: body.gradeSection,
        paymentMethod,
        paymentReference: paymentMethod === 'gcash' ? body.reference || '' : '',
        items: orderItems,
        status: 'processing',
      },
    })

    if (body.cartId) {
      await payload.update({
        collection: 'carts',
        id: body.cartId,
        data: {
          purchasedAt: new Date().toISOString(),
          status: 'purchased',
          subtotal: amount,
        },
      })
    }

    return NextResponse.json({
      orderId: order.id,
      accessToken: order.accessToken,
      amount,
    })
  } catch (error) {
    payload.logger.error({ err: error, message: 'Error creating pre-order' })
    return NextResponse.json({ error: 'Could not create the pre-order.' }, { status: 500 })
  }
}
