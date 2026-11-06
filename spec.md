Spec Sheet — RaithaMitra Voice Assistant
Finding the Right Market and Price for Farm Produce
Project type: Hackathon MVP
Stack: MERN (MongoDB, Express.js, React, Node.js)
Primary users: Small farmers and farmer groups
Initial geography: Karnataka, India (make state/district/market configurable)
Primary language for demo: Kannada (kn-IN), with English fallback
Data modes: DEMO (seeded mock data) and LIVE (official market-price source)
1. Product vision
Build a farmer-friendly web application with a simple Kannada voice assistant that helps a farmer:
1. Select a crop from 10 predefined options.
2. See reported prices for that crop across nearby/selected markets.
3. Compare the estimated net amount after transport, loading/unloading, commission, other costs and expected spoilage.
4. Decide whether selling now or waiting briefly is worth considering.
5. Find other farmers shipping the same crop to the same market and coordinate shared transport.
6. If shared transport is unavailable, check listed storage facilities and compare storage costs with the possible benefit of waiting.
The application is a decision-support tool, not a guarantee of a future price or a replacement for a local agricultural officer or market-yard confirmation.
2. Hackathon MVP scope
Must-have
- 10 selectable crops.
- Farmer input: quantity in quintals, location, crop and preferred language.
- Market price comparison using minimum, maximum and modal price.
- Show source and price-report date/time on every price result.
- Net-profit calculator for each destination market.
- Sell-now / consider-wait / insufficient-data recommendation with reasons.
- Farmers Together shared-transport matching.
- Storage fallback when no suitable shared vehicle is available.
- Kannada voice commands for a small set of predefined intents.
- Demo mode with clearly labelled mock data.
- React frontend connected to Express API.
Not required for the first demo
- Real payments, vehicle booking, driver tracking or guaranteed transport.
- Automatic sale of produce.
- Unverified AI price prediction.
- Production-grade speech recognition for every Kannada dialect.
- A claim that mock data is live government data.
3. Crop selector — 10 options
Use these 10 options in the initial selector. Store a stable cropCode, display name and supported unit.
Code	English	Kannada	Unit
TOMATO	Tomato	ಟೊಮೇಟೊ	quintal
ONION	Onion	ಈರುಳ್ಳಿ	quintal
POTATO	Potato	ಆಲೂಗಡ್ಡೆ	quintal
MAIZE	Maize	ಮೆಕ್ಕೆಜೋಳ	quintal
PADDY	Paddy	ಭತ್ತ	quintal
RAGI	Ragi	ರಾಗಿ	quintal
COTTON	Cotton	ಹತ್ತಿ	quintal
CHILLI	Green chilli	ಹಸಿಮೆಣಸಿನಕಾಯಿ	quintal
BRINJAL	Brinjal	ಬದನೆಕಾಯಿ	quintal
TUR	Tur / Pigeon pea	ತೊಗರಿ	quintal


