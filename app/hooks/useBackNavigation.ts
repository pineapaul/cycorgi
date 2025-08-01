import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface UseBackNavigationOptions {
  defaultRoute?: string
  fallbackRoute?: string
}

export function useBackNavigation(options: UseBackNavigationOptions = {}) {
  const router = useRouter()
  const { defaultRoute, fallbackRoute } = options

  const goBack = useCallback(() => {
    // Check if there's browser history to go back to
    if (window.history.length > 1) {
      // Use browser's back button
      window.history.back()
    } else {
      // No history available, navigate to fallback route
      if (fallbackRoute) {
        router.push(fallbackRoute)
      } else if (defaultRoute) {
        router.push(defaultRoute)
      } else {
        // Last resort - go to home/dashboard
        router.push('/')
      }
    }
  }, [router, defaultRoute, fallbackRoute])

  return { goBack }
} 