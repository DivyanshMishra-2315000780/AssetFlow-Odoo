# Granger Landing Page & AssetFlow Dashboard

This project contains two primary modules on the frontend:
1. **Granger Landing Page**: A visually rich, redesigned landing page available at the root (`/`). It uses Tailwind CSS and Axios for fetching API data (simulated with mock data in `src/pages/LandingPage.tsx`).
2. **AssetFlow Dashboard**: The internal dashboard module, accessible by navigating to `/dashboard` (which requires authentication/setup).

## Frontend Technology Stack
- **React 19**
- **Vite**
- **Tailwind CSS**
- **Axios**: Configured in `client/src/lib/api.ts` to handle API requests and interceptors.
- **Lucide React**: For icons on the Granger landing page.

## Running the Application
To run the frontend:
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` to see the new Granger UI!