The list is a UI shortlist, not a statement that every crop is available in every mandi. The backend must match crop names/codes to the commodity names actually present in the official source.
4. User journey
1. Farmer opens the app and chooses Kannada or English.
2. Farmer taps the microphone or uses the crop selector.
3. Farmer selects a crop, enters quantity and chooses their district/nearest market area.
4. Backend fetches market records from the configured price provider.
5. App shows the available markets, reported modal price, report date, estimated travel cost and estimated net amount.
6. Farmer opens a market comparison and sees the assumptions used in the calculation.
7. App checks whether other farmers have compatible produce and the same destination.
8. If a suitable shared-transport group exists, show the group proposal and estimated per-farmer transport share.
9. If no suitable vehicle/group is available, show listed storage facilities (if any), estimated cost and a cautious sell/wait comparison.
10. Farmer makes the final decision. The app never sells or books anything automatically.
5. Screens and UI requirements
A. Home
- App name: RaithaMitra (working name).
- Kannada / English language toggle.
- Large microphone button: “ಮಾತನಾಡಿ” / “Speak”.
- Large “Select Crop” button.
- Demo data banner when DATA_MODE=DEMO.
B. Crop and quantity
- 10 crop cards/dropdown.
- Quantity input in quintals.
- Farmer location: state, district and optional village.
- Destination preference: “Show nearby markets” or choose a district/market.
- Validate quantity > 0.
C. Market comparison
Each market card displays:
- Market and district.
- Crop and variety, if available.
- Minimum, maximum and modal price (₹/quintal).
- Market report date.
- Source name and data mode.
- Estimated distance / travel cost (only if configured; otherwise show “not available”).
- Estimated gross value and net amount.
- A label such as “Highest estimated net amount”, not simply “highest price”.
D. Net profit breakdown
Show the values separately:
- Gross crop value.
- Transportation.
- Loading.
- Unloading.
- Market commission.
- Other expenses.
- Expected spoilage loss.
- Estimated net amount.
Allow the farmer to edit cost assumptions. Clearly distinguish user-entered values from estimated defaults.
E. Sell now or wait
Display:
- Current reported modal price.
- Historical trend window and number of records.
- Trend label: Increasing / Stable / Decreasing / Insufficient data.
- Crop perishability: High / Medium / Low (editable crop profile).
- Storage cost and availability.
- Recommendation and a short explanation.
- “No reliable recommendation” if price history or cost inputs are insufficient.
F. Farmers Together — Shared Transport
- List compatible farmer requests.
- Match only when crop compatibility, destination and pickup area are acceptable.
- Show total quantity, estimated vehicle capacity requirement and estimated cost split.
- Show group status: Forming / Capacity matched / Vehicle lead needed / Closed.
- Do not expose personal phone numbers publicly. Use an in-app contact request or masked contact flow in a real deployment.
- Ask each farmer to confirm before treating the group as committed.
G. Storage fallback
- Show storage facilities only if there is a verified listing or an explicitly labelled demo listing.
- Show distance, capacity, crop suitability, daily/weekly cost, available capacity and last verification date.
- Do not imply a facility has space unless its availability was recently confirmed.
- Compare estimated storage expense with the uncertain possible price change.
- If no facility data exists, say “No verified storage listing available”.
6. Net-profit calculation
All price and quantity calculations use ₹ per quintal and quintals.
Inputs
- quantityQuintals
- modalPricePerQuintal
- transportCostTotal
- loadingCostTotal
- unloadingCostTotal
- commissionRatePercent OR commissionCostTotal (never apply both)
- otherExpensesTotal
- expectedSpoilagePercent
Formula
grossValue = quantityQuintals * modalPricePerQuintal

spoilageQuantity = quantityQuintals * (expectedSpoilagePercent / 100)
saleableQuantity = quantityQuintals - spoilageQuantity

saleValueAfterSpoilage = saleableQuantity * modalPricePerQuintal

commissionCost =
  commissionCostTotal, if explicitly entered
  otherwise saleValueAfterSpoilage * (commissionRatePercent / 100)

estimatedNetAmount =
  saleValueAfterSpoilage
  - transportCostTotal
  - loadingCostTotal
  - unloadingCostTotal
  - commissionCost
  - otherExpensesTotal
Display grossValue and estimatedNetAmount separately. The formula above treats spoilage as lost saleable quantity; do not subtract a second spoilage charge as well. If the farmer enters a spoilage cost directly instead, use that alternative method and do not reduce saleable quantity too.
Example (illustrative only)
- Quantity: 20 quintals
- Modal price: ₹2,000/quintal
- Expected spoilage: 2%
- Transport: ₹1,500
- Loading: ₹200
- Unloading: ₹200
- Commission: 1% of sale value after spoilage
- Other expenses: ₹100
Gross value = 20 * 2,000 = ₹40,000
Saleable quantity = 20 - (20 * 0.02) = 19.6 quintals
Sale value after spoilage = 19.6 * 2,000 = ₹39,200
Commission = 1% * 39,200 = ₹392
Estimated net = 39,200 - 1,500 - 200 - 200 - 392 - 100
              = ₹36,808
