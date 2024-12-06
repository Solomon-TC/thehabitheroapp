import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { NotificationProvider } from '../contexts/NotificationContext'
import { SubscriptionProvider } from '../contexts/SubscriptionContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session && !router.pathname.startsWith('/auth')) {
          router.push('/auth')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !router.pathname.startsWith('/auth')) {
        router.push('/auth')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <NotificationProvider>
      <SubscriptionProvider>
        <Component {...pageProps} />
      </SubscriptionProvider>
    </NotificationProvider>
  )
}
