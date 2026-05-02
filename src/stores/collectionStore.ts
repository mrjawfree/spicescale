import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sauce {
  id: string
  name: string
  brand: string
  heat: number
  rating: number
}

interface CollectionState {
  sauces: Sauce[]
  addSauce: (sauce: Sauce) => void
  removeSauce: (id: string) => void
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      sauces: [],
      addSauce: (sauce) =>
        set((state) => ({ sauces: [...state.sauces, sauce] })),
      removeSauce: (id) =>
        set((state) => ({ sauces: state.sauces.filter((s) => s.id !== id) })),
    }),
    { name: 'spicescale-collection' },
  ),
)