This is an estimate. Actual deductions, weighment, quality grading, taxes and buyer settlement may differ.
7. Market price data integration
Preferred source
Use the Government of India Open Government Data (OGD) Platform dataset:
- Dataset: Current Daily Price of Various Commodities from Various Markets (Mandi).
- Publisher: Directorate of Marketing & Inspection (DMI), Department of Agriculture and Farmers Welfare.
- Dataset page: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
- API documentation / access: use the dataset's “Data API” section on data.gov.in and obtain an API key if required.
- AGMARKNET portal: https://agmarknet.gov.in/
- e-NAM trading details: https://www.enam.gov.in/web/trading-details
The dataset reports market-level minimum, maximum and modal prices on a daily basis. It is not a tick-by-tick live quote. Show the actual report date returned by the source and label the data “latest reported market data”.
Provider design
Create a provider interface so the application is not tied to one upstream API:
// server/src/services/priceProviders/priceProvider.js
export async function getMarketPrices(filters) {
  throw new Error("Not implemented");
}
Implement:
- MockPriceProvider — reads seeded mock records from MongoDB.
- DataGovPriceProvider — calls the official OGD API using a server-side API key.
- Optional AgmarknetProvider — only after the team verifies the official access method and permitted usage.
Do not scrape pages or depend on undocumented endpoints for the production path. If an endpoint is unavailable, rate-limited or its terms do not permit the intended use, fall back to a clearly labelled unavailable state or demo mode.
API key handling
- Store DATA_GOV_API_KEY only in the backend .env.
- Never put API keys in React code, GitHub, screenshots or spec.md.
- Add .env to .gitignore.
- Provide .env.example with placeholder values only.
- Rotate any key that has accidentally been committed or shared.
Price record normalization
Normalize upstream responses into:
{
  "cropCode": "TOMATO",
  "commodityName": "Tomato",
  "variety": "Local",
  "state": "Karnataka",
  "district": "Example District",
  "market": "Example APMC",
  "arrivalDate": "2026-11-05",
  "minPrice": 1500,
  "maxPrice": 2400,
  "modalPrice": 2000,
  "unit": "₹/quintal",
  "source": "data.gov.in / AGMARKNET",
  "dataMode": "LIVE",
  "fetchedAt": "2026-11-05T10:00:00.000Z"
}
Use the source's actual field names and values. The example above is schema illustration, not a real price quote.
Freshness rules
- Show arrivalDate and fetchedAt.
- If the source record is older than the configured freshness threshold, display “Older report — confirm with market”.
- Never replace a missing price with zero.
- Never label mock data as live.
- Keep source metadata for every record.
- Cache upstream responses briefly to reduce repeated calls; do not make up updated timestamps when serving cached data.
8. Sell Now or Wait? — Smart Selling Assistant
MVP decision logic (rule-based, explainable)
Avoid presenting a made-up exact future price. Use recent observed prices and clear rules.

Inputs:
- Current modal price.
- Historical daily/weekly modal-price observations for the same crop and market.
- Number of observations and date range.
- Recent price movement.
- Crop perishability.
- Storage availability and storage cost.
- Estimated net amount for selling now.
- Estimated net amount after storage, using a scenario range rather than a guaranteed forecast.
Suggested initial rules:
1. If current price is missing/stale or there are too few historical records: INSUFFICIENT_DATA.
2. If crop perishability is high and verified storage is unavailable: lean toward SELL_SOON only as a caution, and explain the reason; do not claim certainty.
3. If trend is decreasing and storage costs are material: CONSIDER_SELLING_NOW.
4. If trend is increasing, crop is less perishable, and verified storage is available at a reasonable cost: CONSIDER_WAITING_BRIEFLY.
5. If trend is stable or signals conflict: MONITOR_AND_RECHECK.
6. If estimated net proceeds after storage are lower than selling now under the same price assumption: do not recommend waiting on financial grounds.
Trend calculation
For the hackathon, use:
- Compare the average of the latest 3 available observations with the previous 3 observations.
- Require at least 6 valid observations.
- Compute percentage change and classify using configurable thresholds, for example:
  - above +3%: Increasing
  - below -3%: Decreasing
  - otherwise: Stable
