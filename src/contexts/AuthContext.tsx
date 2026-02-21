import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'

// ── Tipos ────────────────────────────────────────────────────

interface AuthContextValue {
  session: Session | null
  profile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

// ── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Carrega sessão inicial + perfil
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Escuta mudanças de autenticação (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authId: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()

    setProfile(data ?? null)
    setLoading(false)
  }

  // ── Ações de autenticação ────────────────────────────────

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('Erro ao criar usuário')

    // Cria o perfil na tabela users
    const { error: profileError } = await supabase.from('users').insert({
      auth_id: data.user.id,
      user_name: name,
      user_email: email,
      user_role: 'admin', // primeiro usuário é admin
    })
    if (profileError) throw new Error(profileError.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateProfile(data: Partial<User>) {
    if (!profile) return
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('user_id', profile.user_id)
    if (error) throw new Error(error.message)
    setProfile(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
