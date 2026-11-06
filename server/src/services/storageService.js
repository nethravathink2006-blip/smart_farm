import { facilities } from '../seed/demoData.js';
export function findStorage({cropCode,district,quantityQuintals=0}) {
  return facilities.filter(f=>f.supportedCropCodes.includes(cropCode) && f.availableCapacityQuintals>=Number(quantityQuintals) && (!district || f.district.toLowerCase()===district.toLowerCase()) && ['DEMO_AVAILABLE','LIVE_AVAILABLE'].includes(f.availabilityStatus)).map(({...facility})=>facility);
}
