import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Collection from './pages/Collection'
import SauceDetail from './pages/SauceDetail'
import Welcome from './pages/Welcome'
import Auth from './pages/Auth'
import MyRecipes from './pages/MyRecipes'
import RecipeDetail from './pages/RecipeDetail'
import SharedRecipe from './pages/SharedRecipe'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'

function WelcomeGuard({ children }: { children: React.ReactNode }) {
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true'
  if (!hasSeenWelcome) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    if (!user) { setSavedCount(0); return }
    supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setSavedCount(count ?? 0))
  }, [user, location.pathname])

  const isRecipesActive = location.pathname.startsWith('/recipes')
  const isCollectionActive = location.pathname === '/' || location.pathname.startsWith('/sauce')

  return (
    <header className="bg-[#D4320C] text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>SpiceScale</h1>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {savedCount > 0 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {savedCount} saved
                </span>
              )}
              <button onClick={signOut} className="text-xs opacity-80 hover:opacity-100">
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
      <nav className="flex px-4 gap-4 pb-1">
        <button
          onClick={() => navigate('/')}
          className={`text-sm pb-2 border-b-2 transition-colors ${
            isCollectionActive ? 'border-white font-semibold' : 'border-transparent opacity-70 hover:opacity-100'
          }`}
        >
          Collection
        </button>
        <button
          onClick={() => navigate('/recipes')}
          className={`text-sm pb-2 border-b-2 transition-colors ${
            isRecipesActive ? 'border-white font-semibold' : 'border-transparent opacity-70 hover:opacity-100'
          }`}
        >
          Recipes
        </button>
      </nav>
    </header>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/r/:slug" element={<SharedRecipe />} />
      <Route
        path="/"
        element={
          <WelcomeGuard>
            <div className="min-h-screen bg-gray-50">
              <AppHeader />
              <main className="p-4">
                <Collection />
              </main>
            </div>
          </WelcomeGuard>
        }
      />
      <Route
        path="/sauce/:id"
        element={
          <WelcomeGuard>
            <SauceDetail />
          </WelcomeGuard>
        }
      />
      <Route
        path="/recipes"
        element={
          <WelcomeGuard>
            <div className="min-h-screen bg-gray-50">
              <AppHeader />
              <main className="p-4">
                <MyRecipes />
              </main>
            </div>
          </WelcomeGuard>
        }
      />
      <Route
        path="/recipes/:id"
        element={
          <WelcomeGuard>
            <RecipeDetail />
          </WelcomeGuard>
        }
      />
    </Routes>
  )
}

export default App
