import React from 'react'

type BraceletCharm = {
  slot: number
  name?: string
}

type BraceletConfiguration = {
  type?: string
  slots?: number
  charms?: BraceletCharm[]
  total?: number
}

type Props = {
  value?: unknown
  siblingData?: {
    items?: unknown
  }
  data?: {
    items?: unknown
  }
}

type Relation =
  number | string | { id?: number | string; title?: string; name?: string; label?: string }

type OrderItem = {
  id?: number | string
  product?: Relation
  variant?: Relation
  quantity?: number
}

function getRelationTitle(relation: Relation | undefined): string {
  if (!relation) return 'Item'
  if (typeof relation === 'object') {
    return relation.title || relation.name || relation.label || `Item #${relation.id || ''}`.trim()
  }
  return `Item #${relation}`
}

function getRelationId(relation: Relation | undefined): string | null {
  if (typeof relation === 'number' || typeof relation === 'string') return String(relation)
  if (relation && typeof relation === 'object' && relation.id != null) return String(relation.id)
  return null
}

function parseConfiguration(value: unknown): BraceletConfiguration | null {
  if (typeof value !== 'string') return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') return null

    const configuration = parsed as BraceletConfiguration
    if (!Array.isArray(configuration.charms)) return null

    return configuration
  } catch {
    return null
  }
}

export function BraceletConfigurationField({ value, siblingData, data }: Props) {
  const configuration = parseConfiguration(value)
  const charms = configuration?.charms
  const items = Array.isArray(siblingData?.items)
    ? siblingData.items
    : Array.isArray(data?.items)
      ? data.items
      : []

  const configuredCounts = new Map<string, number>()
  if (charms) {
    for (const charm of charms) {
      const charmId = (charm as BraceletCharm & { charmId?: string }).charmId
      if (charmId) {
        configuredCounts.set(charmId, (configuredCounts.get(charmId) || 0) + 1)
      }
    }
  }

  const shopItems = (items as OrderItem[]).flatMap((item) => {
    const variantId = getRelationId(item.variant)
    const configuredQuantity = variantId ? configuredCounts.get(variantId) || 0 : 0
    const quantity = Math.max(0, (item.quantity || 0) - configuredQuantity)

    if (variantId) {
      configuredCounts.set(variantId, Math.max(0, configuredQuantity - (item.quantity || 0)))
    }

    return quantity > 0 ? [{ item, quantity }] : []
  })

  return (
    <div>
      <label
        htmlFor="bracelet-configuration"
        style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}
      >
        Bracelet and shop charm order
      </label>
      {configuration && charms ? (
        <div id="bracelet-configuration">
          <div
            style={{
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '4px',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                padding: '0.75rem',
                borderBottom: '1px solid var(--theme-elevation-150)',
              }}
            >
              <strong>{configuration.type || 'Bespoke bracelet'}</strong>
              {typeof configuration.slots === 'number' && (
                <span style={{ marginLeft: '0.5rem' }}>({configuration.slots} slots)</span>
              )}
            </div>
            <ol style={{ margin: 0 }}>
              {charms.map((charm) => (
                <li key={charm.slot} style={{ padding: '0.5rem 0.75rem' }}>
                  <strong>Slot {charm.slot}:</strong> {charm.name || 'Charm'}
                </li>
              ))}
            </ol>
          </div>

          <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: '4px' }}>
            <div
              style={{
                padding: '0.75rem',
                borderBottom: '1px solid var(--theme-elevation-150)',
              }}
            >
              <strong>Shop charms</strong>
            </div>
            {shopItems.length ? (
              <ul style={{ margin: 0 }}>
                {shopItems.map(({ item, quantity }) => (
                  <li
                    key={
                      item.id ||
                      getRelationId(item.variant) ||
                      getRelationId(item.product) ||
                      undefined
                    }
                    style={{ padding: '0.5rem 0.75rem' }}
                  >
                    <strong>{quantity} x</strong> {getRelationTitle(item.product)}
                    {item.variant ? ` - ${getRelationTitle(item.variant)}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, padding: '0.75rem' }}>No separate shop charms.</p>
            )}
          </div>
        </div>
      ) : (
        <pre
          id="bracelet-configuration"
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            margin: 0,
            padding: '0.75rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {typeof value === 'string' ? value : 'No bracelet configuration'}
        </pre>
      )}
    </div>
  )
}
