import type { Sauce } from '../stores/collectionStore'

interface SauceCardProps {
  sauce: Sauce
}

export default function SauceCard({ sauce }: SauceCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900">{sauce.name}</h3>
      <p className="text-sm text-gray-500">{sauce.brand}</p>
      <div className="mt-2 flex items-center gap-3 text-sm">
        <span>Heat: {sauce.heat}/10</span>
        <span>Rating: {sauce.rating}/5</span>
      </div>
    </div>
  )
}