- If observations are not comparable (different units, varieties or markets), do not combine them.
Output contract
{
  "decision": "MONITOR_AND_RECHECK",
  "confidence": "LOW",
  "reasons": [
    "Only a small number of recent price observations are available.",
    "Storage availability has not been verified."
  ],
  "currentNetAmount": 36808,
  "waitScenario": null,
  "disclaimer": "This is an estimate, not a guaranteed future price."
}
Use HIGH, MEDIUM, LOW confidence only as a measure of data completeness and rule agreement—not as a probability of earning more.
9. Farmers Together — Shared Transport
Farmer transport request
{
  "farmerId": "demo-farmer-a",
  "cropCode": "TOMATO",
  "quantityQuintals": 5,
  "pickupDistrict": "Example District",
  "pickupArea": "Example Village",
  "destinationMarketId": "example-apmc",
  "readyDate": "2026-11-06",
  "maxPickupDetourKm": 10,
  "status": "OPEN"
}
Matching conditions
A request can be considered compatible when:
- Crop and variety/quality requirements are compatible.
- Destination market is the same.
- Pickup points are within the configured detour range.
- Ready dates overlap.
- Combined quantity is within the capacity range of a listed vehicle.
- Each farmer has confirmed the proposed group.
Example:
- Farmer A: 5 quintals of tomatoes.
- Farmer B: 8 quintals of tomatoes.
- Farmer C: 7 quintals of tomatoes.
- Same destination market.
- Combined quantity: 20 quintals.
The system can propose a shared-transport group if a suitable vehicle capacity and a transport-cost estimate are available. Do not assume a 20-quintal vehicle exists; vehicle capacity must come from a verified vehicle listing or demo fixture.
Cost split
MVP default: split the estimated vehicle cost in proportion to each farmer's quantity.
farmerShare = totalVehicleCost * (farmerQuantity / totalGroupQuantity)
Show the calculation and allow an agreed alternative split in a later version.
No vehicle found
- Show “No suitable shared vehicle found yet”.
- Allow the group to remain open for more farmers.
- Offer storage lookup as a separate fallback.
- Do not automatically move produce, book a vehicle or promise a driver.
10. Storage facility module
Storage record:
{
  "name": "Demo Cold Storage",
  "district": "Example District",
  "locationText": "Example area",
  "supportedCropCodes": ["TOMATO", "BRINJAL"],
  "capacityQuintals": 100,
  "availableCapacityQuintals": 25,
  "costPerQuintalPerDay": 8,
  "availabilityStatus": "DEMO_AVAILABLE",
  "lastVerifiedAt": "2026-11-05T09:00:00.000Z",
  "dataMode": "DEMO"
}
Only show facilities that support the crop and have enough available capacity. In a real deployment, availability must be confirmed with the facility. If storage availability is unknown, treat it as unavailable for the recommendation calculation.
11. Kannada voice assistant
Hackathon approach
Use the browser Web Speech API where supported:
- SpeechRecognition / webkitSpeechRecognition with lang = "kn-IN".
- speechSynthesis for spoken responses where Kannada voice is available.
- Always provide visible text and tappable buttons as a fallback.
- Browser/device support and Kannada voice availability vary. If speech recognition is unavailable, show a message and keep the app fully usable by touch.
- Do not claim the assistant understands unrestricted Kannada. The MVP supports a small set of intents and phrase patterns.
Supported demo intents
Intent	Example Kannada phrase	Action
GET_PRICE	“ಟೊಮೇಟೊ ಬೆಲೆ ಎಷ್ಟು?”	Fetch tomato prices
SELECT_CROP	“ಈರುಳ್ಳಿ ಆಯ್ಕೆಮಾಡು”	Select onion
SET_QUANTITY	“ನನ್ನ ಬಳಿ 5 ಕ್ವಿಂಟಾಲ್ ಇದೆ”	Set quantity to 5
COMPARE_MARKETS	“ಯಾವ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಹೆಚ್ಚು ಬೆಲೆ ಇದೆ?”	Compare estimated net amounts
CALCULATE_NET	“ಖರ್ಚು ಕಡಿತ ಮಾಡಿ ಲಾಭ ಹೇಳಿ”	Show net calculator
SHARED_TRANSPORT	“ಸಾಮೂಹಿಕ ವಾಹನ ಇದೆಯಾ?”	Find compatible groups
STORAGE	“ಸಂಗ್ರಹಣೆ ಸೌಲಭ್ಯ ಇದೆಯಾ?”	Search storage listings
SELL_OR_WAIT	“ಈಗ ಮಾರಬೇಕಾ ಅಥವಾ ಕಾಯಬೇಕಾ?”	Run decision rules
HELP	“ನಾನು ಏನು ಕೇಳಬಹುದು?”	Speak supported commands


