'use client'

import { useEffect, useState } from 'react'
import { notificationText, type Notification } from '@/data/toys'

// Shows approved/rejected notifications until the user dismisses them.
export default function NotificationPopups() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Notification[]) => setNotifications(data))
      .catch(() => {})
  }, [])

  function dismiss(id: number) {
    setNotifications((list) => list.filter((n) => n.id !== id))
    fetch(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {})
  }

  if (notifications.length === 0) return null

  return (
    <div className="notif-stack" aria-live="polite">
      {notifications.map((n) => (
        <article key={n.id} className="notif-card">
          <button className="notif-close" aria-label="Dismiss" onClick={() => dismiss(n.id)}>
            ×
          </button>
          <p className={`notif-kind ${n.kind}`}>{n.kind === 'approved' ? 'Approved' : 'Not approved'}</p>
          <h3>{n.toyName}</h3>
          <p>{notificationText(n)}</p>
        </article>
      ))}
    </div>
  )
}
