import { create } from 'zustand'
import { supabase, type Recipe } from '../lib/supabase'

interface SavedRecipesState {
  savedIds: Set<string>
  loading: boolean
  fetchSaved: (userId: string) => Promise<void>
  toggleSave: (userId: string, recipeId: string) => Promise<void>
  isSaved: (recipeId: string) => boolean
  loadSavedRecipes: (userId: string) => Promise<Recipe[]>
}

export const useSavedRecipesStore = create<SavedRecipesState>((set, get) => ({
  savedIds: new Set(),
  loading: false,

  fetchSaved: async (userId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from('saved_recipes')
      .select('recipe_id')
      .eq('user_id', userId)
    set({
      savedIds: new Set((data ?? []).map((r) => r.recipe_id)),
      loading: false,
    })
  },

  toggleSave: async (userId: string, recipeId: string) => {
    const { savedIds } = get()
    if (savedIds.has(recipeId)) {
      await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
      const next = new Set(savedIds)
      next.delete(recipeId)
      set({ savedIds: next })
    } else {
      await supabase
        .from('saved_recipes')
        .insert({ user_id: userId, recipe_id: recipeId })
      const next = new Set(savedIds)
      next.add(recipeId)
      set({ savedIds: next })
    }
  },

  isSaved: (recipeId: string) => get().savedIds.has(recipeId),

  loadSavedRecipes: async (userId: string) => {
    const { data } = await supabase
      .from('saved_recipes')
      .select('recipe_id, recipes(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return (data ?? []).map((r) => r.recipes).filter(Boolean) as unknown as Recipe[]
  },
}))