Also support a few English phrases for testing. Keep phrase matching in a separate module so phrases can be expanded without changing the price or calculation services.
Voice interaction flow
1. Farmer taps microphone.
2. Browser listens in Kannada.
3. Recognized text is shown on screen.
4. Intent parser maps the phrase to a known intent.
5. Frontend calls the corresponding backend endpoint.
6. Backend returns structured JSON.
7. Frontend displays the result and speaks a short Kannada summary.
8. If confidence is low or no phrase matches, ask the farmer to choose from visible buttons.
Suggested frontend files
client/src/
  components/VoiceAssistant.jsx
  services/speechRecognition.js
  services/intentParser.js
  services/api.js
  locales/kn.json
  locales/en.json
Voice safety
- Do not use voice recognition as the only way to enter quantity or confirm a group.
- Read back important values (crop, quantity, market) and require a tap confirmation before submitting.
- Never execute a sale, transport booking or storage booking from a voice phrase alone.
12. MERN architecture
React frontend
  ├── Home / Crop Selector
  ├── Market Comparison
  ├── Net Profit Calculator
  ├── Sell-or-Wait Panel
  ├── Shared Transport
  ├── Storage Search
  └── Kannada Voice Assistant
          |
          | HTTPS / JSON REST API
          v
Node.js + Express backend
  ├── routes/
  ├── controllers/
  ├── services/
  │    ├── priceProviders/
  │    ├── netProfitService.js
  │    ├── trendService.js
  │    ├── recommendationService.js
  │    ├── transportMatchingService.js
  │    └── storageService.js
  ├── models/
  ├── middleware/
  └── config/
          |
          v
MongoDB
  ├── Crop
  ├── MarketPrice
  ├── Farmer
  ├── TransportRequest
  ├── TransportGroup
  └── StorageFacility
13. Suggested project folder structure
raitha-mitra/
  client/
    src/
      components/
      pages/
      services/
      hooks/
      locales/
      App.jsx
      main.jsx
    .env.example
    package.json
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
        priceProviders/
      seed/
      utils/
      app.js
      server.js
    .env.example
    package.json
  spec.md
  README.md
  .gitignore
14. Backend API contract
Base URL in local development: http://localhost:5000/api
Method	Endpoint	Purpose
GET	/crops	Get 10 crop options
GET	/markets?state=Karnataka&district=...	Get available markets
GET	/prices?cropCode=TOMATO&state=Karnataka&district=...	Get market prices
POST	/profit/calculate	Calculate estimated net amount
POST	/recommendation/sell-or-wait	Generate explainable recommendation
POST	/transport/requests	Create farmer transport request
GET	/transport/matches?cropCode=TOMATO&destinationMarketId=...	Find compatible groups
POST	/transport/groups/:id/join	Request to join a group
POST	/transport/groups/:id/confirm	Confirm participation
GET	/storage?cropCode=TOMATO&district=...	Find storage listings
POST	/assistant/intent	Optional backend intent handling / command logging
GET	/health	Health check


