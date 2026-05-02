import { useCollectionStore } from '../stores/collectionStore'
import SauceCard from '../components/SauceCard'

export default function Collection() {
  const sauces = useCollectionStore((state) => state.sauces)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">My Collection</h2>
      {sauces.length === 0 ? (
        <p className="text-gray-500">No sauces in your collection yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sauces.map((sauce) => (
            <SauceCard key={sauce.id} sauce={sauce} />
          ))}
        </div>
      )}
    </div>
  )
}
