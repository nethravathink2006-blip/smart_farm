import { prices } from '../../seed/demoData.js';
export async function getMarketPrices(filters={}) {
  const valid = prices.filter(p => (!filters.cropCode || p.cropCode === filters.cropCode) && (!filters.state || p.state.toLowerCase() === filters.state.toLowerCase()) && (!filters.district || p.district.toLowerCase().includes(filters.district.toLowerCase())));
  const latest = new Map();
  for (const record of valid) { const key = `${record.marketId}:${record.cropCode}`; if (!latest.has(key) || latest.get(key).arrivalDate < record.arrivalDate) latest.set(key,record); }
  return [...latest.values()];
}
