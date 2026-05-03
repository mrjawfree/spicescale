import type { Sauce } from '../stores/collectionStore'

interface SauceCardProps {
  sauce: Sauce
}

export default function SauceCard({ sauce }: SauceCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900">{sauce.name}</h3>
      {sauce.brand && <p className="text-sm text-gray-500">{sauce.brand}</p>}
      <div className="mt-2 flex items-center gap-3 text-sm">
        <span>Heat: {sauce.heat}/10</span>
        <span className="text-amber-400">
          {'★'.repeat(sauce.rating)}
          {'★'.repeat(5 - sauce.rating).split('').map((_, i) => (
            <span key={i} className="text-gray-300">★</span>
          ))}
        </span>
      </div>
      {sauce.heatNotes && (
        <p className="mt-2 text-xs text-gray-600">🔥 {sauce.heatNotes}</p>
      )}
      {sauce.flavorNotes && (
        <p className="mt-1 text-xs text-gray-600">🍃 {sauce.flavorNotes}</p>
      )}
    </div>
  )
}
