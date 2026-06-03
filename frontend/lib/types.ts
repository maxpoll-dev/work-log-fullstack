export type Option = { id: string; name: string }

export type JournalUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

export type JournalEntry = {
  id: string
  userId: string
  typeId: string
  unitId: string
  amount: string
  comment: string | null
  createdAt: string
  user: JournalUser
  workType: Option
  unitType: Option
}

export type JournalList = {
  items: JournalEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function userName(u: JournalUser): string {
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ')
  return full || u.email
}
