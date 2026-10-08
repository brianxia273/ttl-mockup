import { useState } from 'react'
import Hero from '../components/Hero'
import SearchFilter from '../components/SearchFilter'
import ToyCard from '../components/ToyCard'
import BorrowModal from '../components/BorrowModal'
import { BorrowConfirmationPopup } from '../components/BorrowConfirmationPopup'
import { toys, type Toy } from '../data/toys'

const filterOptions = [
  { value: 'all', label: 'Filter' },
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Already Reserved' },
]

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedToy, setSelectedToy] = useState<Toy | null>(null)
  const [confirmedToy, setConfirmedToy] = useState<Toy | null>(null)
  const [compact, setCompact] = useState(false)

  const visible = toys.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'all' || t.status === filter),
  )
  const types = [...new Set(visible.map((t) => t.type))]

  return (
    <>
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
        {types.length === 0 && <p className="empty">No toys match your search.</p>}
      </main>
      {selectedToy && (
        <BorrowModal
          toy={selectedToy}
          onClose={() => setSelectedToy(null)}
          onBorrow={() => {
            setConfirmedToy(selectedToy)
            setSelectedToy(null)
          }}
        />
      )}
      {confirmedToy && <BorrowConfirmationPopup toyName={confirmedToy.name} onClose={() => setConfirmedToy(null)} />}
    </>
  )
}
