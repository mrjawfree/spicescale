import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Recipe } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import RecipeForm from '../components/RecipeForm'
import FavoriteButton from '../components/FavoriteButton'
import BookmarkButton from '../components/BookmarkButton'
import StarRating from '../components/StarRating'
import { useRecipeRatingStore } from '../stores/recipeRatingStore'

export default function MyRecipes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [sortByRating, setSortByRating] = useState(false)
  const [showRatedOnly, setShowRatedOnly] = useState(false)
  const ratings = useRecipeRatingStore((s) => s.ratings)
  const getRating = useRecipeRatingStore((s) => s.getRating)

  const displayedRecipes = useMemo(() => {
    let list = [...recipes]
    if (showRatedOnly) {
      list = list.filter((r) => (ratings[r.id] ?? 0) > 0)
    }
    if (sortByRating) {
      list.sort((a, b) => (ratings[b.id] ?? 0) - (ratings[a.id] ?? 0))
    }
    return list
  }, [recipes, ratings, sortByRating, showRatedOnly])

  useEffect(() => {
    if (!user) return
    loadRecipes()
  }, [user])

  async function loadRecipes() {
    setLoading(true)
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setRecipes(data ?? [])
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Save your recipes</h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          Create a free account to save scaled recipes and access them anywhere.
        </p>
        <button
          onClick={() => navigate('/auth', { state: { returnTo: '/recipes' } })}
          className="bg-[var(--spice-cayenne)] text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Sign up free
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">My Recipes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm font-semibold text-[var(--spice-cayenne)]"
        >
          + New Recipe
        </button>
      </div>
      {recipes.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowRatedOnly(!showRatedOnly)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              showRatedOnly
                ? 'bg-[var(--spice-cayenne)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            My Ratings
          </button>
          <button
            onClick={() => setSortByRating(!sortByRating)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              sortByRating
                ? 'bg-[var(--spice-cayenne)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Highest Rated
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
      ) : showRatedOnly && displayedRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[#FFFBF5] rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-2">No rated recipes</h3>
          <p className="text-gray-500 mb-6 max-w-xs">
            Rate your recipes from their detail page to see them here.
          </p>
          <button
            onClick={() => setShowRatedOnly(false)}
            className="bg-[var(--spice-cayenne)] text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Show all recipes
          </button>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[#FFFBF5] rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-2">No recipes yet</h3>
          <p className="text-gray-500 mb-6 max-w-xs">
            Add your first recipe with ingredients and scale it to any serving size.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[var(--spice-cayenne)] text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Add your first recipe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-none"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                <div className="flex items-center gap-1">
                  <BookmarkButton recipeId={recipe.id} />
                  <FavoriteButton id={recipe.id} type="recipe" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {recipe.original_servings} servings &middot; {recipe.ingredients.length} ingredients
                {recipe.spice_level ? ` · ${'\u{1F336}'.repeat(Math.min(recipe.spice_level, 5))}` : ''}
              </p>
              {getRating(recipe.id) > 0 && (
                <div className="mt-2">
                  <StarRating rating={getRating(recipe.id)} size="sm" />
                </div>
              )}
              {recipe.source_url && (
                <p className="text-xs text-gray-400 mt-2 truncate">{recipe.source_url}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <RecipeForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); loadRecipes() }}
        />
      )}
    </div>
  )
}
