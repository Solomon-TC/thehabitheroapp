import { useEffect, useState } from 'react'
import { supabase } from './_app'
import Character from '../components/Character'

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

  // Sample character data
  const sampleCharacter = {
    id: '1',
    name: 'Hero',
    level: 5,
    experience: 1250,
    appearance: {
      color: '#4F46E5',
      accessories: ['Crown', 'Cape']
    },
    stats: {
      strength: 10,
      agility: 8,
      wisdom: 12,
      charisma: 15
    },
    achievements: [
      {
        id: '1',
        name: 'Early Bird',
        description: 'Complete morning routine for 7 days straight',
        dateUnlocked: '2024-01-15'
      }
    ],
    habits: [
      {
        id: '1',
        name: 'Morning Meditation',
        streak: 7,
        lastCompleted: '2024-01-15'
      }
    ],
    goals: [
      {
        id: '1',
        name: 'Read 12 Books',
        progress: 3,
        target: 12,
        deadline: '2024-12-31'
      }
    ]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Habit Hero</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Your Character</h2>
            <Character character={sampleCharacter} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button className="w-full btn">
                Add New Habit
              </button>
              <button className="w-full btn">
                Set New Goal
              </button>
              <button className="w-full btn">
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
