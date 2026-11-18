import config from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })

  try {
    const body = await request.json()
    const cartId = body.cartId
    if (!cartId) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    const cart = await payload.findByID({
      collection: 'carts',
      id: Number(cartId),
      depth: 3,
    })
    const items = (cart.items || []).filter((item) => item.quantity && item.quantity > 0)

    if (!items.length) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }
    if (cart.status === 'purchased' || cart.purchasedAt) {
      return NextResponse.json({ error: 'This cart has already been checked out.' }, { status: 400 })
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
      const productValue = typeof item.product === 'object' ? item.product?.id : item.product
      if (!productValue || item.quantity < 1) continue

      const productID = Number(productValue)
      const product = await payload.findByID({
        collection: 'products',
        id: productID,
        depth: 0,
      })

      let price = typeof product.priceInUSD === 'number' ? product.priceInUSD : 0

      if (item.variant) {
        const variantID =
          typeof item.variant === 'object' ? item.variant.id : Number(item.variant)
        const variant = await payload.findByID({
          collection: 'variants',
          id: variantID,
          depth: 0,
        })
        if (typeof variant.priceInUSD === 'number') price = variant.priceInUSD
        if (typeof variant.inventory === 'number' && variant.inventory < item.quantity) {
          return NextResponse.json(
            { error: `${product.title} does not have enough stock.` },
            { status: 400 },
          )
        }
      } else if (typeof product.inventory === 'number' && product.inventory < item.quantity) {
        return NextResponse.json(
          { error: `${product.title} does not have enough stock.` },
          { status: 400 },
        )
      }

      amount += price * item.quantity
      orderItems.push({
        product: product.id,
        ...(item.variant
          ? {
              variant:
                typeof item.variant === 'object' ? item.variant.id : Number(item.variant),
            }
          : {}),
        quantity: item.quantity,
      })
    }

    if (!orderItems.length) {
      return NextResponse.json({ error: 'No valid products were found.' }, { status: 400 })
    }

    const paymentMethod = body.paymentMethod === 'cash' ? 'cash' : 'gcash'
    if (paymentMethod === 'gcash' && !body.reference) {
      return NextResponse.json(
        { error: 'A GCash reference number is required.' },
        { status: 400 },
      )
    }

    const { user } = await payload.auth({ headers: request.headers })
    const order = await payload.create({
      collection: 'orders',
      depth: 0,
      data: {
        amount,
        currency: 'USD',
        customer: user?.id,
        customerEmail: user?.email || body.contact,
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
