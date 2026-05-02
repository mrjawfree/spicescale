import Collection from './pages/Collection'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#D4320C] text-white px-4 py-3">
        <h1 className="text-xl font-bold">SpiceScale</h1>
      </header>
      <main className="p-4">
        <Collection />
      </main>
    </div>
  )
}

export default App
