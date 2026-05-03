import { useState, useMemo } from 'react'
import { useCollectionStore, type Sauce } from '../stores/collectionStore'

const HEAT_TIERS: Record<number, { label: string; color: string }> = {
  0: { label: 'No Heat', color: '#9CA3AF' },
  1: { label: 'Mild', color: '#22C55E' },
  2: { label: 'Mild', color: '#22C55E' },
  3: { label: 'Medium', color: '#EAB308' },
  4: { label: 'Medium', color: '#EAB308' },
  5: { label: 'Hot', color: '#F97316' },
  6: { label: 'Hot', color: '#F97316' },
  7: { label: 'Very Hot', color: '#EF4444' },
  8: { label: 'Very Hot', color: '#EF4444' },
  9: { label: 'Extreme', color: '#DC2626' },
  10: { label: 'Extreme', color: '#B91C1C' },
}

interface SauceDetailProps {
  sauceId: string
  onBack: () => void
}

export default function SauceDetail({ sauceId, onBack }: SauceDetailProps) {
  const sauce = useCollectionStore((s) => s.sauces.find((x) => x.id === sauceId))
  const updateSauce = useCollectionStore((s) => s.updateSauce)
  const removeSauce = useCollectionStore((s) => s.removeSauce)

  const [editing, setEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showToast, setShowToast] = useState<string | null>(null)

  const [draft, setDraft] = useState<Omit<Sauce, 'id'>>({
    name: '',
    brand: '',
    heat: 0,
    rating: 0,
    heatNotes: '',
    flavorNotes: '',
  })

  const dirty = useMemo(() => {
    if (!sauce) return false
    return (
      draft.name !== sauce.name ||
      draft.brand !== sauce.brand ||
      draft.heat !== sauce.heat ||
      draft.rating !== sauce.rating ||
      draft.heatNotes !== sauce.heatNotes ||
      draft.flavorNotes !== sauce.flavorNotes
    )
  }, [draft, sauce])

  if (!sauce) {
    onBack()
    return null
  }

  function enterEdit() {
    setDraft({
      name: sauce!.name,
      brand: sauce!.brand,
      heat: sauce!.heat,
      rating: sauce!.rating,
      heatNotes: sauce!.heatNotes,
      flavorNotes: sauce!.flavorNotes,
    })
    setEditing(true)
  }

  function cancelEdit() {
    if (dirty) {
      if (!confirm('Discard changes?')) return
    }
    setEditing(false)
  }

  function saveEdit() {
    if (!draft.name.trim()) return
    updateSauce(sauceId, {
      name: draft.name.trim(),
      brand: draft.brand.trim(),
      heat: draft.heat,
      rating: draft.rating,
      heatNotes: draft.heatNotes.trim(),
      flavorNotes: draft.flavorNotes.trim(),
    })
    setEditing(false)
    toast('Changes saved')
  }

  function handleDelete() {
    removeSauce(sauceId)
    toast('Sauce deleted')
    setTimeout(onBack, 300)
  }

  function toast(msg: string) {
    setShowToast(msg)
    setTimeout(() => setShowToast(null), 2000)
  }

  const tier = HEAT_TIERS[editing ? draft.heat : sauce.heat] ?? HEAT_TIERS[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        {editing ? (
          <>
            <button onClick={cancelEdit} className="text-sm text-gray-600">
              ✕ Cancel
            </button>
            <span className="text-sm font-semibold text-gray-900">Edit</span>
            <button
              onClick={saveEdit}
              disabled={!dirty || !draft.name.trim()}
              className="text-sm font-bold disabled:text-gray-300"
              style={{ color: dirty && draft.name.trim() ? '#D4320C' : undefined }}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button onClick={onBack} className="text-sm text-[var(--spice-cayenne)]">
              ← Collection
            </button>
            <span className="text-sm font-semibold text-gray-900 truncate max-w-[50%]">
              {sauce.name}
            </span>
            <button
              onClick={enterEdit}
              className="text-sm font-bold text-[var(--spice-cayenne)]"
            >
              Edit
            </button>
          </>
        )}
      </header>

      {/* Photo Hero Placeholder */}
      <div className="flex h-60 w-full items-center justify-center bg-gray-200">
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      <div className="space-y-3 p-4">
        {/* Info Card */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Sauce Name <span className="text-[var(--spice-cayenne)]">*</span>
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
                <input
                  type="text"
                  value={draft.brand}
                  onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
                  maxLength={80}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">{sauce.name}</h2>
              {sauce.brand && (
                <p className="mt-1 text-sm text-gray-500">{sauce.brand}</p>
              )}
            </>
          )}
        </div>

        {/* Heat Section */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Large Heat Badge */}
            <div
              className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: tier.color + '20', border: `2px solid ${tier.color}` }}
            >
              <span
                className="text-[28px] font-extrabold"
                style={{ color: tier.color }}
              >
                {editing ? draft.heat : sauce.heat}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Heat Level</p>
              <p className="text-sm" style={{ color: tier.color }}>
                {tier.label}
              </p>
            </div>
          </div>

          {editing && (
            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={10}
                value={draft.heat}
                onChange={(e) => setDraft({ ...draft, heat: Number(e.target.value) })}
                className="w-full accent-[var(--spice-cayenne)]"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>10</span>
              </div>
            </div>
          )}

          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Heat Notes</p>
            {editing ? (
              <textarea
                value={draft.heatNotes}
                onChange={(e) => setDraft({ ...draft, heatNotes: e.target.value })}
                maxLength={400}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)] resize-none"
                placeholder="What did the heat feel like?"
              />
            ) : (
              <p className="text-sm text-gray-700">
                {sauce.heatNotes || (
                  <span className="text-gray-400">No notes yet</span>
                )}
              </p>
            )}
            {editing && draft.heatNotes.length >= 350 && (
              <p className="text-xs text-gray-400 text-right">
                {draft.heatNotes.length}/400
              </p>
            )}
          </div>
        </div>

        {/* Rating Section */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-2">Rating</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => {
              const currentRating = editing ? draft.rating : sauce.rating
              return (
                <button
                  key={star}
                  type="button"
                  disabled={!editing}
                  onClick={() =>
                    editing &&
                    setDraft({
                      ...draft,
                      rating: star === draft.rating ? 0 : star,
                    })
                  }
                  className="text-[28px] disabled:cursor-default"
                >
                  <span
                    style={{
                      color: star <= currentRating ? '#FFB400' : '#E0E0E0',
                    }}
                  >
                    ★
                  </span>
                </button>
              )
            })}
          </div>
          {editing && draft.rating === 0 && (
            <p className="text-xs text-gray-400 mt-1">Tap to rate</p>
          )}

          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Flavor Notes</p>
            {editing ? (
              <textarea
                value={draft.flavorNotes}
                onChange={(e) =>
                  setDraft({ ...draft, flavorNotes: e.target.value })
                }
                maxLength={400}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)] resize-none"
                placeholder="Describe the flavor profile..."
              />
            ) : (
              <p className="text-sm text-gray-700">
                {sauce.flavorNotes || (
                  <span className="text-gray-400">No notes yet</span>
                )}
              </p>
            )}
            {editing && draft.flavorNotes.length >= 350 && (
              <p className="text-xs text-gray-400 text-right">
                {draft.flavorNotes.length}/400
              </p>
            )}
          </div>
        </div>

        {/* Action Row (Read Mode Only) */}
        {!editing && (
          <div className="flex gap-3">
            <button
              onClick={enterEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--spice-cayenne)] py-3 text-sm font-semibold text-white"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFF0EE] py-3 text-sm font-semibold text-[var(--spice-cayenne)]"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Sheet */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Delete this sauce?
            </h3>
            <p className="text-sm text-gray-500 mb-6">{sauce.name}</p>
            <button
              onClick={handleDelete}
              className="mb-3 w-full rounded-xl bg-[var(--spice-cayenne)] py-3 text-sm font-semibold text-white"
            >
              Delete sauce
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white shadow-lg">
          {showToast}
        </div>
      )}
    </div>
  )
}
