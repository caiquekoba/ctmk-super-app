import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
      } else {
        if (!form.name.trim()) throw new Error('Informe seu nome')
        await signUp(form.email, form.password, form.name)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,175,26,0.08) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20
                        flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-gold-400" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl text-slate-100">Gestão Pessoal</h1>
          <p className="text-slate-500 text-sm mt-1">Finanças, tarefas e conhecimento</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm animate-slide-up">
        <div className="card-glow">

          {/* Tabs Login / Cadastro */}
          <div className="flex bg-base-900 rounded-xl p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  mode === m
                    ? 'bg-base-700 text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nome (apenas no cadastro) */}
            {mode === 'register' && (
              <div>
                <label className="label">Nome</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={update('name')}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="label">E-mail</label>
              <input
                className="input"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={update('email')}
                autoComplete="email"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                  value={form.password}
                  onChange={update('password')}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <p className="text-rose-400 text-sm bg-rose-400/10 border border-rose-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-base-900/30 border-t-base-900 rounded-full animate-spin" />
              ) : (
                mode === 'login' ? 'Entrar' : 'Criar conta'
              )}
            </button>
          </form>
        </div>

        {/* Nota de segurança */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Seus dados ficam seguros no Supabase com criptografia ponta a ponta
        </p>
      </div>
    </div>
  )
}
