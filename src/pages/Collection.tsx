import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollectionStore } from '../stores/collectionStore'
import SauceCard from '../components/SauceCard'
import AddSauceForm from '../components/AddSauceForm'

export default function Collection() {
  const sauces = useCollectionStore((state) => state.sauces)
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">My Collection</h2>

      {sauces.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[#FFFBF5] rounded-2xl">
          <div className="w-[120px] h-[120px] rounded-full bg-[#FFEDE6] flex items-center justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="20" y="8" width="8" height="32" rx="4" fill="#D4320C" />
              <rect x="18" y="6" width="12" height="4" rx="2" fill="#FF7043" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your collection is empty</h3>
          <p className="text-gray-500 mb-6 max-w-xs">
            Start logging your sauces — tap + to add your first one
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#D4320C] text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Log your first sauce
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sauces.map((sauce) => (
            <SauceCard
              key={sauce.id}
              sauce={sauce}
              onClick={() => navigate(`/sauce/${sauce.id}`)}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--spice-cayenne)] text-white text-3xl shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Add sauce"
      >
        +
      </button>

      {showForm && <AddSauceForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
