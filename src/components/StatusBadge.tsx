export type BadgeKind = 'available' | 'reserved' | 'processing' | 'approved' | 'overdue'

const labels: Record<BadgeKind, string> = {
  available: 'Available',
  reserved: 'Already Reserved',
  processing: 'Processing',
  approved: 'Approved',
  overdue: 'With you · Check-in time',
}

function Icon({ kind }: { kind: BadgeKind }) {
  if (kind === 'processing') {
    return (
      <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'overdue') {
    return (
      <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.5v4M8 11v.5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5.2 8.2l1.9 1.9 3.7-3.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function StatusBadge({ kind }: { kind: BadgeKind }) {
  return (
    <span className={`badge badge-${kind}`}>
      <Icon kind={kind} />
      {labels[kind]}
    </span>
  )
}
