import { Offer } from './schemas';

/**
 * Mock offers for Scenario 1 (HKG ⇄ London, economy).
 * Dates/prices are illustrative. You can add/remove later.
 */
export const mockOffersHKG_LON: Offer[] = [
  {
    id: 'QR-HKG-DOH-LHR-01',
    price: { amount: 7800, currency: 'HKD' },
    itinerary: [
      { from: 'HKG', to: 'DOH', dep: '2025-10-12T19:40:00', arr: '2025-10-13T00:40:00', carrier: 'QR', flightNo: '817', cabin: 'ECONOMY' },
      { from: 'DOH', to: 'LHR', dep: '2025-10-13T02:20:00', arr: '2025-10-13T06:50:00', carrier: 'QR', flightNo: '7',   cabin: 'ECONOMY' }
    ],
    totalDurationMin: 19 * 60,
    stops: 1,
    weekendFit: false
  },
  {
    id: 'QR-HKG-DOH-LGW-02',
    price: { amount: 9400, currency: 'HKD' },
    itinerary: [
      { from: 'HKG', to: 'DOH', dep: '2025-11-07T20:30:00', arr: '2025-11-08T01:35:00', carrier: 'QR', flightNo: '815', cabin: 'ECONOMY' },
      { from: 'DOH', to: 'LGW', dep: '2025-11-08T03:10:00', arr: '2025-11-08T07:35:00', carrier: 'QR', flightNo: '329', cabin: 'ECONOMY' }
    ],
    totalDurationMin: 18 * 60,
    stops: 1,
    weekendFit: true
  }
];

/**
 * Mock offers for Scenario 2 (status run — maximize Qpoints/HKD).
 * HKG ⇄ DOH ⇄ RUH as a weekend hop, illustrative values.
 */
export const mockOffersStatusRun: Offer[] = [
  {
    id: 'QR-HKG-DOH-RUH-01',
    price: { amount: 4680, currency: 'HKD' },
    itinerary: [
      { from: 'HKG', to: 'DOH', dep: '2025-09-12T19:40:00', arr: '2025-09-13T00:40:00', carrier: 'QR', flightNo: '817',  cabin: 'ECONOMY' },
      { from: 'DOH', to: 'RUH', dep: '2025-09-13T02:20:00', arr: '2025-09-13T03:40:00', carrier: 'QR', flightNo: '1168', cabin: 'ECONOMY' },
      { from: 'RUH', to: 'DOH', dep: '2025-09-14T20:30:00', arr: '2025-09-14T21:50:00', carrier: 'QR', flightNo: '1169', cabin: 'ECONOMY' },
      { from: 'DOH', to: 'HKG', dep: '2025-09-14T23:55:00', arr: '2025-09-15T12:50:00', carrier: 'QR', flightNo: '818',  cabin: 'ECONOMY' }
    ],
    totalDurationMin: 48 * 60,
    stops: 3,
    weekendFit: true
  }
];
