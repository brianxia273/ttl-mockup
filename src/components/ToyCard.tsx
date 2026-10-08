import type { Toy } from '../data/toys'
import StatusBadge from './StatusBadge'

type Props = {
  toy: Toy
  onBorrow: (toy: Toy) => void
  compact?: boolean
}

export default function ToyCard({ toy, onBorrow, compact = false }: Props) {
  // Reserved toys can't be borrowed, so they get no button
  const borrowButton = toy.status === 'available' && (
    <button className="btn btn-primary btn-small" onClick={() => onBorrow(toy)}>
      Borrow
    </button>
  )

  if (compact) {
    return (
      <article className="loan-card">
        <div className="loan-card-image" />
        <div className="loan-card-body">
          <h3>{toy.name}</h3>
          <StatusBadge kind={toy.status} />
          {borrowButton && <hr />}
          {borrowButton}
        </div>
      </article>
    )
  }

  return (
    <article className="toy-card">
      <div className="toy-card-image">{toy.image && <img src={toy.image} alt={toy.name} />}</div>
      <div className="toy-card-body">
        <h3>{toy.name}</h3>
        <p>Description: {toy.description}</p>
        <p>
          Who is it for?
          <br />
          {toy.whoFor}
        </p>
        <div className="toy-card-footer">
          <StatusBadge kind={toy.status} />
          {borrowButton}
        </div>
      </div>
    </article>
  )
}
