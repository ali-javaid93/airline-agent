'use client';
import { useState } from 'react';
import OfferCards, { RankedItem, RankMode } from '../../components/OfferCards';

type Intent = {
  goal: string;
  origin: string;
  destinations: string[];
  date_window: { start: string; end: string };
  trip_length_days?: { min: number; max: number };
  budget_currency?: string;
  budget_max?: number;
  weekend_only?: boolean;
  cabin_pref?: string;
};

type Output = Intent | RankedItem[] | { error: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function IntentTester() {
  const [prompt, setPrompt] = useState(
    'Find me economy tickets from Hong Kong to London, budget max 10000 HKD'
  );
  const [intent, setIntent] = useState<Intent | null>(null);
  const [out, setOut] = useState<Output | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<RankMode>('cheapest');
  const [holdMsg, setHoldMsg] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  async function doParse() {
    setLoading(true);
    setOut(null);
    setHoldMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = (await res.json()) as Intent;
      setIntent(data);
      setOut(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOut({ error: msg });
    } finally {
      setLoading(false);
    }
  }

  async function doSearch() {
    if (!intent) return;
    setLoading(true);
    setHoldMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, mode })
      });
      const data = (await res.json()) as RankedItem[];
      setOut(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOut({ error: msg });
    } finally {
      setLoading(false);
    }
  }

  async function onHold(offerId: string) {
    setHoldMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId })
      });
      const data = (await res.json()) as { status: string; offerId: string; next: string };
      setHoldMsg(`✅ ${data.status} · Offer ${data.offerId} · ${data.next}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setHoldMsg(`❌ Hold failed: ${msg}`);
    }
  }

  const offers = Array.isArray(out) ? (out as RankedItem[]) : null;

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 8 }}>Flight Intent Tester</h2>
      <p style={{ color: '#555', marginBottom: 16 }}>
        Backend: <code>{API_BASE}</code>
      </p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr auto auto auto', alignItems: 'center' }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ padding: 10, fontSize: 16 }}
          placeholder="Describe your trip…"
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as RankMode)}
          style={{ padding: 10, fontSize: 14 }}
          title="Rank mode"
        >
          <option value="cheapest">Cheapest</option>
          <option value="shortest">Shortest</option>
          <option value="qpoints_per_hkd">Qpoints per HKD</option>
          <option value="weekend">Weekend</option>
        </select>
        <button onClick={doParse} disabled={loading} style={{ padding: '10px 14px' }}>
          {loading ? 'Parsing…' : 'Parse'}
        </button>
        <button onClick={doSearch} disabled={!intent || loading} style={{ padding: '10px 14px' }}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {offers && (
        <>
          <OfferCards items={offers} onHold={onHold} />
          {holdMsg && <div style={{ marginTop: 12, fontSize: 14 }}>{holdMsg}</div>}
        </>
      )}

      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
        <input
          type="checkbox"
          checked={showRaw}
          onChange={(e) => setShowRaw(e.target.checked)}
        />
        Show raw JSON
      </label>

      {showRaw && (
        <div style={{ marginTop: 16 }}>
          <pre
            style={{
              background: '#111',
              color: '#0f0',
              padding: 16,
              borderRadius: 8,
              minHeight: 180,
              overflowX: 'auto'
            }}
          >
            {out ? JSON.stringify(out, null, 2) : 'No output yet…'}
          </pre>
        </div>
      )}
    </div>
  );
}
