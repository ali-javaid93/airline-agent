// frontend/components/OfferCards.tsx
'use client';
import { useState } from 'react';

type RankedItem = {
  offer?: any;         // r.offer from backend
  score?: number;      // optional, from ranker
  qPerHKD?: number;    // optional, for status runs
  qpoints?: number;    // optional
  rationale?: string;  // we added this on the server
};

type Props = {
  items: RankedItem[];
  onHold: (offerId: string) => Promise<void>;
};

function minutesToHhMm(min?: number) {
  if (!min && min !== 0) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export default function OfferCards({ items, onHold }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!Array.isArray(items) || items.length === 0) {
    return <div style={{ marginTop: 16, color: '#666' }}>No offers found.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr', marginTop: 16 }}>
      {items.map((it, idx) => {
        const o = it.offer ?? it; // fallback if backend returns offer fields at top level
        const id: string | undefined = o?.id ?? o?.offerId ?? o?._id;
        const priceAmt = o?.price?.amount ?? o?.priceAmount ?? o?.amount;
        const priceCur = o?.price?.currency ?? o?.currency ?? 'HKD';
        const duration = o?.totalDurationMin ?? o?.durationMin;
        const carrier = o?.carrier ?? o?.airline ?? o?.marketingCarrier ?? 'Airline';
        const from = o?.origin ?? o?.from ?? o?.segments?.[0]?.origin ?? 'HKG';
        const to = o?.destination ?? o?.to ?? o?.segments?.slice(-1)?.[0]?.destination ?? 'LON';
        const weekend = o?.weekendFit ? 'Weekend fit' : '';

        return (
          <div
            key={id ?? `idx-${idx}`}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: 12,
              padding: 12,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: 10
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {from} → {to} · {carrier}
              </div>
              <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>
                Duration: {minutesToHhMm(duration)} {weekend && `· ${weekend}`}
              </div>
              {it.rationale && (
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  {it.rationale}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {priceCur} {priceAmt}
              </div>
              <button
                disabled={!id || busyId === id}
                onClick={async () => {
                  if (!id) return;
                  setBusyId(id);
                  try {
                    await onHold(id);
                  } finally {
                    setBusyId(null);
                  }
                }}
                style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #111',
                  background: busyId === id ? '#f3f3f3' : '#fff',
                  color: '#111',                                     // ← add this so text shows on white
                  cursor: !id ? 'not-allowed' : 'pointer',
                  opacity: !id ? 0.5 : 1                               // ← clearer disabled look 
                }}
                title={!id ? 'No offer ID provided by backend' : 'Hold this offer'}
              >
                {busyId === id ? 'Holding…' : 'Hold'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
