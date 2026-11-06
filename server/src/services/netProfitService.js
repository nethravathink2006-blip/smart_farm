export function calculateNet(input) {
  const q = Number(input.quantityQuintals), price = Number(input.modalPricePerQuintal);
  if (!Number.isFinite(q) || q <= 0) throw new Error('quantityQuintals must be greater than zero');
  if (!Number.isFinite(price) || price < 0) throw new Error('modalPricePerQuintal must be zero or greater');
  const percent = Number(input.expectedSpoilagePercent ?? 0), rate = Number(input.commissionRatePercent ?? 0);
  if (percent < 0 || percent > 100) throw new Error('expectedSpoilagePercent must be between 0 and 100');
  if (rate < 0 || rate > 25) throw new Error('commissionRatePercent must be between 0 and 25');
  const costs = ['transportCostTotal','loadingCostTotal','unloadingCostTotal','otherExpensesTotal'];
  for (const key of costs) if (input[key] != null && (!Number.isFinite(Number(input[key])) || Number(input[key]) < 0)) throw new Error(`${key} must be zero or greater`);
  if (input.commissionCostTotal != null && input.commissionRatePercent != null) throw new Error('Provide commissionCostTotal or commissionRatePercent, not both');
  const grossValue = q * price, saleableQuantity = q * (1 - percent / 100), saleValueAfterSpoilage = saleableQuantity * price;
  const commissionCost = input.commissionCostTotal != null ? Number(input.commissionCostTotal) : saleValueAfterSpoilage * rate / 100;
  const deductions = ['transportCostTotal','loadingCostTotal','unloadingCostTotal','otherExpensesTotal'].reduce((sum,key)=>sum+Number(input[key] || 0),commissionCost);
  return {grossValue:round(grossValue),saleableQuantity:round(saleableQuantity,3),saleValueAfterSpoilage:round(saleValueAfterSpoilage),commissionCost:round(commissionCost),totalDeductions:round(deductions+(grossValue-saleValueAfterSpoilage)),estimatedNetAmount:round(saleValueAfterSpoilage-deductions),currency:'INR',unit:'quintal',isEstimate:true};
}
function round(value, digits=2) { return Number(value.toFixed(digits)); }
