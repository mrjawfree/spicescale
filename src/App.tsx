import { Routes, Route, Navigate } from 'react-router-dom'
import Collection from './pages/Collection'
import SauceDetail from './pages/SauceDetail'
import Welcome from './pages/Welcome'

function WelcomeGuard({ children }: { children: React.ReactNode }) {
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true'
  if (!hasSeenWelcome) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route
        path="/"
        element={
          <WelcomeGuard>
            <div className="min-h-screen bg-gray-50">
              <header className="bg-[#D4320C] text-white px-4 py-3">
                <h1 className="text-xl font-bold">SpiceScale</h1>
              </header>
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
    </Routes>
  )
}

export default App
