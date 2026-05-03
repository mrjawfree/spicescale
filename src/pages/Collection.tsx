import { useState } from 'react'
import { useCollectionStore } from '../stores/collectionStore'
import SauceCard from '../components/SauceCard'
import AddSauceForm from '../components/AddSauceForm'

interface CollectionProps {
  onSelectSauce: (id: string) => void
}

export default function Collection({ onSelectSauce }: CollectionProps) {
  const sauces = useCollectionStore((state) => state.sauces)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">My Collection</h2>
      {sauces.length === 0 ? (
        <p className="text-gray-500">No sauces in your collection yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sauces.map((sauce) => (
            <SauceCard
              key={sauce.id}
              sauce={sauce}
              onClick={() => onSelectSauce(sauce.id)}
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
