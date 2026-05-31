import Card from './components/Card.tsx'

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        <header className="text-center border-2 border-gray-100 p-6 rounded-lg bg-amber-500">
          <h1 className="text-3xl font-bold">List of Japan Race Horses</h1>
        </header>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card />
          <Card />
          <Card />
        </div>

      </div>
    </div>
  )
}

export default App
