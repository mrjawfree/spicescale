import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Recipe } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import RecipeForm from '../components/RecipeForm'
import FavoriteButton from '../components/FavoriteButton'

export default function MyRecipes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Recipes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm font-semibold text-[var(--spice-cayenne)]"
        >
          + New Recipe
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
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
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-none"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                <FavoriteButton id={recipe.id} type="recipe" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {recipe.original_servings} servings &middot; {recipe.ingredients.length} ingredients
              </p>
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
