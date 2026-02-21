import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, TrendingUp, CheckSquare, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/',             icon: LayoutDashboard, label: 'Início'       },
  { to: '/financas',     icon: Wallet,          label: 'Finanças'     },
  { to: '/investimentos',icon: TrendingUp,       label: 'Investir'     },
  { to: '/tarefas',      icon: CheckSquare,      label: 'Tarefas'      },
  { to: '/notas',        icon: BookOpen,         label: 'Notas'        },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-base-900/80 backdrop border-t border-white/5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn('nav-item', isActive && 'active')
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
                  isActive
                    ? 'bg-gold-500/15 scale-110'
                    : 'hover:bg-base-700'
                )}>
                  <Icon className={cn('w-5 h-5', isActive ? 'text-gold-400' : 'text-slate-500')} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-gold-400' : 'text-slate-600'
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
