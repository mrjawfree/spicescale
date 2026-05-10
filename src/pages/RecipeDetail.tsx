import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Recipe } from '../lib/supabase'
import StarRating from '../components/StarRating'
import { useRecipeRatingStore } from '../stores/recipeRatingStore'

function generateSlug() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)]
  return slug
}

function SpiceLevelIndicator({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="w-5 h-5 rounded-full border-2 transition-colors"
            style={{
              backgroundColor: n <= level ? '#D4320C' : 'transparent',
              borderColor: n <= level ? '#D4320C' : '#D6D1CC',
            }}
          />
        ))}
      </div>
      <span className="text-sm font-medium" style={{ color: '#D4320C' }}>
        {level === 1 && 'Mild'}
        {level === 2 && 'Medium'}
        {level === 3 && 'Hot'}
        {level === 4 && 'Very Hot'}
        {level === 5 && 'Extreme'}
      </span>
    </div>
  )
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [scaledServings, setScaledServings] = useState(0)
  const [sharing, setSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showToast, setShowToast] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const rating = useRecipeRatingStore((s) => s.getRating(id!))
  const setRating = useRecipeRatingStore((s) => s.setRating)
  const aggregate = useRecipeRatingStore((s) => s.getAggregate(id!))
  const fetchAggregate = useRecipeRatingStore((s) => s.fetchAggregate)
  const syncFromSupabase = useRecipeRatingStore((s) => s.syncFromSupabase)

  useEffect(() => {
    loadRecipe()
    if (id) {
      fetchAggregate(id)
      syncFromSupabase(id)
    }
  }, [id])

  async function loadRecipe() {
    setLoading(true)
    const { data } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id!)
      .single()
    if (data) {
      setRecipe(data)
      setScaledServings(data.original_servings)
    }
    setLoading(false)
  }

  function scaleAmount(amount: number) {
    if (!recipe || recipe.original_servings === 0) return amount
    const scaled = (amount / recipe.original_servings) * scaledServings
    return Math.round(scaled * 100) / 100
  }

  function buildShareText() {
    if (!recipe) return ''
    const scale = scaledServings !== recipe.original_servings
      ? ` (scaled to ${scaledServings} servings)`
      : ''
    const ingredients = recipe.ingredients
      .map((ing) => `${scaleAmount(ing.amount)} ${ing.unit} ${ing.name}`)
      .join('\n')
    return `${recipe.title}${scale}\n\nIngredients:\n${ingredients}`
  }

  async function getOrCreateShareUrl(): Promise<string | null> {
    if (!recipe) return null

    const { data: existing } = await supabase
      .from('recipe_shares')
      .select('slug')
      .eq('recipe_id', recipe.id)
      .eq('scaled_servings', scaledServings)
      .single()

    if (existing) {
      return `${window.location.origin}${window.location.pathname}#/r/${existing.slug}`
    }

    const slug = generateSlug()
    const { error } = await supabase.from('recipe_shares').insert({
      recipe_id: recipe.id,
      slug,
      scaled_servings: scaledServings,
    })

    if (error) return null
    return `${window.location.origin}${window.location.pathname}#/r/${slug}`
  }

  async function handleShare() {
    if (!recipe) return
    setSharing(true)

    const url = await getOrCreateShareUrl()
    if (url) setShareUrl(url)

    const text = buildShareText()

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text,
          url: url ?? undefined,
        })
        toast('Shared!')
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await fallbackCopy(url, text)
        }
      }
    } else {
      await fallbackCopy(url, text)
    }

    setSharing(false)
  }

  async function fallbackCopy(url: string | null, text: string) {
    const content = url ? `${text}\n\n${url}` : text
    try {
      await navigator.clipboard.writeText(content)
      toast('Recipe copied to clipboard!')
    } catch {
      toast('Could not copy to clipboard')
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    toast('Link copied!')
  }

  async function handleDelete() {
    if (!recipe) return
    setDeleting(true)
    await supabase.from('recipe_shares').delete().eq('recipe_id', recipe.id)
    await supabase.from('recipes').delete().eq('id', recipe.id)
    toast('Recipe deleted')
    setTimeout(() => navigate('/recipes', { replace: true }), 300)
  }

  function toast(msg: string) {
    setShowToast(msg)
    setTimeout(() => setShowToast(null), 2000)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Recipe not found</h2>
        <button onClick={() => navigate('/recipes')} className="text-sm text-[var(--spice-cayenne)]">
          Back to My Recipes
        </button>
      </div>
    )
  }

  const nutrition = recipe.nutrition

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button onClick={() => navigate('/recipes')} className="text-sm text-[var(--spice-cayenne)]">
          ← Recipes
        </button>
        <span className="text-sm font-semibold text-gray-900 truncate max-w-[60%]">
          {recipe.title}
        </span>
        <div className="w-16" />
      </header>

      {/* Hero Image */}
      {recipe.image_url ? (
        <div className="relative w-full h-56 sm:h-72 bg-gray-200 overflow-hidden">
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          {recipe.spice_level && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
              <SpiceLevelIndicator level={recipe.spice_level} />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-40 sm:h-56 bg-gradient-to-br from-[#D4320C]/10 via-[#D4320C]/5 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl">🌶️</span>
            {recipe.spice_level && (
              <div className="mt-3">
                <SpiceLevelIndicator level={recipe.spice_level} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 p-4">
        {/* Title & Spice Level */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--spice-cayenne)] mt-1 block truncate"
            >
              {recipe.source_url}
            </a>
          )}
          {recipe.spice_level && !recipe.image_url && (
            <div className="mt-3">
              <SpiceLevelIndicator level={recipe.spice_level} />
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Your Rating</p>
            {rating > 0 && (
              <button
                onClick={() => setRating(id!, 0)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-2">
            <StarRating
              rating={rating}
              onRate={(r) => setRating(id!, r)}
              size="lg"
            />
          </div>
          {aggregate && aggregate.count > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              <StarRating rating={Math.round(aggregate.average)} size="sm" />
              <span className="text-sm text-gray-500">
                {aggregate.average.toFixed(1)} avg ({aggregate.count} {aggregate.count === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
          )}
        </div>

        {/* Scale Servings */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Scale Servings</p>
            <p className="text-xs text-gray-400">Original: {recipe.original_servings}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setScaledServings(Math.max(1, scaledServings - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 text-lg font-bold text-gray-600 flex items-center justify-center"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={100}
              value={scaledServings}
              onChange={(e) => setScaledServings(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 text-center text-2xl font-bold text-gray-900 border-b-2 border-[var(--spice-cayenne)] bg-transparent focus:outline-none"
            />
            <button
              onClick={() => setScaledServings(Math.min(100, scaledServings + 1))}
              className="w-10 h-10 rounded-full bg-gray-100 text-lg font-bold text-gray-600 flex items-center justify-center"
            >
              +
            </button>
          </div>
          {scaledServings !== recipe.original_servings && (
            <button
              onClick={() => setScaledServings(recipe.original_servings)}
              className="mt-2 text-xs text-[var(--spice-cayenne)]"
            >
              Reset to original
            </button>
          )}
        </div>

        {/* Ingredients with spice-level accent */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-semibold text-gray-900">
              Ingredients ({recipe.ingredients.length})
            </p>
            {recipe.spice_level && recipe.spice_level >= 3 && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#D4320C15', color: '#D4320C' }}
              >
                🔥 Spicy
              </span>
            )}
          </div>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-baseline gap-2 text-sm">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ backgroundColor: recipe.spice_level ? '#D4320C' : '#D6D1CC' }}
                />
                <span className="font-semibold text-gray-900 min-w-[3rem] text-right">
                  {scaleAmount(ing.amount)}
                </span>
                <span className="text-gray-500">{ing.unit}</span>
                <span className="text-gray-700">{ing.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step-by-Step Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-3">Instructions</p>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: '#D4320C' }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Nutrition Facts */}
        {nutrition && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-3">Nutrition Facts</p>
            <p className="text-xs text-gray-400 mb-3">Per serving</p>
            <div className="grid grid-cols-3 gap-3">
              {nutrition.calories != null && (
                <div className="text-center rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{nutrition.calories}</p>
                  <p className="text-xs text-gray-500">Calories</p>
                </div>
              )}
              {nutrition.protein != null && (
                <div className="text-center rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{nutrition.protein}g</p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
              )}
              {nutrition.fat != null && (
                <div className="text-center rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{nutrition.fat}g</p>
                  <p className="text-xs text-gray-500">Fat</p>
                </div>
              )}
              {nutrition.carbs != null && (
                <div className="text-center rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{nutrition.carbs}g</p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
              )}
              {nutrition.fiber != null && (
                <div className="text-center rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{nutrition.fiber}g</p>
                  <p className="text-xs text-gray-500">Fiber</p>
                </div>
              )}
              {nutrition.sodium != null && (
                <div className="text-center rounded-lg bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{nutrition.sodium}mg</p>
                  <p className="text-xs text-gray-500">Sodium</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--spice-cayenne)] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sharing ? 'Sharing...' : 'Share Recipe'}
          </button>
          <button
            onClick={() => setDeleting(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#FFF0EE] px-4 py-3 text-sm font-semibold text-[var(--spice-cayenne)]"
          >
            Delete
          </button>
        </div>

        {shareUrl && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-semibold text-green-800 mb-2">Share link ready!</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 text-xs bg-white border border-green-300 rounded-lg px-3 py-2 text-gray-700"
              />
              <button
                onClick={copyShareUrl}
                className="text-xs font-semibold text-white bg-green-600 px-3 py-2 rounded-lg hover:opacity-90"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete this recipe?</h3>
            <p className="text-sm text-gray-500 mb-6">{recipe.title}</p>
            <button
              onClick={handleDelete}
              className="mb-3 w-full rounded-xl bg-[var(--spice-cayenne)] py-3 text-sm font-semibold text-white"
            >
              Delete recipe
            </button>
            <button
              onClick={() => setDeleting(false)}
              className="w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white shadow-lg">
          {showToast}
        </div>
      )}
    </div>
  )
}
