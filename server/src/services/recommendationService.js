export function analyzeTrend(observations, threshold=3) {
  const valid = [...observations].filter(item=>Number.isFinite(Number(item.modalPrice))).sort((a,b)=>new Date(a.arrivalDate)-new Date(b.arrivalDate));
  if (valid.length < 6) return {trend:'INSUFFICIENT_DATA',changePercent:null,observations:valid.length};
  const previous=valid.slice(-6,-3), recent=valid.slice(-3), avg=list=>list.reduce((sum,item)=>sum+Number(item.modalPrice),0)/list.length;
  const changePercent=(avg(recent)-avg(previous))/avg(previous)*100;
  return {trend:changePercent>threshold?'INCREASING':changePercent< -threshold?'DECREASING':'STABLE',changePercent:Number(changePercent.toFixed(2)),observations:valid.length};
}
export function forecastNextPrice(observations=[]) {
  const valid=[...observations].filter(item=>Number.isFinite(Number(item.modalPrice))&&Number.isFinite(new Date(item.arrivalDate).getTime())).sort((a,b)=>new Date(a.arrivalDate)-new Date(b.arrivalDate));
  if(valid.length<3)return {estimatedModalPrice:null,forecastDate:null,changePercent:null,observations:valid.length};
  const values=valid.map(item=>Number(item.modalPrice)),count=values.length,meanX=(count-1)/2,meanY=values.reduce((sum,value)=>sum+value,0)/count;
  const numerator=values.reduce((sum,value,index)=>sum+(index-meanX)*(value-meanY),0),denominator=values.reduce((sum,_value,index)=>sum+(index-meanX)**2,0);
  const slope=denominator?numerator/denominator:0,lastPrice=values[count-1],estimatedModalPrice=Math.max(0,Math.round(meanY+slope*(count-meanX)));
  const date=new Date(valid[count-1].arrivalDate);date.setUTCDate(date.getUTCDate()+1);
  return {estimatedModalPrice,forecastDate:date.toISOString().slice(0,10),changePercent:lastPrice?Number(((estimatedModalPrice-lastPrice)/lastPrice*100).toFixed(2)):null,observations:count,confidence:'LOW',method:'Linear estimate from recent demo observations'};
}
export function recommend({currentPrice,observations=[],perishability='MEDIUM',storageAvailable=false,storageCost=0,currentNetAmount=null,stale=false}) {
  const trend=analyzeTrend(observations), reasons=[]; let decision='MONITOR_AND_RECHECK',confidence='LOW',waitScenario=null;
  if (!Number.isFinite(Number(currentPrice)) || stale || trend.trend==='INSUFFICIENT_DATA') {
    decision='INSUFFICIENT_DATA'; reasons.push(stale?'The latest market report is stale.':'Fewer than six comparable price observations are available.');
    if (!storageAvailable) reasons.push('Storage availability has not been verified.');
  } else if (perishability==='HIGH' && !storageAvailable) {
    decision='CONSIDER_SELLING_NOW'; reasons.push('This crop is highly perishable and verified storage is unavailable.'); reasons.push('This is a cautious signal, not a certainty about future prices.'); confidence='MEDIUM';
  } else if (trend.trend==='DECREASING' && storageCost>0) {
    decision='CONSIDER_SELLING_NOW'; reasons.push('Recent comparable prices are decreasing and storage adds cost.'); confidence='MEDIUM';
  } else if (trend.trend==='INCREASING' && perishability==='LOW' && storageAvailable) {
    decision='CONSIDER_WAITING_BRIEFLY'; reasons.push('Recent prices increased and this less perishable crop has verified storage.');
    waitScenario={priceAssumption:'Current modal price held constant; no future increase assumed',storageCost:Number(storageCost),estimatedNetAmountAfterStorage:currentNetAmount==null?null:Number(currentNetAmount)-Number(storageCost)};
    if (currentNetAmount!=null && waitScenario.estimatedNetAmountAfterStorage<Number(currentNetAmount)) { decision='MONITOR_AND_RECHECK'; reasons.push('Under the same price assumption, storage costs reduce estimated net proceeds.'); waitScenario=null; }
    else confidence='MEDIUM';
  } else { reasons.push(trend.trend==='STABLE'?'Recent comparable prices are broadly stable.':'Price movement, crop perishability and storage signals do not all agree.'); reasons.push('Recheck the market before making a decision.'); }
  return {decision,confidence,reasons,trend,currentNetAmount,waitScenario,disclaimer:'This is an estimate, not a guaranteed future price.'};
}
