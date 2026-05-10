import { useAuth } from '../contexts/AuthContext'
import { useSavedRecipesStore } from '../stores/savedRecipesStore'

interface BookmarkButtonProps {
  recipeId: string
  size?: 'sm' | 'md'
}

export default function BookmarkButton({ recipeId, size = 'sm' }: BookmarkButtonProps) {
  const { user } = useAuth()
  const isSaved = useSavedRecipesStore((s) => s.isSaved(recipeId))
  const toggleSave = useSavedRecipesStore((s) => s.toggleSave)

  if (!user) return null

  const dims = size === 'md' ? 'w-6 h-6' : 'w-5 h-5'

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleSave(user.id, recipeId)
      }}
      className="p-1 hover:scale-110 transition-transform"
      aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={dims}
        viewBox="0 0 24 24"
        fill={isSaved ? '#D4320C' : 'none'}
        stroke={isSaved ? '#D4320C' : 'currentColor'}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  )
}
