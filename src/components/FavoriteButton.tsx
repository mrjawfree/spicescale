import { useFavoritesStore, type FavoriteType } from '../stores/favoritesStore'

interface FavoriteButtonProps {
  id: string
  type: FavoriteType
}

export default function FavoriteButton({ id, type }: FavoriteButtonProps) {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
  const isFavorite = useFavoritesStore((s) => s.isFavorite(id))

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite(id, type)
      }}
      className="flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-100"
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5 transition-transform active:scale-125"
        fill={isFavorite ? '#D4320C' : 'none'}
        stroke={isFavorite ? '#D4320C' : '#9ca3af'}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