Example request: calculate net
POST /api/profit/calculate
Content-Type: application/json
{
  "quantityQuintals": 20,
  "modalPricePerQuintal": 2000,
  "transportCostTotal": 1500,
  "loadingCostTotal": 200,
  "unloadingCostTotal": 200,
  "commissionRatePercent": 1,
  "otherExpensesTotal": 100,
  "expectedSpoilagePercent": 2
}
Example response
{
  "grossValue": 40000,
  "saleableQuantity": 19.6,
  "saleValueAfterSpoilage": 39200,
  "commissionCost": 392,
  "totalDeductions": 2392,
  "estimatedNetAmount": 36808,
  "currency": "INR",
  "unit": "quintal",
  "isEstimate": true
}
Example request: prices
GET /api/prices?cropCode=TOMATO&state=Karnataka&district=Example%20District
Example response
{
  "dataMode": "DEMO",
  "source": "Mock demo data",
  "reportDate": "2026-11-05",
  "prices": [
    {
      "marketId": "market-a",
      "market": "Demo APMC A",
      "district": "Example District",
      "minPrice": 1500,
      "maxPrice": 2400,
      "modalPrice": 2000,
      "unit": "INR_PER_QUINTAL"
    },
    {
      "marketId": "market-b",
      "market": "Demo APMC B",
      "district": "Nearby District",
      "minPrice": 1700,
      "maxPrice": 2600,
      "modalPrice": 2200,
      "unit": "INR_PER_QUINTAL"
    }
  ],
  "notice": "Illustrative mock prices. Not current market quotes."
}
15. MongoDB collections
Crop
{
  cropCode: String,
  nameEn: String,
  nameKn: String,
  unit: { type: String, default: "quintal" },
  perishability: { type: String, enum: ["HIGH", "MEDIUM", "LOW"] }
}
MarketPrice
{
  cropCode: String,
  commodityName: String,
  variety: String,
  state: String,
  district: String,
  marketId: String,
  market: String,
  arrivalDate: Date,
  minPrice: Number,
  maxPrice: Number,
  modalPrice: Number,
  source: String,
  dataMode: { type: String, enum: ["DEMO", "LIVE"] },
  fetchedAt: Date
}
TransportRequest
{
  farmerId: String,
  cropCode: String,
  quantityQuintals: Number,
  pickupDistrict: String,
  pickupArea: String,
  destinationMarketId: String,
  readyDate: Date,
  status: { type: String, enum: ["OPEN", "MATCHED", "CANCELLED"] }
}
TransportGroup
{
  cropCode: String,
  destinationMarketId: String,
  requestIds: [String],
  totalQuantityQuintals: Number,
  vehicleCapacityQuintals: Number,
  estimatedVehicleCost: Number,
  status: { type: String, enum: ["FORMING", "PROPOSED", "CONFIRMED", "CLOSED"] }
}
StorageFacility
{
  name: String,
  district: String,
  locationText: String,
  supportedCropCodes: [String],
  capacityQuintals: Number,
  availableCapacityQuintals: Number,
  costPerQuintalPerDay: Number,
  availabilityStatus: String,
  lastVerifiedAt: Date,
  dataMode: { type: String, enum: ["DEMO", "LIVE"] }
}
16. Mock data requirements
Seed the database with:
- 10 crop records.
- At least 3 demo markets.
- At least 3 dates of price observations per crop for a basic demo; 6 or more comparable observations are required before the trend rule can return a trend.
- At least 3 demo farmer transport requests for tomato (5, 8 and 7 quintals) going to the same destination.
- 1 demo vehicle record or vehicle capacity fixture.
- 2 demo storage facilities with different crop support and costs.
Every mock record must include dataMode: "DEMO". The frontend must show a persistent “DEMO DATA — NOT LIVE MARKET PRICE” label whenever any displayed price or facility comes from mock data.

