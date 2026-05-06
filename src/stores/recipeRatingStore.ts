import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecipeRatingState {
  ratings: Record<string, number>
  setRating: (recipeId: string, rating: number) => void
  getRating: (recipeId: string) => number
  clearRating: (recipeId: string) => void
  getRatedRecipeIds: () => string[]
}

export const useRecipeRatingStore = create<RecipeRatingState>()(
  persist(
    (set, get) => ({
      ratings: {},
      setRating: (recipeId, rating) =>
        set((state) => ({
          ratings: { ...state.ratings, [recipeId]: rating },
        })),
      getRating: (recipeId) => get().ratings[recipeId] ?? 0,
      clearRating: (recipeId) =>
        set((state) => {
          const { [recipeId]: _, ...rest } = state.ratings
          return { ratings: rest }
        }),
      getRatedRecipeIds: () =>
        Object.keys(get().ratings).filter((id) => get().ratings[id] > 0),
    }),
    { name: 'spicescale-recipe-ratings' },
  ),
)
