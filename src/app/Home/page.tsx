'use client'

import { useCallback, useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import SearchFilter from '@/components/SearchFilter'
import ToyCard from '@/components/ToyCard'
import BorrowModal from '@/components/BorrowModal'
import { BorrowConfirmationPopup } from '@/components/BorrowConfirmationPopup'
import NotificationPopups from '@/components/NotificationPopups'
import type { Toy } from '@/data/toys'

const filterOptions = [
  { value: 'all', label: 'Filter' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Already Reserved' },
]

export default function HomePage() {
  const [toys, setToys] = useState<Toy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null)
  const [confirmedToy, setConfirmedToy] = useState<Toy | null>(null)
  const [compact, setCompact] = useState(false)

  const loadToys = useCallback(async () => {
    try {
      const res = await fetch('/api/toys')
      if (!res.ok) throw new Error()
      setToys((await res.json()) as Toy[])
      setError('')
    } catch {
      setError('Could not load toys. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadToys()
  }, [loadToys])

  // "Already Reserved" also covers toys someone has requested (processing)
  const matchesFilter = (t: Toy) =>
    filter === 'all' || (filter === 'available' ? t.status === 'available' : t.status !== 'available')

  const visible = toys.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) && matchesFilter(t),
  )
  const types = [...new Set(visible.map((t) => t.type))]

  return (
    <>
      <NotificationPopups />
      <Hero />
      <main className="container">
        <div className="home-toolbar">
          <SearchFilter
            search={search}
            onSearch={setSearch}
            filter={filter}
            onFilter={setFilter}
            placeholder="Search"
            options={filterOptions}
          />
          <div className="view-toggle" role="group" aria-label="Card view">
            <button className={compact ? '' : 'active'} onClick={() => setCompact(false)}>
              Full info
            </button>
            <button className={compact ? 'active' : ''} onClick={() => setCompact(true)}>
              Compact
            </button>
          </div>
        </div>
        {types.map((type) => (
          <section key={type} className="toy-section">
            <h2 className="section-title">{type}</h2>
            <div className={compact ? 'loan-grid' : undefined}>
              {visible
                .filter((t) => t.type === type)
                .map((toy) => (
                  <ToyCard key={toy.id} toy={toy} onBorrow={setSelectedToy} compact={compact} />
                ))}
            </div>
          </section>
        ))}
        {loading && <p className="empty">Loading toys…</p>}
        {!loading && error && <p className="empty">{error}</p>}
        {!loading && !error && types.length === 0 && <p className="empty">No toys match your search.</p>}
      </main>
      {selectedToy && (
        <BorrowModal
          toy={selectedToy}
          onClose={() => setSelectedToy(null)}
          onBorrow={() => {
            setConfirmedToy(selectedToy)
            setSelectedToy(null)
            loadToys()
          }}
        />
      )}
      {confirmedToy && <BorrowConfirmationPopup toyName={confirmedToy.name} onClose={() => setConfirmedToy(null)} />}
    </>
  )
}
