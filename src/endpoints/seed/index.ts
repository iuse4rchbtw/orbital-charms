import type { CollectionSlug, Payload, PayloadRequest, File } from 'payload'
import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Media, VariantOption } from '@/payload-types'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'products',
  'forms',
  'form-submissions',
  'variants',
  'variantOptions',
  'variantTypes',
]

const categories = [
  'Basic Colored',
  'Basic Image',
  '3D',
  'Dangling-Deluxe',
  'Chained-Deluxe',
  'Premade Bracelets',
]

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  for (const collection of collections) {
    await payload.db.deleteMany({ collection, req, where: {} })
    if (payload.collections[collection].config.versions) {
      await payload.db.deleteVersions({ collection, req, where: {} })
    }
  }

  payload.logger.info(`— Seeding categories...`)

  await Promise.all(
    categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: {
          title: category,
          slug: category,
        },
      }),
    ),
  )

  payload.logger.info(`— Seeding Orbital Charms products and variants...`)

  await ensureMediaBucket()

  const charmVariantType = await payload.create({
    collection: 'variantTypes',
    data: {
      name: 'design',
      label: 'Charm Design',
    },
  })

  const charmNames: Record<number, string> = {
    0: 'Silver',
    1: 'Gold',
    2: 'Rainbow Wave',
    3: 'Eagle',
    4: 'I Love Me',
    5: 'Iron Mask',
    6: 'Spider Hero',
    7: 'Panther Wordmark',
    8: 'Panther Team',
    9: 'Golden Butterfly',
    10: 'Silver Butterfly',
    11: 'Pink Clover',
    12: 'Crystal Flower',
    13: 'Pink Butterfly',
    14: 'Crystal Bow',
    15: 'Pink Bow',
    16: 'Heart Key',
    17: 'Crystal Star',
    18: 'Purple Bow',
    19: 'Shell and Star',
    20: 'Sunburst',
    21: 'Golden Flower',
    22: 'Crystal Moon',
    23: 'Golden Star',
    24: 'Pink Butterfly',
    25: 'Gold Bow Chain',
    26: 'Silver Star Chain',
    27: 'Blue Butterfly Chain',
    28: 'Gold Flower Chain',
  }

  const charmOptions: Record<number, VariantOption> = {}
  for (let index = 0; index <= 28; index++) {
    const label = charmNames[index]
    const option = await payload.create({
      collection: 'variantOptions',
      depth: 0,
      data: {
        label,
        value: `charm-${index}`,
        variantType: charmVariantType.id,
      },
    })
    charmOptions[index] = option
  }

  const categoryNames = [
    'Basic Colored',
    'Basic Image',
    '3D',
    'Dangling-Deluxe',
    'Chained-Deluxe',
    'Premade Bracelets',
  ]
  const categoryResult = await payload.find({
    collection: 'categories',
    limit: 100,
    where: {
      title: {
        in: categoryNames,
      },
    },
  })
  const categoryMap = new Map(categoryResult.docs.map((category) => [category.title, category]))

  const orbitalTypes = [
    {
      title: 'Plain Charms',
      slug: 'basic-colored-charms',
      category: 'Basic Colored',
      price: 1000,
      imageIndexes: [0, 1],
      description: 'Plain Italian charms in silver or gold.',
    },
    {
      title: 'Basic Image Charms',
      slug: 'basic-image-charms',
      category: 'Basic Image',
      price: 2000,
      imageIndexes: [2, 3, 4, 5, 6, 7, 8],
      description: 'Popular image charms for school spirit, fandoms, and personal interests.',
    },
    {
      title: '3D Charms',
      slug: '3d-charms',
      category: '3D',
      price: 4000,
      imageIndexes: [9, 10, 11, 12, 13, 21, 22, 23, 24],
      description:
        'Dimensional statement charms with crystal, floral, butterfly, and star details.',
    },
    {
      title: 'Dangling Deluxe Charms',
      slug: 'dangling-deluxe-charms',
      category: 'Dangling-Deluxe',
      price: 5000,
      imageIndexes: [14, 15, 16, 17, 18, 19, 20],
      description: 'Deluxe charms with playful movement and layered decorative details.',
    },
    {
      title: 'Chained Deluxe Charms',
      slug: 'chained-deluxe-charms',
      category: 'Chained-Deluxe',
      price: 6500,
      imageIndexes: [25, 26, 27, 28],
      description: 'Charms with attached chains for a detailed, connected bracelet look.',
    },
  ]

  const seededCharmProducts: Awaited<ReturnType<typeof payload.create>>[] = []

  for (const type of orbitalTypes) {
    const gallery: Array<{ image: Media; variantOption: VariantOption }> = []

    for (const index of type.imageIndexes) {
      const media = await payload.create({
        collection: 'media',
        depth: 0,
        data: {
          alt: `${charmNames[index]} - Orbital Charms`,
        },
        file: await readLocalCharmFile(index),
      })
      gallery.push({ image: media as Media, variantOption: charmOptions[index] })
    }

    const product = await payload.create({
      collection: 'products',
      depth: 0,
      data: {
        title: type.title,
        slug: type.slug,
        _status: 'published',
        layout: [],
        gallery: gallery.map(({ image, variantOption }) => ({
          image: image.id,
          variantOption: variantOption.id,
        })),
        categories: categoryMap.get(type.category) ? [categoryMap.get(type.category)!.id] : [],
        enableVariants: true,
        variantTypes: [charmVariantType.id],
        inventory: 999,
        priceInPHPEnabled: true,
        priceInPHP: type.price,
      },
      req,
    })

    for (const item of gallery) {
      await payload.create({
        collection: 'variants',
        depth: 0,
        data: {
          title: item.variantOption.label,
          product: product.id,
          options: [item.variantOption.id],
          inventory: 999,
          priceInPHPEnabled: true,
          priceInPHP: type.price,
          _status: 'published',
        },
        req,
      })
    }

    seededCharmProducts.push(product)
  }

  const braceletGallery: Array<{ image: Media; variantOption: VariantOption }> = []
  for (const index of [0, 1]) {
    const media = await payload.create({
      collection: 'media',
      depth: 0,
      data: {
        alt: `${charmNames[index]} - Orbital Charms`,
      },
      file: await readLocalCharmFile(index),
    })
    braceletGallery.push({ image: media as Media, variantOption: charmOptions[index] })
  }

  const premadeBracelet = await payload.create({
    collection: 'products',
    depth: 0,
    data: {
      title: 'Premade Italian Bracelet',
      slug: 'premade-italian-bracelet',
      _status: 'published',
      layout: [],
      gallery: braceletGallery.map(({ image, variantOption }) => ({
        image: image.id,
        variantOption: variantOption.id,
      })),
      categories: categoryMap.get('Premade Bracelets')
        ? [categoryMap.get('Premade Bracelets')!.id]
        : [],
      enableVariants: true,
      variantTypes: [charmVariantType.id],
      inventory: 999,
      priceInPHPEnabled: true,
      priceInPHP: 17000,
    },
    req,
  })

  for (const item of braceletGallery) {
    await payload.create({
      collection: 'variants',
      depth: 0,
      data: {
        title: item.variantOption.label,
        product: premadeBracelet.id,
        options: [item.variantOption.id],
        inventory: 999,
        priceInPHPEnabled: true,
        priceInPHP: 17000,
        _status: 'published',
      },
      req,
    })
  }

  payload.logger.info('Seeded database successfully!')
}

async function readLocalCharmFile(index: number): Promise<File> {
  const filePath = path.join(process.cwd(), 'public', 'charms', `${index}.png`)
  const data = await readFile(filePath)

  return {
    name: `${index}.png`,
    data,
    mimetype: 'image/png',
    size: data.byteLength,
  }
}

async function ensureMediaBucket(): Promise<void> {
  const bucket = process.env.S3_BUCKET || 'payload-media'
  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'http://127.0.0.1:54321/storage/v1/s3',
    region: process.env.S3_REGION || 'local',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  })

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }))
    return
  } catch (error) {
    const code = error instanceof Error && 'Code' in error ? error.Code : undefined
    if (code !== 'NotFound' && code !== 'NoSuchBucket' && code !== '404') {
      throw error
    }
  }

  await client.send(new CreateBucketCommand({ Bucket: bucket }))
}

function richTextFromString(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
