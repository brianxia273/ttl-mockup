type Option = { value: string; label: string }

type Props = {
  search: string
  onSearch: (value: string) => void
  filter: string
  onFilter: (value: string) => void
  placeholder: string
  options: Option[]
}

export default function SearchFilter({ search, onSearch, filter, onFilter, placeholder, options }: Props) {
  return (
    <div className="search-filter">
      <label className="search">
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} />
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" strokeLinecap="round" />
        </svg>
      </label>
      <select className="filter" value={filter} onChange={(e) => onFilter(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
