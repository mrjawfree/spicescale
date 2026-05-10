import { useState } from 'react'
import { supabase, type Ingredient } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface RecipeFormProps {
  onClose: () => void
  onSaved: () => void
}

export default function RecipeForm({ onClose, onSaved }: RecipeFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [servings, setServings] = useState(4)
  const [spiceLevel, setSpiceLevel] = useState<number>(0)
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: 0, unit: '' },
  ])
  const [instructions, setInstructions] = useState<string[]>([''])
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [fat, setFat] = useState('')
  const [carbs, setCarbs] = useState('')
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
    setInstructions([...instructions, ''])
  }

  function updateStep(index: number, value: string) {
    setInstructions(instructions.map((s, i) => (i === index ? value : s)))
  }

  function removeStep(index: number) {
    if (instructions.length <= 1) return
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !title.trim()) return

    const validIngredients = ingredients.filter((ing) => ing.name.trim())
    if (validIngredients.length === 0) {
      setError('Add at least one ingredient.')
      return
    }

    const validInstructions = instructions.filter((s) => s.trim())

    const nutrition =
      calories || protein || fat || carbs
        ? {
            calories: calories ? Number(calories) : null,
            protein: protein ? Number(protein) : null,
            fat: fat ? Number(fat) : null,
            carbs: carbs ? Number(carbs) : null,
            fiber: null,
            sodium: null,
          }
        : null

    setSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('recipes').insert({
      user_id: user.id,
      title: title.trim(),
      source_url: sourceUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      spice_level: spiceLevel > 0 ? spiceLevel : null,
      original_servings: servings,
      ingredients: validIngredients,
      instructions: validInstructions,
      nutrition,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
              placeholder="https://example.com/photo.jpg"
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

          {/* Spice Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spice Level</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSpiceLevel(spiceLevel === n ? 0 : n)}
                  className="w-9 h-9 rounded-full border-2 text-sm font-bold transition-colors"
                  style={{
                    backgroundColor: n <= spiceLevel ? '#D4320C' : 'transparent',
                    borderColor: n <= spiceLevel ? '#D4320C' : '#D6D1CC',
                    color: n <= spiceLevel ? '#fff' : '#857C76',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {spiceLevel === 0 && 'Tap to set'}
              {spiceLevel === 1 && 'Mild'}
              {spiceLevel === 2 && 'Medium'}
              {spiceLevel === 3 && 'Hot'}
              {spiceLevel === 4 && 'Very Hot'}
              {spiceLevel === 5 && 'Extreme'}
            </p>
          </div>

          {/* Ingredients */}
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

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Instructions</label>
              <button
                type="button"
                onClick={addStep}
                className="text-xs font-semibold text-[var(--spice-cayenne)]"
              >
                + Add Step
              </button>
            </div>
            <div className="space-y-2">
              {instructions.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="flex-shrink-0 w-6 h-8 flex items-center justify-center text-xs font-bold text-gray-400">
                    {i + 1}.
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}`}
                    rows={2}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)] resize-none"
                  />
                  {instructions.length > 1 && (
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

          {/* Nutrition (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nutrition (optional)</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  min={0}
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Calories"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                />
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="Protein (g)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                />
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="Fat (g)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                />
              </div>
              <div>
                <input
                  type="number"
                  min={0}
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="Carbs (g)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                />
              </div>
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
