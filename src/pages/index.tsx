export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Habit Hero</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
            <p className="text-gray-600">
              Track your habits and achieve your goals with Habit Hero.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="text-gray-600">
              Start by creating your first habit or goal.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
