'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface TickerItem {
  ticker: string
  company: string
  insider: string
  role: string
  type: 'buy' | 'sell'
  value: string
  time: string
}

const tickerData: TickerItem[] = [
  { ticker: 'AAPL', company: 'Apple Inc.', insider: 'Tim Cook', role: 'CEO', type: 'buy', value: '$2.4M', time: '2m ago' },
  { ticker: 'NVDA', company: 'NVIDIA Corp.', insider: 'Jensen Huang', role: 'CEO', type: 'sell', value: '$890K', time: '5m ago' },
  { ticker: 'MSFT', company: 'Microsoft', insider: 'Satya Nadella', role: 'CEO', type: 'buy', value: '$1.2M', time: '12m ago' },
  { ticker: 'GOOGL', company: 'Alphabet', insider: 'Ruth Porat', role: 'CFO', type: 'sell', value: '$3.1M', time: '18m ago' },
  { ticker: 'TSLA', company: 'Tesla Inc.', insider: 'Robyn Denholm', role: 'Chair', type: 'buy', value: '$5.6M', time: '24m ago' },
  { ticker: 'META', company: 'Meta Platforms', insider: 'Mark Zuckerberg', role: 'CEO', type: 'sell', value: '$450K', time: '31m ago' },
  { ticker: 'AMZN', company: 'Amazon', insider: 'Andy Jassy', role: 'CEO', type: 'buy', value: '$780K', time: '42m ago' },
  { ticker: 'JPM', company: 'JPMorgan Chase', insider: 'Jamie Dimon', role: 'CEO', type: 'buy', value: '$1.8M', time: '55m ago' },
  { ticker: 'V', company: 'Visa Inc.', insider: 'Ryan McInerney', role: 'CEO', type: 'sell', value: '$620K', time: '1h ago' },
  { ticker: 'JNJ', company: 'Johnson & Johnson', insider: 'Joaquin Duato', role: 'CEO', type: 'buy', value: '$340K', time: '1h ago' },
  { ticker: 'WMT', company: 'Walmart', insider: 'Doug McMillon', role: 'CEO', type: 'buy', value: '$2.1M', time: '2h ago' },
  { ticker: 'PG', company: 'Procter & Gamble', insider: 'Jon Moeller', role: 'CEO', type: 'sell', value: '$890K', time: '2h ago' },
]

/**
 * Ticker Tape Component
 * Horizontally scrolling insider transaction feed
 * Pauses on hover for readability
 */
export function TickerTape() {
  // Duplicate items for seamless infinite scroll
  const items = [...tickerData, ...tickerData]

  return (
    <section className="bg-[#F5F5F5] border-y border-[#E5E5E5] py-4 overflow-hidden" aria-label="Live insider trading ticker">
      <div className="relative">
        {/* Live indicator */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 bg-[#F5F5F5] pr-4">
          <div className="relative flex items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00C853]" />
            <span className="absolute h-2.5 w-2.5 rounded-full bg-[#00C853] animate-ping opacity-75" />
          </div>
          <span className="text-xs font-semibold text-[#171717] uppercase tracking-wide">Live</span>
        </div>

        {/* Gradient masks for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F5F5F5] to-transparent z-[5] pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F5F5F5] to-transparent z-[5] pointer-events-none" />

        {/* Scrolling track */}
        <div className="ticker-track pl-20">
          {items.map((item, index) => (
            <TickerItem key={`${item.ticker}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TickerItem({ item }: { item: TickerItem }) {
  const isBuy = item.type === 'buy'

  return (
    <div className="flex-shrink-0 flex items-center gap-3 bg-white border border-[#E5E5E5] rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
      {/* Transaction type badge */}
      <div
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
          isBuy
            ? 'bg-[rgba(0,200,83,0.12)] text-[#00C853]'
            : 'bg-[rgba(255,82,82,0.12)] text-[#FF5252]'
        }`}
      >
        {isBuy ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {isBuy ? 'BUY' : 'SELL'}
      </div>

      {/* Ticker and company */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-[#171717]">{item.ticker}</span>
        <span className="text-[#737373] text-sm hidden sm:inline">{item.company}</span>
      </div>

      {/* Divider */}
      <span className="text-[#E5E5E5]">|</span>

      {/* Insider info */}
      <div className="text-sm">
        <span className="text-[#525252]">{item.insider}</span>
        <span className="text-[#737373]"> ({item.role})</span>
      </div>

      {/* Value */}
      <span className={`font-mono font-semibold ${isBuy ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
        {item.value}
      </span>

      {/* Time */}
      <span className="text-xs text-[#737373]">{item.time}</span>
    </div>
  )
}
