export type ToyStatus = 'available' | 'reserved'

export type Toy = {
  id: number
  name: string
  type: string
  description: string
  whoFor: string
  features: string
  lendingDays: number
  status: ToyStatus
  image?: string
}

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const base = {
  name: 'Toy Name',
  description: lorem,
  whoFor: lorem,
  features: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  lendingDays: 10,
}

export const toys: Toy[] = [
  { ...base, id: 1, type: 'Type 1', status: 'available' },
  { ...base, id: 2, type: 'Type 1', status: 'reserved' },
  { ...base, id: 3, type: 'Type 2', status: 'available' },
  { ...base, id: 4, type: 'Type 2', status: 'reserved' },
]

export type LoanStatus = 'processing' | 'approved' | 'overdue'

export type Loan = {
  id: number
  name: string
  status: LoanStatus
  dateLine: string
  hint: string
}

export const loans: Loan[] = [
  { id: 1, name: 'Toy 1', status: 'processing', dateLine: 'Requested 7 Oct 2026', hint: 'We’ll email you when it’s approved.' },
  { id: 2, name: 'Toy 2', status: 'processing', dateLine: 'Requested 7 Oct 2026', hint: 'We’ll email you when it’s approved.' },
  { id: 3, name: 'Toy 3', status: 'overdue', dateLine: 'Planned return 5 Oct 2026', hint: 'No rush! Reach out if you’d like to keep it longer.' },
  { id: 4, name: 'Toy 4', status: 'approved', dateLine: 'Due 15 Oct 2026', hint: '7 days left' },
]
