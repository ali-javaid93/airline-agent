// src/routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { IntentSchema } from './schemas';
import { mockOffersHKG_LON, mockOffersStatusRun } from './mockOffers';
import { rankOffers } from './ranking';

export const router = Router();

console.log('Routes file loaded'); // temp debug

/**
 * /api/parse
 * MVP parser (no LLM yet). It reads the prompt and produces a valid Intent.
 */
const ParseBody = z.object({ prompt: z.string() });

router.post('/parse', (req, res) => {
  const parsed = ParseBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { prompt } = parsed.data;

  // naive detection for status run
  const isStatusRun = /qpoints|status|tier|gold/i.test(prompt);

  // find "XXXX HKD" style budget
  const budgetMatch = prompt.match(/(\d+(?:,\d+)*)\s*hk?d/i);
  const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, '')) : undefined;

  // rough demo date window
  const intent = {
    goal: isStatusRun ? 'status_run' : 'cheapest',
    origin: 'HKG',
    destinations: isStatusRun ? ['RUH'] : ['LHR', 'LGW'],
    date_window: { start: '2025-10-05', end: '2025-11-30' },
    trip_length_days: isStatusRun ? undefined : { min: 14, max: 21 },
    budget_currency: 'HKD',
    budget_max: budget,
    weekend_only: isStatusRun ? true : false,
    cabin_pref: 'ECONOMY'
  };

  const valid = IntentSchema.parse(intent);
  res.json(valid);
});

/**
 * /api/search
 * Takes a validated Intent + rank mode, returns top offers with rationale.
 */
const SearchBody = z.object({
  intent: IntentSchema,
  mode: z.enum(['cheapest', 'shortest', 'qpoints_per_hkd', 'weekend']).default('cheapest')
});

router.post('/search', (req, res) => {
  const parsed = SearchBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { intent, mode } = parsed.data;

  // choose dataset by goal
  const source = intent.goal === 'status_run' ? mockOffersStatusRun : mockOffersHKG_LON;

  // filter by budget if set
  const filtered = intent.budget_max
    ? source.filter(o => o.price.amount <= intent.budget_max!)
    : source;

  const ranked = (rankOffers(filtered, mode) || []).slice(0, 10).map(r => ({
    ...r,
    rationale: rationaleFor(r.offer, intent, mode, r.qPerHKD, r.qpoints)
  }));

  res.json(ranked);
});

function rationaleFor(
  offer: any,
  _intent: any,
  mode: string,
  qPerHKD: number,
  qpoints: number
) {
  if (mode === 'qpoints_per_hkd') return `Best Qpoints/HKD: ${qPerHKD.toFixed(3)} · Earns ~${qpoints} Qpoints`;
  if (mode === 'weekend') return offer.weekendFit ? 'Fits weekend pattern' : 'Near-weekend option';
  if (mode === 'shortest') return `Shortest duration: ${offer.totalDurationMin} min`;
  return `Cheapest in set: ${offer.price.amount} ${offer.price.currency}`;
}

/**
 * /api/hold
 * Mock “order create” to simulate booking handoff.
 */
const HoldBody = z.object({ offerId: z.string() });

router.post('/hold', (req, res) => {
  console.log('HIT /api/hold with body:', req.body);
  const parsed = HoldBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  res.json({
    status: 'HELD',
    offerId: parsed.data.offerId,
    next: 'Proceed to seat selection & payment (mock)'
  });
});

/**
 * /api/health
 * Simple liveness probe
 */
router.get('/health', (_req, res) => {
  res.json({ ok: true });
});
