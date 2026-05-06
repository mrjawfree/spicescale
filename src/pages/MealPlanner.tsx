import { useState, useRef, useEffect } from 'react'
import { useMealPlanStore, getSuggestions, type MealType, type MealRef, type Suggestion } from '../stores/mealPlanStore'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEALS: { label: string; key: MealType }[] = [
  { label: 'BREAKFAST', key: 'breakfast' },
  { label: 'LUNCH', key: 'lunch' },
  { label: 'DINNER', key: 'dinner' },
]

function formatWeekRange(weekStart: string) {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const mo = start.toLocaleDateString('en-US', { month: 'short' })
  return `Week of ${mo} ${start.getDate()}–${end.getDate()}`
}

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: i <= level ? 'var(--color-cayenne-500)' : 'var(--color-ink-300)',
          }}
        />
      ))}
    </span>
  )
}

function spiceColor(owned: number, total: number) {
  if (owned === total) return 'var(--color-success-500)'
  if (owned / total < 0.5) return 'var(--color-warn-500)'
  return 'var(--color-cayenne-500)'
}

function MealCellEmpty({ onTap }: { onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="w-[88px] h-[88px] sm:w-full sm:h-24 rounded-[12px] flex items-center justify-center shrink-0 cursor-pointer"
      style={{
        backgroundColor: 'var(--color-ink-100)',
        border: '1px dashed var(--color-ink-300)',
      }}
    >
      <span className="text-2xl" style={{ color: 'var(--color-ink-500)' }}>+</span>
    </button>
  )
}

function MealCardFilled({ meal, onTap }: { meal: MealRef; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="w-[88px] h-[88px] sm:w-full sm:h-24 rounded-[12px] p-3 flex flex-col justify-between shrink-0 text-left cursor-pointer"
      style={{
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-1)',
      }}
    >
      <span
        className="text-[13px] font-semibold leading-tight line-clamp-2"
        style={{ color: 'var(--color-ink-900)' }}
      >
        {meal.name}
      </span>
      <span className="flex items-center gap-1 text-[13px]" style={{ color: 'var(--color-ink-700)' }}>
        <span style={{ color: spiceColor(meal.spicesOwned, meal.spicesTotal) }}>🔥</span>
        <span className="tabular-nums">{meal.spicesOwned}/{meal.spicesTotal}</span>
      </span>
    </button>
  )
}

