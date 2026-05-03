import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Recipe, type RecipeShare } from '../lib/supabase'

export default function SharedRecipe() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [share, setShare] = useState<RecipeShare | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadSharedRecipe()
  }, [slug])

  async function loadSharedRecipe() {
    setLoading(true)
    const { data: shareData } = await supabase
      .from('recipe_shares')
      .select('*')
      .eq('slug', slug!)
      .single()

    if (!shareData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setShare(shareData)

    const { data: recipeData } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', shareData.recipe_id)
      .single()

    if (!recipeData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setRecipe(recipeData)
    setLoading(false)
  }

  function scaleAmount(amount: number) {
    if (!recipe || !share || recipe.original_servings === 0) return amount
    const scaled = (amount / recipe.original_servings) * share.scaled_servings
    return Math.round(scaled * 100) / 100
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>
  }

  if (notFound || !recipe || !share) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Recipe not found</h2>
        <p className="text-gray-500 mb-6">This share link may have expired or been removed.</p>
        <button onClick={() => navigate('/')} className="text-sm text-[var(--spice-cayenne)]">
          Go to SpiceScale
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-[#D4320C] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20" />
            <span className="text-sm font-bold">SpiceScale</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full"
          >
            Try SpiceScale
          </button>
        </div>
      </header>

      <div className="space-y-3 p-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-[var(--spice-cayenne)] font-semibold mb-1">Shared Recipe</p>
          <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Scaled to {share.scaled_servings} servings
            {share.scaled_servings !== recipe.original_servings && (
              <span className="text-gray-400"> (originally {recipe.original_servings})</span>
            )}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Ingredients ({recipe.ingredients.length})
          </p>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-baseline gap-2 text-sm">
                <span className="font-semibold text-gray-900 min-w-[3rem] text-right">
                  {scaleAmount(ing.amount)}
                </span>
                <span className="text-gray-500">{ing.unit}</span>
                <span className="text-gray-700">{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {recipe.source_url && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Source</p>
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--spice-cayenne)] truncate block"
            >
              {recipe.source_url}
            </a>
          </div>
        )}

        <div className="rounded-xl bg-[#FFFBF5] border border-[#FFE4D6] p-4 text-center">
          <p className="text-sm font-semibold text-gray-900 mb-1">Want to save & scale your own recipes?</p>
          <p className="text-xs text-gray-500 mb-3">Create a free SpiceScale account.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-[var(--spice-cayenne)] text-white font-semibold px-6 py-2 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Sign up free
          </button>
        </div>
      </div>
    </div>
  )
}
