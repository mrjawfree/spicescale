import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import type { Recipe } from '../lib/supabase'

const SPICE_LABELS = ['Mild', 'Medium', 'Hot', 'Very Hot', 'Extreme']

interface UserProfile {
  display_name: string | null
  spice_level: number
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({ display_name: null, spice_level: 3 })
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      supabase.from('recipes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]).then(([profileRes, recipesRes]) => {
      if (profileRes.data) {
        setProfile(profileRes.data)
        setNameInput(profileRes.data.display_name ?? '')
      }
      if (recipesRes.data) setRecipes(recipesRes.data)
      setLoading(false)
    })
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">Sign in to view your profile.</p>
        <button
          onClick={() => navigate('/auth', { state: { returnTo: '/profile' } })}
          className="rounded-lg bg-[var(--spice-cayenne)] px-6 py-2 text-white font-semibold"
        >
          Sign in
        </button>
      </div>
    )
  }

  async function updateSpiceLevel(level: number) {
    setSaving(true)
    await supabase.from('user_profiles').upsert({ id: user!.id, spice_level: level, updated_at: new Date().toISOString() })
    setProfile((p) => ({ ...p, spice_level: level }))
    setSaving(false)
  }

  async function saveName() {
    setSaving(true)
    await supabase.from('user_profiles').upsert({ id: user!.id, display_name: nameInput.trim() || null, updated_at: new Date().toISOString() })
    setProfile((p) => ({ ...p, display_name: nameInput.trim() || null }))
    setEditingName(false)
    setSaving(false)
  }

  const displayName = profile.display_name || user.email?.split('@')[0] || 'Chef'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#D4320C] text-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-lg">&larr;</button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-24 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-48 rounded-xl" />
          </div>
        ) : (
          <>
            <section className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-14 h-14 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[var(--color-cayenne-50)] flex items-center justify-center text-[var(--spice-cayenne)] text-xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="flex-1 min-w-0 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveName()}
                      />
                      <button onClick={saveName} disabled={saving} className="text-sm text-[var(--spice-cayenne)] font-semibold">
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900 truncate">{displayName}</h2>
                      <button onClick={() => { setNameInput(profile.display_name ?? ''); setEditingName(true) }} className="text-xs text-gray-400 hover:text-gray-600">
                        Edit
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Spice Level Preference</h3>
              <div className="flex gap-2">
                {SPICE_LABELS.map((label, i) => {
                  const level = i + 1
                  const active = profile.spice_level === level
                  return (
                    <button
                      key={level}
                      onClick={() => updateSpiceLevel(level)}
                      disabled={saving}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[var(--spice-cayenne)] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Recipes will be sorted by your preferred spice level.
              </p>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Saved Recipes</h3>
                <span className="text-xs text-gray-400">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</span>
              </div>
              {recipes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm mb-3">No saved recipes yet.</p>
                  <button
                    onClick={() => navigate('/recipes')}
                    className="text-sm text-[var(--spice-cayenne)] font-semibold"
                  >
                    Browse recipes
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recipes.map((recipe) => (
                    <li key={recipe.id}>
                      <button
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                        className="w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50 transition-colors rounded-lg px-1"
                      >
                        {recipe.image_url ? (
                          <img src={recipe.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-cayenne-50)] flex items-center justify-center text-lg">
                            🌶️
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{recipe.title}</p>
                          {recipe.spice_level && (
                            <p className="text-xs text-gray-400">
                              {'🔥'.repeat(recipe.spice_level)} {SPICE_LABELS[recipe.spice_level - 1]}
                            </p>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <button
              onClick={async () => { await signOut(); navigate('/', { replace: true }) }}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </>
        )}
      </main>
    </div>
  )
}
