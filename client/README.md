# Frontend Application

This folder contains the frontend for the AssetFlow system, recently updated with the **Granger Landing Page**.

## What's Inside

- **Granger Landing Page**: A fully responsive, modern UI implemented exactly to specification. Found in `src/pages/LandingPage.tsx`. It acts as the root (`/`) route.
- **AssetFlow Dashboard**: The original protected features are now accessible under `/dashboard` (and other related feature routes like `/assets`, etc. if you are authenticated).
- **Axios Configuration**: In `src/lib/api.ts`, we maintain a pre-configured `axios` instance designed to handle authentication headers and API base URLs smoothly.

## Development

First, make sure you have the dependencies installed:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Visit the output local URL (usually `http://localhost:5173`) to view the Granger landing page!
