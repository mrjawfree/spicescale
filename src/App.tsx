import { useState } from 'react'
import Collection from './pages/Collection'
import SauceDetail from './pages/SauceDetail'
import Welcome from './pages/Welcome'

function App() {
  const [selectedSauceId, setSelectedSauceId] = useState<string | null>(null)
  const [hasSeenWelcome, setHasSeenWelcome] = useState(
    () => localStorage.getItem('hasSeenWelcome') === 'true'
  )

  if (!hasSeenWelcome) {
    return <Welcome onComplete={() => setHasSeenWelcome(true)} />
  }

  if (selectedSauceId) {
    return (
      <SauceDetail
        sauceId={selectedSauceId}
        onBack={() => setSelectedSauceId(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#D4320C] text-white px-4 py-3">
        <h1 className="text-xl font-bold">SpiceScale</h1>
      </header>
      <main className="p-4">
        <Collection onSelectSauce={setSelectedSauceId} />
      </main>
    </div>
  )
}

export default App
