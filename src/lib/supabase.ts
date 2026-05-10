import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Nutrition {
  calories: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
  fiber: number | null
  sodium: number | null
}

export interface Recipe {
  id: string
  user_id: string
  title: string
  source_url: string | null
  image_url: string | null
  spice_level: number | null
  original_servings: number
  ingredients: Ingredient[]
  instructions: string[]
  nutrition: Nutrition | null
  created_at: string
}

export interface Ingredient {
  name: string
  amount: number
  unit: string
}

export interface RecipeShare {
  id: string
  recipe_id: string
  slug: string
  scaled_servings: number
  created_at: string
}
