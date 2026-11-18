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

        doc.url = `/api/media/file/${encodeURIComponent(doc.filename)}`
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
