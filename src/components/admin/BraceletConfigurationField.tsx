import React from 'react'

type BraceletCharm = {
  slot: number
  name?: string
}

type BraceletConfiguration = {
  type?: string
  slots?: number
  charms?: BraceletCharm[]
}

type Props = {
  value?: unknown
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

export function BraceletConfigurationField({ value }: Props) {
  const configuration = parseConfiguration(value)
  const charms = configuration?.charms

  return (
    <div>
      <label
        htmlFor="bracelet-configuration"
        style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}
      >
        Bracelet configuration
      </label>
      {configuration && charms ? (
        <div
          id="bracelet-configuration"
          style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: '4px' }}
        >
          <div style={{ padding: '0.75rem' }}>
            <strong>{configuration.type || 'Custom bracelet'}</strong>
            {typeof configuration.slots === 'number' && (
              <span style={{ marginLeft: '0.5rem' }}>
                ({configuration.slots} slots)
              </span>
            )}
          </div>
          <ol style={{ borderTop: '1px solid var(--theme-elevation-150)', margin: 0 }}>
            {charms.map((charm) => (
              <li key={charm.slot} style={{ padding: '0.5rem 0.75rem' }}>
                <strong>Slot {charm.slot}:</strong> {charm.name || 'Charm'}
              </li>
            ))}
          </ol>
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
