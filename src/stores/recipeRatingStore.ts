import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

interface AggregateRating {
  average: number
  count: number
}

export interface Review {
  id: string
  user_id: string
  rating: number
  review_text: string | null
  created_at: string
  updated_at: string
  is_own: boolean
}

interface RecipeRatingState {
  ratings: Record<string, number>
  reviewTexts: Record<string, string>
  aggregates: Record<string, AggregateRating>
  reviews: Record<string, Review[]>
  setRating: (recipeId: string, rating: number, reviewText?: string) => void
  getRating: (recipeId: string) => number
  getReviewText: (recipeId: string) => string
  clearRating: (recipeId: string) => void
  getRatedRecipeIds: () => string[]
  getAggregate: (recipeId: string) => AggregateRating | null
  getReviews: (recipeId: string) => Review[]
  fetchAggregate: (recipeId: string) => Promise<void>
  fetchReviews: (recipeId: string) => Promise<void>
  syncFromSupabase: (recipeId: string) => Promise<void>
}

export const useRecipeRatingStore = create<RecipeRatingState>()(
  persist(
    (set, get) => ({
      ratings: {},
      reviewTexts: {},
      aggregates: {},
      reviews: {},

      setRating: (recipeId, rating, reviewText) => {
        set((state) => ({
          ratings: { ...state.ratings, [recipeId]: rating },
          reviewTexts: reviewText !== undefined
            ? { ...state.reviewTexts, [recipeId]: reviewText }
            : state.reviewTexts,
        }))
        upsertRating(recipeId, rating, reviewText ?? get().reviewTexts[recipeId] ?? '')
        get().fetchAggregate(recipeId)
        get().fetchReviews(recipeId)
      },

      getRating: (recipeId) => get().ratings[recipeId] ?? 0,

      getReviewText: (recipeId) => get().reviewTexts[recipeId] ?? '',

      clearRating: (recipeId) => {
        set((state) => {
          const { [recipeId]: _r, ...restRatings } = state.ratings
          const { [recipeId]: _t, ...restTexts } = state.reviewTexts
          return { ratings: restRatings, reviewTexts: restTexts }
        })
        deleteRating(recipeId)
        get().fetchAggregate(recipeId)
        get().fetchReviews(recipeId)
      },

      getRatedRecipeIds: () =>
        Object.keys(get().ratings).filter((id) => get().ratings[id] > 0),

      getAggregate: (recipeId) => get().aggregates[recipeId] ?? null,

      getReviews: (recipeId) => get().reviews[recipeId] ?? [],

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

      fetchReviews: async (recipeId) => {
        const { data: { user } } = await supabase.auth.getUser()
        const currentUserId = user?.id

        const { data } = await supabase
          .from('recipe_ratings')
          .select('id, user_id, rating, review_text, created_at, updated_at')
          .eq('recipe_id', recipeId)
          .order('created_at', { ascending: false })

        if (data) {
          const reviews: Review[] = data.map((r) => ({
            ...r,
            is_own: r.user_id === currentUserId,
          }))
          set((state) => ({
            reviews: { ...state.reviews, [recipeId]: reviews },
          }))
        }
      },

      syncFromSupabase: async (recipeId) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('recipe_ratings')
          .select('rating, review_text')
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id)
          .single()

        if (data) {
          set((state) => ({
            ratings: { ...state.ratings, [recipeId]: data.rating },
            reviewTexts: { ...state.reviewTexts, [recipeId]: data.review_text ?? '' },
          }))
        }
      },
    }),
    { name: 'spicescale-recipe-ratings' },
  ),
)

async function upsertRating(recipeId: string, rating: number, reviewText: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('recipe_ratings').upsert(
    {
      recipe_id: recipeId,
      user_id: user.id,
      rating,
      review_text: reviewText || null,
      updated_at: new Date().toISOString(),
    },
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
