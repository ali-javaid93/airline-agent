'use client';
import { useState } from 'react';

export type RankMode = 'cheapest' | 'shortest' | 'qpoints_per_hkd' | 'weekend';

export type Money = { amount: number; currency: string };

export type Segment = {
  origin: string;
  destination: string;
  carrier?: string;
  marketingCarrier?: string;
  flightNumber?: string;
  depart?: string;
  arrive?: string;
  durationMin?: number;
};

export type Offer = {
  id?: string;
  offerId?: string;
  _id?: string;
  price?: Money;
  priceAmount?: number;
  currency?: string;
  totalDurationMin?: number;
  durationMin?: number;
  carrier?: string;
  airline?: string;
  marketingCarrier?: string;
  origin?: string;
  from?: string;
  destination?: string;
  to?: string;
  segments?: Segment[];
  weekendFit?: boolean;
};

export type RankedItem = {
  offer?: Offer;      // normal case: data nested under 'offer'
  score?: number;
  qPerHKD?: number;
  qpoints?: number;
  rationale?: string;
  // allow unknown extras without using 'any'
  [key: string]: unknown;
};

type Props = {
  items: RankedItem[];
  onHold: (offerId: string) => Promise<void>;
};

function minutesToHhMm(min?: number) {
  if (min == null) return '';
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
        const o = (it.offer ?? (it as unknown)) as Offer; // tolerate flat or nested
        const id: string | undefined = o?.id ?? o?.offerId ?? o?._id;
        const priceAmt = o?.price?.amount ?? o?.priceAmount;
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
              {typeof it.rationale === 'string' && it.rationale.length > 0 && (
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
                  color: '#111',
                  cursor: !id ? 'not-allowed' : 'pointer',
                  opacity: !id ? 0.5 : 1
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
