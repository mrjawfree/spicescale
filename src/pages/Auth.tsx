import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { returnTo?: string })?.returnTo ?? '/recipes'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password)

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      navigate(returnTo, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-[#D4320C]" />
          <span className="text-2xl font-bold text-[#D4320C]">SpiceScale</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {mode === 'signin'
              ? 'Sign in to access your saved recipes.'
              : 'Save and share your scaled recipes.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--spice-cayenne)] focus:outline-none focus:ring-1 focus:ring-[var(--spice-cayenne)]"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[var(--spice-cayenne)] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting
                ? 'Please wait...'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null) }}
              className="font-semibold text-[var(--spice-cayenne)]"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <button
          onClick={() => navigate('/', { replace: true })}
          className="mt-4 w-full text-center text-sm text-gray-400"
        >
          Continue without account
        </button>
      </div>
    </div>
  )
}
