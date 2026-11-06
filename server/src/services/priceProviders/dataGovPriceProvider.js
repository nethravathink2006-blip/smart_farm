const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
export async function getMarketPrices(filters={}) {
  const key = process.env.DATA_GOV_API_KEY;
  if (!key) throw new Error('DATA_GOV_API_KEY is required for LIVE price mode');
  const params = new URLSearchParams({ 'api-key':key, format:'json', limit:'100', 'filters[state]':filters.state || 'Karnataka' });
  if (filters.district) params.set('filters[district]',filters.district);
  if (filters.commodityName) params.set('filters[commodity]',filters.commodityName);
  const response = await fetch(`https://api.data.gov.in/resource/${RESOURCE_ID}?${params}`);
  if (!response.ok) throw new Error(`OGD API returned ${response.status}`);
  const body = await response.json();
  return (body.records || []).map(record => ({
    cropCode:filters.cropCode, commodityName:record.commodity, variety:record.variety || null,
    state:record.state, district:record.district, marketId:`${record.state}-${record.district}-${record.market}`,
    market:record.market, arrivalDate:record.arrival_date, minPrice:numberOrNull(record.min_price),
    maxPrice:numberOrNull(record.max_price), modalPrice:numberOrNull(record.modal_price), unit:'INR_PER_QUINTAL',
    source:'data.gov.in / DMI',dataMode:'LIVE',fetchedAt:new Date().toISOString()
  })).filter(record=>record.modalPrice != null);
}
function numberOrNull(value) { const n=Number(value); return Number.isFinite(n) && value !== '' ? n : null; }