Example mock prices for UI testing only:
- Tomato, Demo APMC A: modal ₹2,000/quintal.
- Tomato, Demo APMC B: modal ₹2,200/quintal.
- Onion, Demo APMC A: modal ₹1,800/quintal.
- Potato, Demo APMC C: modal ₹1,500/quintal.
These numbers are invented for interface testing and must never be described as current prices.
17. Environment variables
server/.env.example
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/raitha_mitra
CLIENT_ORIGIN=http://localhost:5173
DATA_MODE=DEMO
DATA_GOV_API_KEY=YOUR_DATA_GOV_API_KEY
client/.env.example
VITE_API_BASE_URL=http://localhost:5000/api
Never commit real .env files or API keys.
18. Error handling and validation
- Unknown crop code: HTTP 400.
- Quantity missing, zero or negative: HTTP 400.
- No price records: return an empty list and a helpful message, not a fabricated quote.
- Upstream data unavailable: return a service-unavailable message and optionally show clearly labelled demo data only if the user has selected demo mode.
- Stale record: include a freshness warning.
- Incompatible transport requests: do not create a match.
- Storage availability not confirmed: do not count it as available.
- Invalid or incomplete expense values: ask the user to correct them.
- Prevent negative spoilage percentage, commission percentage above the configured allowed range, and impossible capacities.
- Validate all backend inputs; frontend validation alone is insufficient.
19. Security and privacy
- Keep API keys on the server.
- Validate and sanitize request bodies.
- Add rate limiting to public endpoints.
- Use HTTPS in deployment.
- Do not collect Aadhaar, bank credentials, UPI PINs or OTPs.
- Collect only the minimum farmer contact/location data needed for coordination.
- Do not show private contact details to other users without consent.
- Add clear consent before creating a transport request or sharing location.
- Use role-based access if farmer accounts are added.
- Do not expose MongoDB connection strings or secrets in frontend bundles.
20. Testing checklist
Prices
- [ ] Select each of the 10 crops.
- [ ] Verify market, unit and report date.
- [ ] Verify no missing value is shown as ₹0.
- [ ] Verify demo/live labels are correct.
- [ ] Verify stale data warning.
Net profit
- [ ] Verify the ₹36,808 example above.
- [ ] Test 0 and negative quantities.
- [ ] Test 0% and 100% spoilage boundaries.
- [ ] Ensure commission is not deducted twice.
- [ ] Verify market comparisons use net amount, not gross price alone.
Sell / wait
- [ ] Fewer than 6 observations returns insufficient data.
- [ ] Increasing, stable and decreasing cases are tested.
- [ ] High perishability and no storage produces a cautious explanation.
- [ ] Recommendation includes reasons and disclaimer.
- [ ] No future price is presented as guaranteed.
Shared transport and storage
- [ ] 5 + 8 + 7 quintals gives 20 quintals total.
- [ ] Different destinations do not match.
- [ ] Incompatible dates do not match.
- [ ] Capacity mismatch does not produce a vehicle match.
- [ ] Each farmer must confirm.
- [ ] No vehicle result leads to storage lookup, not an automatic booking.
- [ ] Unverified storage availability is not treated as available.
Voice
- [ ] Kannada supported phrases map to the correct intents.
- [ ] Unknown phrase shows a fallback prompt.
- [ ] Recognized crop and quantity are read back for confirmation.
- [ ] Manual controls work when microphone access is denied.
- [ ] No sale/booking action can occur from voice alone.
21. Demo script (3–4 minutes)
1. Open the home page and switch to Kannada.
2. Tap the microphone and say: “ಟೊಮೇಟೊ ಬೆಲೆ ಎಷ್ಟು?”
3. Show the recognized phrase and tomato market results. Point out the DEMO DATA label.
4. Enter 20 quintals and open the net-profit calculator.
5. Show all deductions and the estimated net amount.
6. Open Sell Now or Wait and explain that the recommendation depends on recent observations, perishability and storage costs.
7. Show Farmer A (5), Farmer B (8) and Farmer C (7) with the same destination.
8. Show the 20-quintal shared-transport proposal and the proportional cost split.
9. Demonstrate the no-vehicle fallback and show demo storage options.
10. Finish by explaining that live prices will use the official OGD/AGMARKNET source and show their report dates.
22. Suggested build order
1. Create MERN folders, connect MongoDB and add /health.
2. Add crop seed data and the 10-crop selector.
3. Build MockPriceProvider, seed demo prices and connect /prices.
4. Build net-profit service and calculator UI.
5. Build market comparison cards.
6. Build trend and sell/wait rule service.
7. Build transport request matching and group UI.
8. Build storage listing and fallback UI.
9. Add Kannada phrase parser and browser speech recognition.
10. Add the official OGD API provider, test it, and switch to LIVE only after verification.
11. Run the testing checklist and rehearse the demo.
23. Acceptance criteria
The MVP is ready to demonstrate when:
- A user can select any of the 10 crops.
- The UI displays market prices with source, date and demo/live status.
- A user can enter quantity and see a transparent net calculation.
- Markets can be ranked by estimated net amount when sufficient cost/distance data exists.
- Sell/wait output includes reasons and can return insufficient data.
- Three compatible farmers can be grouped into a shared-transport proposal.
- The app offers storage lookup if no suitable vehicle is found.
- At least 6 predefined Kannada voice phrases work, with manual fallback.
- No mock data is represented as official/live data.
- No sale, booking or financial transaction occurs automatically.
References
- Government of India OGD dataset — Current Daily Price of Various Commodities from Various Markets (Mandi):
  https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
- Government of India OGD dataset — Variety-wise Daily Market Prices Data of Commodity:
  https://data.gov.in/resource/variety-wise-daily-market-prices-data-commodity
- AGMARKNET:
  https://agmarknet.gov.in/
- e-NAM trading details:
  https://www.enam.gov.in/web/trading-details
Implementation note: Check the current data.gov.in API instructions, access requirements, response schema, rate limits and usage terms before connecting. Do not assume a web page URL is itself a supported API endpoint.