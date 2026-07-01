function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Konvai</h1>
        <p className="text-gray-400 text-lg">AI Customer Support Platform</p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm">Running</span>
        </div>
      </div>
    </div>
  )
}

export default App
