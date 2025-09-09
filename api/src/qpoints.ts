import { Offer } from "./schemas";

/**
 * SUPER-SIMPLE demo model (MVP):
 * - ECONOMY:            0.25 Qpoints per 100 km
 * - PREMIUM_ECONOMY:    0.35 per 100 km
 * - BUSINESS:           0.60 per 100 km
 * - FIRST:              0.80 per 100 km
 *
 * If a segment doesn't have distanceKm, we approximate by route.
 * This is only for demo comparison, not real QRPC earning logic.
 */

const ratePer100Km: Record<string, number> = {
  ECONOMY: 0.25,
  PREMIUM_ECONOMY: 0.35,
  BUSINESS: 0.6,
  FIRST: 0.8
};

const approxDistance = (from: string, to: string) => {
  const key = `${from}-${to}`;
  const table: Record<string, number> = {
    "HKG-DOH": 6300, "DOH-HKG": 6300,
    "DOH-LHR": 5200, "LHR-DOH": 5200,
    "DOH-LGW": 5160, "LGW-DOH": 5160,
    "DOH-RUH": 490,  "RUH-DOH": 490
  };
  return table[key] ?? 2000; // fallback guess
};

export function estimateQpoints(offer: Offer) {
  let total = 0;
  for (const seg of offer.itinerary) {
    const km = seg.distanceKm ?? approxDistance(seg.from, seg.to);
    const rate = ratePer100Km[seg.cabin] ?? 0.25;
    total += (km / 100) * rate;
  }
  return Math.round(total);
}

export function qpointsPerHKD(offer: Offer) {
  const q = estimateQpoints(offer);
  return q / offer.price.amount;
}
