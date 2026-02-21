# CTMK - Super App

App de gestão pessoal de finanças, tarefas e conhecimento, otimizado para iOS como PWA.

## Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Estilo**: Tailwind CSS (tema dark customizado)
- **Backend/DB**: Supabase (Postgres + Auth + Storage + Realtime)
- **PWA**: vite-plugin-pwa + Workbox
- **Investimentos**: BRAPI API
- **Roteamento**: React Router v6
- **Animações**: Framer Motion

---

## ⚡ Setup em 5 passos

### 1. Clone e instale as dependências

```bash
git clone <seu-repositório>
cd ctmk-super-app
npm install
```

### 2. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor → New Query**
3. Cole o conteúdo do arquivo `schema.sql` e clique em **Run**
4. Vá em **Project Settings → API** e copie a URL e a anon key

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas chaves:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_BRAPI_TOKEN=seu_token_brapi
```

### 4. Configure o BRAPI

1. Acesse [brapi.dev](https://brapi.dev) e crie uma conta
2. Gere um token no painel
3. Cole no `.env` no campo `VITE_BRAPI_TOKEN`

### 5. Rode o projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📱 Instalar como PWA no iPhone

1. Abra o app no **Safari** (obrigatório no iOS)
2. Toque no ícone de **compartilhar** (quadrado com seta)
3. Selecione **"Adicionar à Tela de Início"**
4. Toque em **Adicionar**

O app aparecerá na home como um aplicativo nativo.

---

## 🚀 Deploy na Vercel

```bash
npm install -g vercel
vercel --prod
```

Configure as variáveis de ambiente na dashboard da Vercel em:
**Settings → Environment Variables**

---

## 📁 Estrutura do projeto

```
src/
├── components/
│   ├── layout/
│   │   └── BottomNav.tsx       # Navegação inferior
│   └── ProtectedRoute.tsx      # Guarda de rotas autenticadas
├── contexts/
│   └── AuthContext.tsx         # Estado de autenticação global
├── lib/
│   ├── supabase.ts             # Cliente Supabase
│   ├── brapi.ts                # Serviço BRAPI (investimentos)
│   └── utils.ts                # Formatadores e utilitários
├── pages/
│   ├── Login.tsx               # Tela de login/cadastro
│   ├── Dashboard.tsx           # Home — resumo geral
│   └── Placeholders.tsx        # Telas em desenvolvimento
├── types/
│   └── database.ts             # Tipos TypeScript do banco
├── App.tsx                     # Roteador principal
├── main.tsx                    # Entry point
└── index.css                   # Estilos globais + componentes
```

---

## 🗺️ Roadmap de desenvolvimento

- [x] Configuração do projeto (PWA, Supabase, BRAPI, TypeScript)
- [x] Autenticação (login, cadastro, sessão persistente)
- [x] Dashboard com saldo consolidado e tarefas urgentes
- [ ] Módulo Finanças (extrato, orçamento, lançamento rápido)
- [ ] Módulo Receitas
- [ ] Módulo Investimentos (carteira + BRAPI)
- [ ] Módulo Tarefas (projetos, kanban, recorrência)
- [ ] Módulo Notas (editor TipTap + tags)
- [ ] Módulo Arquivos (Supabase Storage)
- [ ] Compartilhamento com cônjuge (realtime)
- [ ] Configurações (bancos, categorias, perfil)
- [ ] Notificações push (vencimentos e metas)

---

## 🔐 Segurança

- Senhas gerenciadas pelo Supabase Auth (nunca armazenadas em texto puro)
- Row Level Security (RLS) habilitado em todas as tabelas
- Cada usuário acessa apenas seus próprios dados
- Variáveis sensíveis nunca commitadas (`.env` no `.gitignore`)
