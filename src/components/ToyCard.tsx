import type { Toy } from '../data/toys'
import StatusBadge from './StatusBadge'

type Props = {
  toy: Toy
  onRent: (toy: Toy) => void
  compact?: boolean
}

export default function ToyCard({ toy, onRent, compact = false }: Props) {
  if (compact) {
    return (
      <article className="loan-card">
        <div className="loan-card-image" />
        <div className="loan-card-body">
          <h3>{toy.name}</h3>
          <StatusBadge kind={toy.status} />
          <hr />
          <button className="btn btn-primary btn-small" onClick={() => onRent(toy)}>
            Rent
          </button>
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
          <button className="btn btn-primary btn-small" onClick={() => onRent(toy)}>
            Rent
          </button>
        </div>
      </div>
    </article>
  )
}
