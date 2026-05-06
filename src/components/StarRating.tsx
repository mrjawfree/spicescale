import { useState } from 'react'

interface StarRatingProps {
  rating: number
  onRate?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
}

export default function StarRating({ rating, onRate, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const interactive = !!onRate
  const display = hovered || rating

  return (
    <div
      className={`flex gap-0.5 ${sizes[size]}`}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star === rating ? 0 : star)}
          onMouseEnter={() => interactive && setHovered(star)}
          className={`leading-none transition-colors disabled:cursor-default ${
            interactive ? 'cursor-pointer' : ''
          }`}
          style={{ color: star <= display ? '#FFB400' : '#E0E0E0' }}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
