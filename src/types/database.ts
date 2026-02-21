// ============================================================
// Tipos TypeScript — espelham o schema do Supabase
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type UserRole = 'admin' | 'member'

export type BankType = 'Corrente' | 'Poupança' | 'Cartão de Crédito' | 'Carteira Digital' | 'Investimento'

export type ExpenseType = 'Fixo' | 'Variável' | 'Dívida' | 'Investimento'

export type InvestmentProductType =
  | 'Ações BR' | 'Ações Internacionais' | 'FII' | 'ETF'
  | 'CDB' | 'CRI' | 'CRA' | 'LCI' | 'LCA'
  | 'Fundo' | 'Tesouro Direto' | 'Cripto' | 'Outro'

export type RevenueType =
  | 'Salário' | 'Pró-labore' | 'Dividendo PJ'
  | 'Freelance' | 'Aluguel' | 'Investimento' | 'Outro'

export type TaskStatus = 'A Fazer' | 'Em Progresso' | 'Concluído' | 'Cancelado'
export type TaskPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente'
export type RecurrencyType = 'Diária' | 'Semanal' | 'Mensal' | 'Anual'

export type ProjectStatus = 'Ativo' | 'Em Pausa' | 'Concluído' | 'Arquivado'

export type ArchiveType = 'documento' | 'imagem' | 'link' | 'planilha' | 'outro'

export type PositionSource = 'brapi' | 'manual'

// ── Entidades ────────────────────────────────────────────────

export interface User {
  user_id: string
  auth_id: string
  user_name: string
  user_email: string
  user_photo?: string
  user_role: UserRole
  created_at: string
  updated_at: string
}

export interface Bank {
  bank_id: string
  user_id: string
  bank_name: string
  bank_type: BankType
  bank_initial_balance: number
  bank_color: string
  bank_icon?: string
  bank_is_active: boolean
  created_at: string
  updated_at: string
}

export interface Expense {
  expense_id: string
  user_id?: string
  expense_name: string
  expense_type: ExpenseType
  expense_expected_amount?: number
  expense_icon?: string
  expense_color: string
  expense_is_active: boolean
  created_at: string
  updated_at: string
}

export interface InvestmentProduct {
  investment_product_id: string
  user_id: string
  investment_product_name: string
  investment_product_ticker?: string
  investment_product_type: InvestmentProductType
  investment_product_broker?: string
  investment_product_index?: string
  investment_product_rate?: number
  investment_product_liquidity?: string
  investment_product_maturity_date?: string
  investment_product_quantity?: number
  investment_product_avg_price?: number
  investment_product_is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  transaction_id: string
  user_id: string
  expense_id: string
  bank_id: string
  investment_product_id?: string
  transaction_datetime: string
  transaction_description?: string
  transaction_amount: number
  transaction_installments: number
  transaction_installment_current: number
  transaction_is_recurring: boolean
  created_at: string
  updated_at: string
  // Joins opcionais
  expense?: Expense
  bank?: Bank
}

export interface Revenue {
  revenue_id: string
  user_id: string
  bank_id: string
  revenue_datetime: string
  revenue_description?: string
  revenue_amount: number
  revenue_type: RevenueType
  revenue_is_recurring: boolean
  created_at: string
  updated_at: string
  // Joins opcionais
  bank?: Bank
}

export interface Position {
  position_id: string
  investment_product_id: string
  position_datetime: string
  position_quantity?: number
  position_unit_price?: number
  position_amount: number
  position_source: PositionSource
  created_at: string
}

export interface Project {
  project_id: string
  user_id?: string
  project_name: string
  project_description?: string
  project_status: ProjectStatus
  project_icon?: string
  project_color: string
  project_due_date?: string
  created_at: string
  updated_at: string
}

export interface Task {
  task_id: string
  project_id?: string
  user_id: string
  task_description: string
  task_status: TaskStatus
  task_priority: TaskPriority
  task_initial_date?: string
  task_due_date?: string
  task_completion_date?: string
  task_is_recurring: boolean
  task_recurrency_type?: RecurrencyType
  task_recurrency_days?: string[]
  task_recurrency_end_date?: string
  task_points: number
  created_at: string
  updated_at: string
  // Joins opcionais
  project?: Project
}

export interface Note {
  note_id: string
  user_id: string
  project_id?: string
  task_id?: string
  note_title?: string
  note?: string
  note_is_pinned: boolean
  note_creation_date: string
  note_last_update: string
  // Joins opcionais
  tags?: Tag[]
}

export interface Tag {
  tag_id: string
  user_id: string
  tag_name: string
  tag_color: string
  created_at: string
}

export interface Archive {
  archive_id: string
  user_id: string
  project_id?: string
  task_id?: string
  archive_description?: string
  archive_type: ArchiveType
  archive_url: string
  archive_size_kb?: number
  archive_mime_type?: string
  archive_creation_date: string
  // Joins opcionais
  tags?: Tag[]
}

// ── Database type (para o cliente Supabase tipado) ────────────

export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'created_at' | 'updated_at'>; Update: Partial<User> }
      banks: { Row: Bank; Insert: Omit<Bank, 'bank_id' | 'created_at' | 'updated_at'>; Update: Partial<Bank> }
      expenses: { Row: Expense; Insert: Omit<Expense, 'expense_id' | 'created_at' | 'updated_at'>; Update: Partial<Expense> }
      investment_products: { Row: InvestmentProduct; Insert: Omit<InvestmentProduct, 'investment_product_id' | 'created_at' | 'updated_at'>; Update: Partial<InvestmentProduct> }
      transactions: { Row: Transaction; Insert: Omit<Transaction, 'transaction_id' | 'created_at' | 'updated_at'>; Update: Partial<Transaction> }
      revenues: { Row: Revenue; Insert: Omit<Revenue, 'revenue_id' | 'created_at' | 'updated_at'>; Update: Partial<Revenue> }
      positions: { Row: Position; Insert: Omit<Position, 'position_id' | 'created_at'>; Update: Partial<Position> }
      projects: { Row: Project; Insert: Omit<Project, 'project_id' | 'created_at' | 'updated_at'>; Update: Partial<Project> }
      tasks: { Row: Task; Insert: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>; Update: Partial<Task> }
      notes: { Row: Note; Insert: Omit<Note, 'note_id' | 'note_creation_date' | 'note_last_update'>; Update: Partial<Note> }
      tags: { Row: Tag; Insert: Omit<Tag, 'tag_id' | 'created_at'>; Update: Partial<Tag> }
      archives: { Row: Archive; Insert: Omit<Archive, 'archive_id' | 'archive_creation_date'>; Update: Partial<Archive> }
    }
    Views: {
      vw_bank_balance: { Row: Bank & { current_balance: number } }
      vw_monthly_expenses_by_category: { Row: Expense & { total_spent: number; reference_month: string } }
      vw_pending_tasks: { Row: Task & { project_name?: string; project_color?: string; is_overdue: boolean } }
    }
  }
}

// ── Tipos de UI ───────────────────────────────────────────────

/** Item do portfólio calculado com dados da BRAPI */
export interface PortfolioItem {
  ticker: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  totalInvested: number
  currentValue: number
  gainLoss: number
  gainLossPct: number
  dailyChangePct: number
}
