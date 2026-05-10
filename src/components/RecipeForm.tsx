import { useState } from 'react'
import { supabase, type Ingredient } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface RecipeFormProps {
  onClose: () => void
  onSaved: () => void
}

const SPICE_LABELS = ['Mild', 'Medium', 'Hot', 'Very Hot', 'Extreme']

export default function RecipeForm({ onClose, onSaved }: RecipeFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [servings, setServings] = useState(4)
  const [spiceLevel, setSpiceLevel] = useState<number>(3)
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: 0, unit: '' },
  ])
  const [steps, setSteps] = useState<string[]>([''])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addIngredient() {
    setIngredients([...ingredients, { name: '', amount: 0, unit: '' }])
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string | number) {
    setIngredients(ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    ))
  }

  function removeIngredient(index: number) {
    if (ingredients.length <= 1) return
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  function addStep() {
    setSteps([...steps, ''])
  }

  function updateStep(index: number, value: string) {
    setSteps(steps.map((s, i) => (i === index ? value : s)))
  }

  function removeStep(index: number) {
    if (steps.length <= 1) return
    setSteps(steps.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !title.trim()) return

    const validIngredients = ingredients.filter((ing) => ing.name.trim())
    if (validIngredients.length === 0) {
      setError('Add at least one ingredient.')
      return
    }

    const validSteps = steps.filter((s) => s.trim())

    setSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('recipes').insert({
      user_id: user.id,
      title: title.trim(),
      source_url: sourceUrl.trim() || null,
      original_servings: servings,
      ingredients: validIngredients,
      instructions: validSteps.length > 0 ? validSteps : null,
      spice_level: spiceLevel,
    })

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      onSaved()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">New Recipe</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Title <span className="text-[var(--spice-cayenne)]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
              placeholder="e.g. Carolina Reaper Hot Sauce"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servings: {servings}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value) || 1)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spice Level: {spiceLevel} — {SPICE_LABELS[spiceLevel - 1]}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpiceLevel(level)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    spiceLevel >= level
                      ? 'bg-[var(--spice-cayenne)] text-white'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Ingredients</label>
              <button
                type="button"
                onClick={addIngredient}
                className="text-xs font-semibold text-[var(--spice-cayenne)]"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={ing.amount || ''}
                    onChange={(e) => updateIngredient(i, 'amount', Number(e.target.value))}
                    placeholder="Qty"
                    className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                  />
                  <input
                    type="text"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                    placeholder="Unit"
                    maxLength={20}
                    className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                  />
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                    placeholder="Ingredient name"
                    maxLength={100}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="text-gray-400 hover:text-red-500 text-lg leading-none pt-1"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Steps</label>
              <button
                type="button"
                onClick={addStep}
                className="text-xs font-semibold text-[var(--spice-cayenne)]"
              >
                + Add Step
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-xs font-semibold text-gray-400 mt-2.5 min-w-[1.5rem] text-right">
                    {i + 1}.
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}`}
                    maxLength={500}
                    rows={2}
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)] resize-none"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="text-gray-400 hover:text-red-500 text-lg leading-none pt-1"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-[var(--spice-cayenne)] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save Recipe'}
        </button>
      </form>
    </div>
  )
}
