import { useState } from 'react'
import SearchFilter from '../components/SearchFilter'
import StatusBadge from '../components/StatusBadge'
import { loans, type Loan } from '../data/toys'

const filterOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'overdue', label: 'Check-in time' },
]

function LoanCard({ loan }: { loan: Loan }) {
  return (
    <article className="loan-card">
      <div className="loan-card-image" />
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
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

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

      {visible.length === 0 && <p className="empty">No toys match your search.</p>}
    </main>
  )
}
