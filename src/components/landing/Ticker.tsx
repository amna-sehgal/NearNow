'use client';
import { TICKER_ITEMS } from '@/lib/data';

export default function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="overflow-hidden border-y"
      style={{ borderColor: '#2A2A30', background: '#141416' }}
    >
      <div
        className="flex gap-0 py-2.5"
        style={{
          animation: 'ticker 28s linear infinite',
          width: 'max-content',
        }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-6 px-6">
            <span className="font-mono text-xs" style={{ color: '#7A7A8C' }}>
              {item}
            </span>
            <span style={{ color: '#2A2A30' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
