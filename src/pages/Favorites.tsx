import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useCollectionStore } from '../stores/collectionStore'
import { useAuth } from '../contexts/AuthContext'
import { supabase, type Recipe } from '../lib/supabase'
import SauceCard from '../components/SauceCard'
import FavoriteButton from '../components/FavoriteButton'

type FilterTab = 'all' | 'sauce' | 'recipe'

export default function Favorites() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const favorites = useFavoritesStore((s) => s.favorites)
  const sauces = useCollectionStore((s) => s.sauces)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filter, setFilter] = useState<FilterTab>('all')

  const favSauceIds = favorites.filter((f) => f.type === 'sauce').map((f) => f.id)
  const favRecipeIds = favorites.filter((f) => f.type === 'recipe').map((f) => f.id)
  const favSauces = sauces.filter((s) => favSauceIds.includes(s.id))

  useEffect(() => {
    if (!user || favRecipeIds.length === 0) {
      setRecipes([])
      return
    }
    supabase
      .from('recipes')
      .select('*')
      .in('id', favRecipeIds)
      .then(({ data }) => setRecipes(data ?? []))
  }, [user, favorites])

  const showSauces = filter === 'all' || filter === 'sauce'
  const showRecipes = filter === 'all' || filter === 'recipe'
  const isEmpty = favSauces.length === 0 && recipes.length === 0 && favRecipeIds.length === 0

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: favorites.length },
    { key: 'sauce', label: 'Sauces', count: favSauceIds.length },
    { key: 'recipe', label: 'Recipes', count: favRecipeIds.length },
  ]

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[#FFFBF5] rounded-2xl">
        <div className="w-[120px] h-[120px] rounded-full bg-[#FFEDE6] flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-12 h-12" fill="#D4320C" stroke="#D4320C" strokeWidth={0.5}>
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          Tap the heart on any sauce or recipe to save it here for quick access.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Favorites</h2>

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
              filter === tab.key
                ? 'bg-[#D4320C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-xs ${filter === tab.key ? 'opacity-80' : 'text-gray-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {showSauces && favSauces.length > 0 && (
        <div className="mb-6">
          {filter === 'all' && <h3 className="text-sm font-medium text-gray-500 mb-2">Sauces</h3>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favSauces.map((sauce) => (
              <SauceCard
                key={sauce.id}
                sauce={sauce}
                onClick={() => navigate(`/sauce/${sauce.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {showRecipes && recipes.length > 0 && (
        <div>
          {filter === 'all' && <h3 className="text-sm font-medium text-gray-500 mb-2">Recipes</h3>}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
