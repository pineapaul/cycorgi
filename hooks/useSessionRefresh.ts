import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function useSessionRefresh() {
  const { data: session, update } = useSession()

  // Auto-refresh session every 10 minutes to keep it in sync
  useEffect(() => {
    if (!session?.user) return

    const interval = setInterval(() => {
      update()
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [session?.user, update])

  return {
    session
  }
}
