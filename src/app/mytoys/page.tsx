'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchFilter from '@/components/SearchFilter'
import StatusBadge from '@/components/StatusBadge'
import NotificationPopups from '@/components/NotificationPopups'
import { toLoan, type Loan, type Reservation } from '@/data/toys'
import { useUser } from '@/lib/useUser'

const filterOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'overdue', label: 'Check-in time' },
]

function LoanCard({ loan }: { loan: Loan }) {
  return (
    <article className="loan-card">
      <div className="loan-card-image">
        {loan.image && <img src={loan.image} alt={loan.name} className="h-full w-full object-cover" />}
      </div>
      <div className="loan-card-body">
        <h3>{loan.name}</h3>
        <StatusBadge kind={loan.status} />
        <hr />
        <p className={loan.status === 'overdue' ? 'loan-date overdue' : 'loan-date'}>{loan.dateLine}</p>
        <p className={loan.status === 'overdue' ? 'loan-hint overdue' : 'loan-hint'}>{loan.hint}</p>
      </div>
    </article>
  )
}

const plural = (n: number) => `${n} toy${n === 1 ? '' : 's'}`

export default function MyToysPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (userLoading) return
    if (!user) {
      router.replace('/login?next=/mytoys')
      return
    }
    fetch(`/api/users/${user.id}/toys`)
      .then(async (res) => {
        if (!res.ok) throw new Error()
        const reservations = (await res.json()) as Reservation[]
        setLoans(reservations.map(toLoan))
      })
      .catch(() => setError('Could not load your toys. Please try again later.'))
      .finally(() => setLoading(false))
  }, [user, userLoading, router])

  const visible = loans.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'all' || l.status === filter),
  )
  const processing = visible.filter((l) => l.status === 'processing')
  const withYou = visible.filter((l) => l.status !== 'processing')
  const overdue = withYou.filter((l) => l.status === 'overdue').length

  return (
    <main className="container my-toys">
      <NotificationPopups />
      <h1 className="page-title">My Toys</h1>
      <p className="muted">Here are all your toy requests, current loans and return dates.</p>
      <SearchFilter
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        placeholder="Search your toys"
        options={filterOptions}
      />

      {processing.length > 0 && (
        <section className="loan-section">
          <h2 className="section-title">
            Being processed <span className="count">{plural(processing.length)}</span>
          </h2>
          <p className="muted">Your requests are being reviewed. These toys are not ready to collect yet.</p>
          <div className="loan-grid">
            {processing.map((l) => <LoanCard key={l.id} loan={l} />)}
          </div>
        </section>
      )}

      {withYou.length > 0 && (
        <section className="loan-section">
          <h2 className="section-title">
            Currently with you{' '}
            <span className="count">
              {plural(withYou.length)}
              {overdue > 0 && ` · ${overdue} ready to check in`}
            </span>
          </h2>
          <p className="muted">These toys are approved and in your care. Enjoy, and reach out anytime if something comes up.</p>
          <div className="loan-grid">
            {withYou.map((l) => <LoanCard key={l.id} loan={l} />)}
          </div>
        </section>
      )}

      {loading && <p className="empty">Loading your toys…</p>}
      {!loading && error && <p className="empty">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="empty">{loans.length === 0 ? 'You haven’t borrowed any toys yet.' : 'No toys match your search.'}</p>
      )}
    </main>
  )
}
