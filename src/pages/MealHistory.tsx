import { useState } from 'react'
import { useMealHistoryStore, type MealHistoryEntry } from '../stores/mealHistoryStore'

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function formatToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function MealHistory() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const entries = useMealHistoryStore((s) => s.entries)
  const todayStr = formatToday()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  const monthLabel = new Date(year, month).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  function navigateMonth(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      if (month === 0) {
        setMonth(11)
        setYear(year - 1)
      } else {
        setMonth(month - 1)
      }
    } else {
      if (month === 11) {
        setMonth(0)
        setYear(year + 1)
      } else {
        setMonth(month + 1)
      }
    }
    setSelectedDate(null)
  }

  function dateKey(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getEntry(day: number): MealHistoryEntry | undefined {
    return entries[dateKey(day)]
  }

  const selectedEntry = selectedDate ? entries[selectedDate] : undefined

  const emptyCells = Array.from({ length: firstDay }, (_, i) => i)
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const hasAnyEntries = Object.keys(entries).length > 0

  if (!hasAnyEntries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Meal History Yet</h2>
        <p className="text-gray-500 text-sm">
          Start logging meals in the Meal Planner to see your cooking history here.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="text-lg font-bold text-gray-800">{monthLabel}</h2>
        <button
          onClick={() => navigateMonth('next')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px text-center text-xs font-medium text-gray-500 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {emptyCells.map((i) => (
          <div key={`empty-${i}`} className="bg-gray-50 min-h-[56px]" />
        ))}
        {dayCells.map((day) => {
          const key = dateKey(day)
          const entry = getEntry(day)
          const isToday = key === todayStr
          const isSelected = key === selectedDate

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : key)}
              className={`min-h-[56px] p-1 text-left flex flex-col transition-colors ${
                isSelected
                  ? 'bg-[#D4320C]/10 ring-1 ring-[#D4320C]'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <span
                className={`text-xs font-medium leading-none ${
                  isToday
                    ? 'bg-[#D4320C] text-white w-5 h-5 rounded-full flex items-center justify-center'
                    : 'text-gray-700'
                }`}
              >
                {day}
              </span>
              {entry && (
                <span className="text-[10px] text-gray-600 mt-1 truncate w-full leading-tight">
                  {entry.name}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selectedEntry && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 text-base">{selectedEntry.name}</h3>
          {selectedEntry.cuisine && (
            <p className="text-sm text-gray-500 mt-1">{selectedEntry.cuisine}</p>
          )}
          {selectedEntry.rating !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`text-sm ${i < selectedEntry.rating! ? 'text-[#D4320C]' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          )}
          {selectedEntry.notes && (
            <p className="text-sm text-gray-600 mt-2 italic">{selectedEntry.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}
