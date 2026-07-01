import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">Vela</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-3">Welcome back 👋</h1>
        <p className="text-gray-400">
          Signed in as <span className="text-white">{user?.email}</span> · Role:{' '}
          <span className="text-indigo-400">{user?.role}</span>
        </p>
        <div className="mt-12 grid grid-cols-3 gap-4">
          {['Knowledge Base', 'Conversations', 'Tickets'].map((item) => (
            <div
              key={item}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left"
            >
              <p className="text-sm text-gray-400">{item}</p>
              <p className="text-2xl font-bold mt-1">—</p>
              <p className="text-xs text-gray-600 mt-1">Coming soon</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
