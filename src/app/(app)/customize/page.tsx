import type { Metadata } from 'next'

import { CharmCustomizer } from '@/components/CharmCustomizer'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'Build Your Bracelet',
  description: 'Create a custom Orbital Charms Italian bracelet.',
}

export default async function CustomizePage() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'products',
    depth: 3,
    limit: 100,
    draft: false,
    overrideAccess: false,
    where: {
      and: [
        { _status: { equals: 'published' } },
        {
          slug: {
            in: [
              'basic-colored-charms',
              'basic-image-charms',
              '3d-charms',
              'dangling-deluxe-charms',
              'chained-deluxe-charms',
            ],
          },
        },
      ],
    },
  })

  const charms = result.docs.flatMap((product) => {
    if (!product.variants?.docs) return []

    return product.variants.docs.flatMap((variant) => {
      if (typeof variant !== 'object') return []

      const optionIDs = (variant.options || []).map((option) =>
        typeof option === 'object' ? option.id : option,
      )
      const galleryItem = product.gallery?.find((item) => {
        if (!item.variantOption) return false
        const galleryOptionID =
          typeof item.variantOption === 'object' ? item.variantOption.id : item.variantOption
        return optionIDs.includes(galleryOptionID)
      })
      const media =
        galleryItem?.image && typeof galleryItem.image === 'object' ? galleryItem.image : undefined

      return [
        {
          id: String(variant.id),
          productId: String(product.id),
          name: variant.title || product.title,
          price: typeof variant.priceInPHP === 'number' ? variant.priceInPHP : 0,
          image: media?.url || '',
        },
      ]
    })
  })

  return <CharmCustomizer charms={charms} />
}
