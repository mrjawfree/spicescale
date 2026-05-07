import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface AggregateRating {
  average: number
  count: number
}

interface RecipeRatingState {
  ratings: Record<string, number>
  aggregates: Record<string, AggregateRating>
  setRating: (recipeId: string, rating: number) => void
  getRating: (recipeId: string) => number
  clearRating: (recipeId: string) => void
  getRatedRecipeIds: () => string[]
  getAggregate: (recipeId: string) => AggregateRating | null
  fetchAggregate: (recipeId: string) => Promise<void>
  syncFromSupabase: (recipeId: string) => Promise<void>
}

export const useRecipeRatingStore = create<RecipeRatingState>()(
  persist(
    (set, get) => ({
      ratings: {},
      aggregates: {},

      setRating: (recipeId, rating) => {
        set((state) => ({
          ratings: { ...state.ratings, [recipeId]: rating },
        }))
        upsertRating(recipeId, rating)
        get().fetchAggregate(recipeId)
      },

      getRating: (recipeId) => get().ratings[recipeId] ?? 0,

      clearRating: (recipeId) => {
        set((state) => {
          const { [recipeId]: _, ...rest } = state.ratings
          return { ratings: rest }
        })
        deleteRating(recipeId)
        get().fetchAggregate(recipeId)
      },

      getRatedRecipeIds: () =>
        Object.keys(get().ratings).filter((id) => get().ratings[id] > 0),

      getAggregate: (recipeId) => get().aggregates[recipeId] ?? null,

      fetchAggregate: async (recipeId) => {
        const { data } = await supabase
          .from('recipe_ratings')
          .select('rating')
          .eq('recipe_id', recipeId)

        if (data && data.length > 0) {
          const sum = data.reduce((acc, r) => acc + r.rating, 0)
          set((state) => ({
            aggregates: {
              ...state.aggregates,
              [recipeId]: { average: sum / data.length, count: data.length },
            },
          }))
        } else {
          set((state) => ({
            aggregates: {
              ...state.aggregates,
              [recipeId]: { average: 0, count: 0 },
            },
          }))
        }
      },

      syncFromSupabase: async (recipeId) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('recipe_ratings')
          .select('rating')
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id)
          .single()

        if (data) {
          set((state) => ({
            ratings: { ...state.ratings, [recipeId]: data.rating },
          }))
        }
      },
    }),
    { name: 'spicescale-recipe-ratings' },
  ),
)

async function upsertRating(recipeId: string, rating: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('recipe_ratings').upsert(
    { recipe_id: recipeId, user_id: user.id, rating, updated_at: new Date().toISOString() },
    { onConflict: 'recipe_id,user_id' },
  )
}

async function deleteRating(recipeId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('recipe_ratings')
    .delete()
    .eq('recipe_id', recipeId)
    .eq('user_id', user.id)
}
