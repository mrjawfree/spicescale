import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sauce {
  id: string
  name: string
  brand: string
  heat: number
  rating: number
  heatNotes: string
  flavorNotes: string
}

interface CollectionState {
  sauces: Sauce[]
  addSauce: (sauce: Sauce) => void
  updateSauce: (id: string, updates: Partial<Omit<Sauce, 'id'>>) => void
  removeSauce: (id: string) => void
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      sauces: [],
      addSauce: (sauce) =>
        set((state) => ({ sauces: [sauce, ...state.sauces] })),
      updateSauce: (id, updates) =>
        set((state) => ({
          sauces: state.sauces.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),
      removeSauce: (id) =>
        set((state) => ({ sauces: state.sauces.filter((s) => s.id !== id) })),
    }),
    { name: 'spicescale-collection' },
  ),
)
