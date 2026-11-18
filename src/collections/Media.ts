import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { adminOnly } from '@/access/adminOnly'

export const Media: CollectionConfig = {
  admin: {
    group: 'Content',
  },
  slug: 'media',
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (!doc.filename) return doc

        const supabaseURL =
          process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
        doc.url = `${supabaseURL}/storage/v1/object/public/payload-media/${encodeURIComponent(doc.filename)}`
        return doc
      },
    ],
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    disableLocalStorage: true,
  },
}
