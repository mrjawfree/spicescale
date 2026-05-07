import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MealHistoryEntry {
  date: string
  name: string
  cuisine?: string
  rating?: number
  notes?: string
}

interface MealHistoryState {
  entries: Record<string, MealHistoryEntry>
  addEntry: (entry: MealHistoryEntry) => void
  removeEntry: (date: string) => void
  getEntriesForMonth: (year: number, month: number) => MealHistoryEntry[]
}

export const useMealHistoryStore = create<MealHistoryState>()(
  persist(
    (set, get) => ({
      entries: {},
      addEntry: (entry) =>
        set((state) => ({
          entries: { ...state.entries, [entry.date]: entry },
        })),
      removeEntry: (date) =>
        set((state) => {
          const { [date]: _, ...rest } = state.entries
          return { entries: rest }
        }),
      getEntriesForMonth: (year, month) => {
        const entries = get().entries
        return Object.values(entries).filter((e) => {
          const d = new Date(e.date)
          return d.getFullYear() === year && d.getMonth() === month
        })
      },
    }),
    { name: 'spicescale-meal-history' }
  )
)
