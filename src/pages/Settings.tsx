import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

async function registerPushSubscription(userId: string) {
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }
  const keys = sub.toJSON().keys!
  await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      keys_p256dh: keys.p256dh,
      keys_auth: keys.auth,
    },
    { onConflict: 'user_id' }
  )
}

async function removePushSubscription(userId: string) {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (sub) await sub.unsubscribe()
  await supabase.from('push_subscriptions').delete().eq('user_id', userId)
}

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
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
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        alert('Push notifications are not supported in this browser.')
        return
      }

      const permission = await Notification.requestPermission()
      setPermissionState(permission)

      if (permission === 'granted') {
        localStorage.setItem('pushOptIn', 'true')
        setPushEnabled(true)
        if (user) {
          try {
            await registerPushSubscription(user.id)
          } catch (err) {
            console.error('[SpiceScale] Failed to register push subscription', err)
          }
        }
      }
    } else {
      localStorage.removeItem('pushOptIn')
      setPushEnabled(false)
      if (user) {
        try {
          await removePushSubscription(user.id)
        } catch (err) {
          console.error('[SpiceScale] Failed to remove push subscription', err)
        }
      }
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
