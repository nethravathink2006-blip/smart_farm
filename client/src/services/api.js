const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
async function request(path, options) {
  try { const response = await fetch(`${BASE}${path}`, options); const data = await response.json(); if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`); return data; }
  catch (error) { return { error: error.message || 'API unavailable' }; }
}
export const api = {
  crops: () => request('/crops'),
  prices: (cropCode, district = '') => request(`/prices?cropCode=${encodeURIComponent(cropCode)}&state=Karnataka${district ? `&district=${encodeURIComponent(district)}` : ''}`),
  storage: (cropCode, district) => request(`/storage?cropCode=${cropCode}&district=${encodeURIComponent(district || '')}`),
  matches: (cropCode, destinationMarketId) => request(`/transport/matches?cropCode=${encodeURIComponent(cropCode)}&destinationMarketId=${encodeURIComponent(destinationMarketId)}`),
  recommendation: body => request('/recommendation/sell-or-wait', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  joinTransport: (groupId, details) => request(`/transport/groups/${encodeURIComponent(groupId)}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(details) }),
  profit: body => request('/profit/calculate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
};
