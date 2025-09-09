import { Offer } from "./schemas";
import { estimateQpoints, qpointsPerHKD } from "./qpoints";

export type RankMode = 'cheapest' | 'shortest' | 'qpoints_per_hkd' | 'weekend';

export function rankOffers(offers: Offer[], mode: RankMode) {
  const enriched = offers.map(o => ({
    offer: o,
    qpoints: estimateQpoints(o),
    qPerHKD: qpointsPerHKD(o)
  }));

  switch (mode) {
    case 'cheapest':
      return enriched.sort((a,b) => a.offer.price.amount - b.offer.price.amount);
    case 'shortest':
      return enriched.sort((a,b) => a.offer.totalDurationMin - b.offer.totalDurationMin);
    case 'qpoints_per_hkd':
      return enriched.sort((a,b) => b.qPerHKD - a.qPerHKD);
    case 'weekend':
      return enriched.sort((a,b) => Number(b.offer.weekendFit) - Number(a.offer.weekendFit));
  }
}
