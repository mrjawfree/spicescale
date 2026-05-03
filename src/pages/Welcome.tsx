import { useState, useEffect } from 'react'

interface WelcomeProps {
  onComplete: () => void
}

export default function Welcome({ onComplete }: WelcomeProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 600),
      setTimeout(() => setStage(3), 1000),
      setTimeout(() => setStage(4), 1400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  function handleGetStarted() {
    localStorage.setItem('hasSeenWelcome', 'true')
    onComplete()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div
        className="transition-all duration-700 ease-out"
        style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-[#D4320C]" />
          <span className="text-2xl font-bold text-[#D4320C]">SpiceScale</span>
        </div>
        <p className="text-sm text-gray-500 -mt-6 mb-8">Track the heat.</p>
      </div>

      <div
        className="flex items-end justify-center gap-3 mb-10 transition-all duration-700 ease-out"
        style={{ opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <div className="w-12 h-28 rounded-lg bg-[#FF7043]" />
        <div className="w-14 h-36 rounded-lg bg-[#D4320C]" />
        <div className="w-12 h-28 rounded-lg bg-[#FFB400]" />
      </div>

      <div
        className="transition-all duration-700 ease-out mb-10"
        style={{ opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Log every sauce. Find your heat.
        </h1>
        <p className="text-gray-600 max-w-xs mx-auto">
          Log every hot sauce you try. Find your heat tolerance. Never forget a great bottle.
        </p>
      </div>

      <div
        className="transition-all duration-700 ease-out"
        style={{ opacity: stage >= 4 ? 1 : 0, transform: stage >= 4 ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <button
          onClick={handleGetStarted}
          className="bg-[#D4320C] text-white font-semibold px-8 py-3 rounded-full text-lg hover:opacity-90 transition-opacity"
        >
          Get started
        </button>
      </div>
    </div>
  )
}
