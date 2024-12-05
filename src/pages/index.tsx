import { useEffect, useState } from 'react'
import { supabase } from './_app'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking session:', error)
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Habit Hero</h1>
      <div className="grid gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Habit Hero</h2>
          <p className="text-gray-600">
            Track your habits, achieve your goals, and level up your life!
          </p>
          <button className="btn mt-4">
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}
