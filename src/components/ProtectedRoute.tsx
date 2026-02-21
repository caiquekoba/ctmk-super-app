import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  // Tela de loading enquanto verifica a sessão
  if (loading) {
    return (
      <div className="min-h-screen bg-base-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redireciona para login se não estiver autenticado
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
