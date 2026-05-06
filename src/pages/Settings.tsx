import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const navigate = useNavigate()
  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('pushOptIn') === 'true'
  })
  const [permissionState, setPermissionState] = useState<string>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission)
    }
  }, [])

  const handleToggle = async () => {
    if (!pushEnabled) {
      if (!('Notification' in window)) {
        alert('Push notifications are not supported in this browser.')
        return
      }

      const permission = await Notification.requestPermission()
      setPermissionState(permission)

      if (permission === 'granted') {
        localStorage.setItem('pushOptIn', 'true')
        setPushEnabled(true)
        console.log('[SpiceScale] Push notification opt-in: granted', {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        })
      } else {
        console.log('[SpiceScale] Push notification opt-in: denied', {
          timestamp: new Date().toISOString(),
          permission,
        })
      }
    } else {
      localStorage.removeItem('pushOptIn')
      setPushEnabled(false)
      console.log('[SpiceScale] Push notification opt-out', {
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#D4320C] text-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-lg">&larr;</button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>
      <main className="p-4 max-w-md mx-auto">
        <section className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Weekly spice ideas</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Get notified about new spice ideas each week
              </p>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                pushEnabled ? 'bg-[#D4320C]' : 'bg-gray-300'
              }`}
              aria-label="Toggle push notifications"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  pushEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          {permissionState === 'denied' && (
            <p className="text-xs text-red-500 mt-2">
              Notifications are blocked. Enable them in your browser settings to use this feature.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
