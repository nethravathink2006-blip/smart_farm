# RaithaMitra

Problem description: Farmers may receive very different prices for the same produce depending on market, timing, and demand. Small farmers often lack easy access to reliable localized price information and may sell to the nearest buyer because they need immediate payment.

Helping farmers find better markets, better prices, and better profits through a digital assistant tailored for rural farmers.

RaithaMitra is a farmer focused market decision support demo for Karnataka. It compares reported mandi prices, shows a transparent net estimate, and provides cautious sell or wait, shared transport, storage, and Kannada voice experiences.

## Run locally

Requirements: Node.js 18+ and npm. MongoDB is optional for the current seeded demo; the API falls back to in-memory fixture data when MongoDB is unavailable.

From the project root, install the client and server dependencies once, then start both processes together:

```sh
cd server && npm install
cd ../client && npm install
cd .. && npm run dev
```

The API starts on port 5000 and the web app starts on port 5173. Keep that terminal open while using the app.

To run either part separately, use the commands below.

```sh
cd server
npm install
cp .env.example .env
npm run dev
```

In another terminal:

```sh
cd client
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL (normally http://localhost:5173). The API health endpoint is http://localhost:5000/api/health.

## Data modes

`DATA_MODE=DEMO` is the default. All fixture values are illustrative and are explicitly labelled demo data. To try the OGD provider, set `DATA_MODE=LIVE` and add a server side `DATA_GOV_API_KEY` to `server/.env`. Live access depends on the dataset API key, current API schema and usage terms. Records keep their source arrival date; the service does not turn mock prices into live prices.

## API

The Express API implements `/health`, `/crops`, `/markets`, `/prices`, `/profit/calculate`, `/recommendation/sell-or-wait`, `/transport/requests`, `/transport/matches`, `/transport/groups/:id/join`, `/transport/groups/:id/confirm`, `/storage`, and `/assistant/intent` under `/api`.

The demo API uses seeded fixture data. MongoDB connection is optional scaffolding for a persistent version; demo records are currently served from the seed module. No endpoint books a sale, vehicle, or storage.

## Notes

- Net proceeds use the spec's saleable-quantity method for spoilage and do not deduct a second spoilage fee.
- The mock price history supports trend calculations but has only six example daily observations per crop.
- Voice input uses the browser's built-in Web Speech APIs; no speech API key or extra package is needed.
- For voice input, open the app in Chrome or Edge at `http://localhost:5173` (or serve it over HTTPS), allow microphone access, then press **Speak**. Press it again to stop listening.
- Browser speech recognition may require an internet connection, and Kannada recognition or spoken voice availability depends on the browser and installed language support. The app's on-screen controls remain available if voice input is unsupported.
- All farmer, vehicle, price, and storage records in the fixtures are demo examples, not verified listings.