function SuggestionSheet({
  isOpen,
  onDismiss,
  day,
  mealType,
  onSelect,
}: {
  isOpen: boolean
  onDismiss: () => void
  day: string
  mealType: MealType
  onSelect: (suggestion: Suggestion) => void
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSuggestions(getSuggestions(mealType))
    }
  }, [isOpen, mealType])

  if (!isOpen) return null

  const dayDate = new Date(day)
  const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1)

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(26,23,20,0.5)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onDismiss() }}
    >
      <div
        className="w-full max-w-lg rounded-t-[24px] p-6 pb-8 max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sheet)',
          animation: 'slideUp 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div className="flex justify-center mb-2">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--color-ink-300)' }} />
        </div>

        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-ink-900)' }}>
              Add {mealLabel} — {dayName}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-ink-500)' }}>{monthDay}</p>
          </div>
          <button
            onClick={onDismiss}
            className="w-11 h-11 flex items-center justify-center -mr-2 -mt-1"
            style={{ color: 'var(--color-ink-700)' }}
          >
            ✕
          </button>
        </div>

        <p className="text-[13px] mb-4" style={{ color: 'var(--color-ink-500)' }}>
          Suggested for your spice rack
        </p>

        <div className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <div
              key={s.recipeId}
              className="rounded-[16px] p-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-ink-300)',
              }}
            >
              <h3 className="text-[17px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--color-ink-900)' }}>
                {s.name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-[13px]" style={{ color: 'var(--color-ink-700)' }}>
                <span style={{ color: spiceColor(s.spicesOwned, s.spicesTotal) }}>🔥</span>
                <span>{s.spicesOwned}/{s.spicesTotal} spices</span>
                <span>·</span>
                <span>{s.prepMin} min</span>
                <span>·</span>
                <DifficultyDots level={s.difficulty} />
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => onSelect(s)}
                  className="px-4 py-2.5 rounded-full text-[15px] font-semibold text-white min-h-[44px] cursor-pointer"
                  style={{ backgroundColor: 'var(--color-cayenne-500)' }}
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function MealPlanner() {
  const { weekStart, days, setMeal, navigateWeek } = useMealPlanStore()
  const [sheetTarget, setSheetTarget] = useState<{ day: string; mealType: MealType } | null>(null)
  const [showToast, setShowToast] = useState(false)
  const todayStr = new Date().toISOString().split('T')[0]

  const hasMeals = days.some((d) => d.breakfast || d.lunch || d.dinner)

  useEffect(() => {
    if (!hasMeals) {
      setShowToast(true)
      const t = setTimeout(() => setShowToast(false), 4000)
      return () => clearTimeout(t)
    }
  }, [])

  function handleSelect(suggestion: Suggestion) {
    if (!sheetTarget) return
    const meal: MealRef = {
      recipeId: suggestion.recipeId,
      name: suggestion.name,
      spicesOwned: suggestion.spicesOwned,
      spicesTotal: suggestion.spicesTotal,
    }
    setMeal(sheetTarget.day, sheetTarget.mealType, meal)
    setSheetTarget(null)
  }

  function handleRemove(date: string, mealType: MealType) {
    setMeal(date, mealType, undefined)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* TopBar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 h-14"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-ink-300)',
          boxShadow: 'var(--shadow-2)',
        }}
      >
        <button
          onClick={() => navigateWeek('prev')}
          className="w-11 h-11 flex items-center justify-center text-lg font-bold cursor-pointer"
          style={{ color: 'var(--color-cayenne-500)' }}
        >
          ←
        </button>
        <span className="text-xl font-semibold" style={{ color: 'var(--color-ink-900)' }}>
          {formatWeekRange(weekStart)}
        </span>
        <button
          onClick={() => navigateWeek('next')}
          className="w-11 h-11 flex items-center justify-center text-lg font-bold cursor-pointer"
          style={{ color: 'var(--color-cayenne-500)' }}
        >
          →
        </button>
      </div>

      {/* DayStrip */}
      <div
        className="sticky top-14 z-20 flex justify-around px-2 py-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-ink-300)',
        }}
      >
        {days.map((day, i) => {
          const isToday = day.date === todayStr
          return (
            <div key={day.date} className="flex flex-col items-center w-11 gap-0.5">
              <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-ink-500)' }}>
                {DAYS[i]}
              </span>
              <span
                className="w-7 h-7 flex items-center justify-center rounded-full text-[17px] font-semibold"
                style={{
                  backgroundColor: isToday ? 'var(--color-cayenne-50)' : 'transparent',
                  color: isToday ? 'var(--color-cayenne-500)' : 'var(--color-ink-900)',
                }}
              >
                {new Date(day.date).getDate()}
              </span>
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 px-4 py-4 pb-20 overflow-y-auto">
        {MEALS.map(({ label, key }) => (
          <div key={key} className="mb-6">
            <h3
              className="text-[11px] font-semibold tracking-wider uppercase mb-2"
              style={{ color: 'var(--color-ink-500)' }}
            >
              {label}
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-7 sm:overflow-x-visible">
              {days.map((day) => {
                const meal = day[key]
                return meal ? (
                  <MealCardFilled
                    key={day.date}
                    meal={meal}
                    onTap={() => handleRemove(day.date, key)}
                  />
                ) : (
                  <MealCellEmpty
                    key={day.date}
                    onTap={() => setSheetTarget({ day: day.date, mealType: key })}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium z-40"
          style={{
            backgroundColor: 'var(--color-ink-900)',
            color: 'var(--color-surface)',
          }}
        >
          Tap any slot to add a meal.
        </div>
      )}

      <SuggestionSheet
        isOpen={!!sheetTarget}
        onDismiss={() => setSheetTarget(null)}
        day={sheetTarget?.day ?? ''}
        mealType={sheetTarget?.mealType ?? 'lunch'}
        onSelect={handleSelect}
      />
    </div>
  )
}
