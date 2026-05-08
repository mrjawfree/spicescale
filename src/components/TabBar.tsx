import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { key: 'today', label: 'Today', icon: '◉', path: '/' },
  { key: 'plan', label: 'Plan', icon: '📅', path: '/planner' },
  { key: 'history', label: 'History', icon: '📆', path: '/history' },
  { key: 'shop', label: 'Shop', icon: '🛒', path: '/shopping' },
  { key: 'you', label: 'You', icon: '👤', path: '/settings' },
]

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(tab: typeof TABS[number]) {
    if (tab.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(tab.path)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex"
      style={{
        height: '64px',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-ink-300)',
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab)
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer relative"
          >
            {active && (
              <span
                className="absolute top-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: 'var(--color-cayenne-500)' }}
              />
            )}
            <span className="text-lg" style={{ filter: active ? 'none' : 'grayscale(1) opacity(0.5)' }}>
              {tab.icon}
            </span>
            <span
              className="text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: active ? 'var(--color-cayenne-500)' : 'var(--color-ink-500)' }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
