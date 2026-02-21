// ============================================================
// Serviço BRAPI — Cotações, câmbio e taxas
// ============================================================

const BASE_URL = 'https://brapi.dev/api'
const TOKEN = import.meta.env.VITE_BRAPI_TOKEN

function buildUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${BASE_URL}${path}`)
  if (TOKEN) url.searchParams.set('token', TOKEN)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

// ── Tipos ────────────────────────────────────────────────────

export interface QuoteResult {
  symbol: string
  shortName: string
  regularMarketPrice: number
  regularMarketChangePercent: number
  regularMarketChange: number
  regularMarketVolume: number
  logourl?: string
  currency: string
}

export interface HistoricalPrice {
  date: string       // ISO string
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjustedClose: number
}

export interface CurrencyResult {
  fromCurrency: string
  toCurrency: string
  ask: number        // preço de venda (BRL por USD)
  bid: number        // preço de compra
  pctChange: number
}

// ── Funções ──────────────────────────────────────────────────

/**
 * Busca cotação atual de um ou mais tickers
 * @param tickers Array de tickers — ex: ['PETR4', 'HGLG11', 'BTC']
 */
export async function getQuotes(tickers: string[]): Promise<QuoteResult[]> {
  if (tickers.length === 0) return []
  const url = buildUrl(`/quote/${tickers.join(',')}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BRAPI: erro ao buscar cotações (${res.status})`)
  const data = await res.json()
  return data.results ?? []
}

/**
 * Busca histórico de preços de um ticker
 * @param ticker Ticker do ativo
 * @param range  Período — '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y'
 * @param interval Intervalo — '1d' | '1wk' | '1mo'
 */
export async function getHistory(
  ticker: string,
  range: '1mo' | '3mo' | '6mo' | '1y' | '2y' = '1y',
  interval: '1d' | '1wk' | '1mo' = '1d'
): Promise<HistoricalPrice[]> {
  const url = buildUrl(`/quote/${ticker}`, {
    range,
    interval,
    fundamental: 'false',
    dividends: 'false',
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BRAPI: erro ao buscar histórico (${res.status})`)
  const data = await res.json()
  return data.results?.[0]?.historicalDataPrice ?? []
}

/**
 * Busca taxa de câmbio
 * @param pairs Pares — ex: ['USD-BRL', 'EUR-BRL']
 */
export async function getCurrency(pairs: string[]): Promise<CurrencyResult[]> {
  const url = buildUrl('/v2/currency', { currency: pairs.join(',') })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BRAPI: erro ao buscar câmbio (${res.status})`)
  const data = await res.json()
  return data.currency ?? []
}

/**
 * Busca taxa SELIC atual
 */
export async function getSelic(): Promise<number> {
  const url = buildUrl('/v2/prime-rate', { country: 'brazil' })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BRAPI: erro ao buscar SELIC (${res.status})`)
  const data = await res.json()
  return data.prime_rate?.[0]?.annualRate ?? 0
}

/**
 * Busca IPCA (inflação) atual
 */
export async function getIPCA(): Promise<number> {
  const url = buildUrl('/v2/inflation', { country: 'brazil' })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`BRAPI: erro ao buscar IPCA (${res.status})`)
  const data = await res.json()
  return data.inflation?.[0]?.value ?? 0
}

/**
 * Calcula posição atualizada de uma carteira
 * @param holdings Array de { ticker, quantity, avgPrice }
 */
export async function calcPortfolio(
  holdings: { ticker: string; quantity: number; avgPrice: number }[]
) {
  const tickers = holdings.map(h => h.ticker)
  const quotes = await getQuotes(tickers)

  return holdings.map(holding => {
    const quote = quotes.find(q => q.symbol === holding.ticker)
    const currentPrice = quote?.regularMarketPrice ?? holding.avgPrice
    const totalInvested = holding.quantity * holding.avgPrice
    const currentValue = holding.quantity * currentPrice
    const gainLoss = currentValue - totalInvested
    const gainLossPct = (gainLoss / totalInvested) * 100

    return {
      ticker: holding.ticker,
      name: quote?.shortName ?? holding.ticker,
      quantity: holding.quantity,
      avgPrice: holding.avgPrice,
      currentPrice,
      totalInvested,
      currentValue,
      gainLoss,
      gainLossPct,
      dailyChangePct: quote?.regularMarketChangePercent ?? 0,
    }
  })
}
