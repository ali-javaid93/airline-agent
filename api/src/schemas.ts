import { z } from 'zod';

export const IntentSchema = z.object({
  goal: z.enum(['cheapest','status_run','weekend_getaway','shortest']).default('cheapest'),
  origin: z.string().length(3),
  destinations: z.array(z.string().length(3)).optional(),
  date_window: z.object({
    start: z.string(), // ISO date like "2025-10-05"
    end: z.string()
  }),
  trip_length_days: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive()
  }).optional(),
  budget_currency: z.string().default('HKD'),
  budget_max: z.number().optional(),
  weekend_only: z.boolean().optional(),
  passport: z.string().optional(),
  visas_allowed: z.array(z.string()).optional(),
  codeshare_ok: z.boolean().default(true),
  cabin_pref: z.enum(['ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST']).default('ECONOMY'),
  notes: z.string().optional()
});

export type Intent = z.infer<typeof IntentSchema>;

export const SegmentSchema = z.object({
  from: z.string().length(3),
  to: z.string().length(3),
  dep: z.string(), // ISO datetime like "2025-10-12T19:40:00"
  arr: z.string(),
  carrier: z.string().length(2),
  flightNo: z.string(),
  cabin: z.enum(['ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST']),
  distanceKm: z.number().optional()
});

export const OfferSchema = z.object({
  id: z.string(),
  price: z.object({ amount: z.number(), currency: z.string() }),
  itinerary: z.array(SegmentSchema),
  totalDurationMin: z.number(),
  stops: z.number(),
  weekendFit: z.boolean().optional(),
  notes: z.string().optional()
});

export type Offer = z.infer<typeof OfferSchema>;
