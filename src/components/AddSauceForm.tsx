import { useState } from 'react'
import { useCollectionStore } from '../stores/collectionStore'

interface AddSauceFormProps {
  onClose: () => void
}

export default function AddSauceForm({ onClose }: AddSauceFormProps) {
  const addSauce = useCollectionStore((state) => state.addSauce)
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [heat, setHeat] = useState(5)
  const [rating, setRating] = useState(0)
  const [heatNotes, setHeatNotes] = useState('')
  const [flavorNotes, setFlavorNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addSauce({
      id: crypto.randomUUID(),
      name: name.trim(),
      brand: brand.trim(),
      heat,
      rating,
      heatNotes: heatNotes.trim(),
      flavorNotes: flavorNotes.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Add Sauce</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sauce Name <span className="text-[var(--spice-cayenne)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
              placeholder="e.g. Da Bomb Beyond Insanity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
              placeholder="e.g. Da Bomb"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heat Level: {heat}/10
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setHeat(level)}
                  className={`flex-1 rounded py-2 text-xs font-medium transition-colors ${
                    level <= heat
                      ? 'bg-[var(--spice-cayenne)] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating: {rating}/5
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="text-2xl transition-colors"
                >
                  {star <= rating ? (
                    <span className="text-amber-400">&#9733;</span>
                  ) : (
                    <span className="text-gray-300">&#9733;</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heat Notes</label>
            <textarea
              value={heatNotes}
              onChange={(e) => setHeatNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)] resize-none"
              placeholder="Describe the heat profile..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flavor Notes</label>
            <textarea
              value={flavorNotes}
              onChange={(e) => setFlavorNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)] resize-none"
              placeholder="Describe the flavor profile..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-[var(--spice-cayenne)] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Add to Collection
        </button>
      </form>
    </div>
  )
}
