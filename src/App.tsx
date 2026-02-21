import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import BottomNav from '@/components/layout/BottomNav'
import LoginPage from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import FinancasPage from '@/pages/financas/FinancasPage'
import { InvestimentosPage, TarefasPage, NotasPage, ConfiguracoesPage } from '@/pages/Placeholders'

function AppLayout() {
  const { session } = useAuth()
  if (!session) return null
  return (
    <div className="relative h-full">
      <Routes>
        <Route path="/"               element={<Dashboard />} />
        <Route path="/financas/*"     element={<FinancasPage />} />
        <Route path="/investimentos"  element={<InvestimentosPage />} />
        <Route path="/tarefas"        element={<TarefasPage />} />
        <Route path="/notas"          element={<NotasPage />} />
        <Route path="/configuracoes"  element={<ConfiguracoesPage />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
