import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMealPlanStore, getShoppingItems, type Category } from '../stores/mealPlanStore'

const CATEGORIES: Category[] = ['Produce', 'Pantry', 'Dairy', 'Meat', 'Other']

function formatWeekRange(weekStart: string) {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const mo = start.toLocaleDateString('en-US', { month: 'short' })
  return `Week of ${mo} ${start.getDate()}–${end.getDate()}`
}

export default function ShoppingList() {
  const navigate = useNavigate()
  const { weekStart, days, checkedItems, toggleChecked, clearChecked } = useMealPlanStore()
  const [checkedOpen, setCheckedOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const allItems = getShoppingItems(days)
  const hasMeals = days.some((d) => d.breakfast || d.lunch || d.dinner)

  const uncheckedItems = allItems.filter((item) => !checkedItems[item.id])
  const checkedList = allItems.filter((item) => checkedItems[item.id])

  function handleShare() {
    const lines = [`Shopping List — ${formatWeekRange(weekStart)}`]
    for (const cat of CATEGORIES) {
      const items = uncheckedItems.filter((i) => i.category === cat)
      if (items.length === 0) continue
      lines.push(`\n${cat.toUpperCase()}`)
      for (const item of items) {
        lines.push(`- ${item.name} (${item.qty})`)
      }
    }
    const text = lines.join('\n')
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  if (!hasMeals) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div
          className="sticky top-0 z-30 px-4 h-14 flex items-center"
          style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-ink-300)' }}
        >
          <button onClick={() => navigate('/planner')} className="w-11 h-11 flex items-center justify-center text-lg cursor-pointer" style={{ color: 'var(--color-ink-700)' }}>←</button>
          <div className="ml-2">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-ink-900)' }}>Shopping List</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-20">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-[15px] mb-4" style={{ color: 'var(--color-ink-700)' }}>Plan some meals to build your shopping list.</p>
          <button
            onClick={() => navigate('/planner')}
            className="px-5 py-2.5 rounded-full text-[15px] font-semibold text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-cayenne-500)' }}
          >
            Go to Planner
          </button>
        </div>
      </div>
    )
  }

  if (allItems.length === 0 && hasMeals) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div
          className="sticky top-0 z-30 px-4 h-14 flex items-center"
          style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-ink-300)' }}
        >
          <button onClick={() => navigate('/planner')} className="w-11 h-11 flex items-center justify-center text-lg cursor-pointer" style={{ color: 'var(--color-ink-700)' }}>←</button>
          <div className="ml-2">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-ink-900)' }}>Shopping List</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-20">
          <div className="text-5xl mb-4" style={{ color: 'var(--color-success-500)' }}>✓</div>
          <p className="text-[15px]" style={{ color: 'var(--color-ink-700)' }}>You're all stocked for this week.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* TopBar */}
      <div
        className="sticky top-0 z-30 px-4 h-14 flex items-center justify-between"
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-ink-300)' }}
      >
        <div className="flex items-center">
          <button onClick={() => navigate('/planner')} className="w-11 h-11 flex items-center justify-center text-lg cursor-pointer" style={{ color: 'var(--color-ink-700)' }}>←</button>
          <div className="ml-2">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-ink-900)' }}>Shopping List</h1>
            <p className="text-[13px] -mt-0.5" style={{ color: 'var(--color-ink-500)' }}>{formatWeekRange(weekStart)}</p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="w-11 h-11 flex items-center justify-center text-lg cursor-pointer"
          style={{ color: 'var(--color-ink-700)' }}
        >
          ⤴
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-4 pb-20 overflow-y-auto">
        {CATEGORIES.map((cat) => {
          const items = uncheckedItems.filter((i) => i.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat} className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-ink-500)' }}>{cat}</span>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--color-ink-500)' }}>({items.length})</span>
              </div>
              <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
                {items.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecked(item.id)}
                    className="w-full flex items-center px-4 min-h-[52px] cursor-pointer text-left"
                    style={{ borderTop: idx > 0 ? '1px solid var(--color-ink-300)' : undefined }}
                  >
                    <span
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 mr-3"
                      style={{ border: '1.5px solid var(--color-ink-300)' }}
                    />
                    <span className="flex-1 text-[15px]" style={{ color: 'var(--color-ink-900)' }}>{item.name}</span>
                    <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-ink-500)' }}>{item.qty}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {/* Checked off section */}
        {checkedList.length > 0 && (
          <div className="mb-5">
            <button
              onClick={() => setCheckedOpen(!checkedOpen)}
              className="flex items-center gap-2 w-full h-12 text-[15px] font-medium cursor-pointer"
              style={{ color: 'var(--color-ink-700)' }}
            >
              <span>{checkedOpen ? '▾' : '▸'}</span>
              <span>Checked off ({checkedList.length})</span>
            </button>
            {checkedOpen && (
              <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-1)' }}>
                {checkedList.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecked(item.id)}
                    className="w-full flex items-center px-4 min-h-[52px] cursor-pointer text-left"
                    style={{ borderTop: idx > 0 ? '1px solid var(--color-ink-300)' : undefined }}
                  >
                    <span
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 mr-3"
                      style={{ backgroundColor: 'var(--color-cayenne-500)', border: '1.5px solid var(--color-cayenne-500)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <span className="flex-1 text-[15px] line-through" style={{ color: 'var(--color-ink-500)' }}>{item.name}</span>
                    <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-ink-500)' }}>{item.qty}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-3">
              <button
                onClick={() => setShowConfirm(true)}
                className="h-11 px-4 text-[15px] cursor-pointer"
                style={{ color: 'var(--color-ink-700)' }}
              >
                Clear checked
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(26,23,20,0.5)' }}>
          <div className="mx-6 p-6 rounded-[16px] max-w-sm w-full" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-[15px] mb-4" style={{ color: 'var(--color-ink-900)' }}>
              Clear {checkedList.length} checked item{checkedList.length !== 1 ? 's' : ''}? This can't be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-[15px] cursor-pointer" style={{ color: 'var(--color-ink-700)' }}>Cancel</button>
              <button
                onClick={() => { clearChecked(); setShowConfirm(false) }}
                className="px-4 py-2 rounded-full text-[15px] font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'var(--color-cayenne-500)' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
