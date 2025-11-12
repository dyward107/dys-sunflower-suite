import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunflower-100 to-pastel-green flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-sunflower-700 mb-4">
          🌻 Dy's Sunflower Suite
        </h1>
        <p className="text-2xl text-sunflower-600 mb-8">
          Civil Defense Litigation Case Management
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-3xl font-semibold text-sunflower-800 mb-4">
            Welcome!
          </h2>
          <p className="text-gray-700 mb-6">
            Your suite is successfully initialized and ready to build.
          </p>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-sunflower-500 hover:bg-sunflower-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Test Button: {count}
          </button>
          <div className="mt-6 text-sm text-gray-600">
            <p>✅ React 18 + TypeScript 5</p>
            <p>✅ Vite 5 + Tailwind CSS</p>
            <p>✅ Sunflower Theme Active</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
