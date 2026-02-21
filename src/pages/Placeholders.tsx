// ============================================================
// Páginas placeholder — serão desenvolvidas em etapas
// ============================================================

import { Construction } from 'lucide-react'

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="screen flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-base-800 border border-white/10 flex items-center justify-center">
        <Construction className="w-8 h-8 text-gold-400" />
      </div>
      <div>
        <h1 className="font-display text-2xl text-slate-100">{title}</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">{description}</p>
      </div>
      <div className="chip bg-gold-500/10 text-gold-400 border border-gold-500/20">
        Em desenvolvimento
      </div>
    </div>
  )
}

export function FinancasPage() {
  return <PlaceholderPage
    title="Finanças"
    description="Controle de receitas, despesas e orçamento mensal"
  />
}

export function InvestimentosPage() {
  return <PlaceholderPage
    title="Investimentos"
    description="Carteira consolidada com dados em tempo real via BRAPI"
  />
}

export function TarefasPage() {
  return <PlaceholderPage
    title="Tarefas"
    description="Projetos, tarefas e responsabilidades do casal"
  />
}

export function NotasPage() {
  return <PlaceholderPage
    title="Notas & Arquivos"
    description="Base de conhecimento, notas e documentos importantes"
  />
}

export function ConfiguracoesPage() {
  return <PlaceholderPage
    title="Configurações"
    description="Perfil, contas bancárias, categorias e membros"
  />
}
