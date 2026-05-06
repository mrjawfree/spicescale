import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FavoriteType = 'sauce' | 'recipe'

interface FavoriteItem {
  id: string
  type: FavoriteType
}

interface FavoritesState {
  favorites: FavoriteItem[]
  toggleFavorite: (id: string, type: FavoriteType) => void
  isFavorite: (id: string) => boolean
  getFavoritesByType: (type: FavoriteType) => string[]
  count: () => number
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id, type) =>
        set((state) => {
          const exists = state.favorites.some((f) => f.id === id)
          return {
            favorites: exists
              ? state.favorites.filter((f) => f.id !== id)
              : [...state.favorites, { id, type }],
          }
        }),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      getFavoritesByType: (type) =>
        get()
          .favorites.filter((f) => f.type === type)
          .map((f) => f.id),
      count: () => get().favorites.length,
    }),
    { name: 'spicescale-favorites' },
  ),
)
