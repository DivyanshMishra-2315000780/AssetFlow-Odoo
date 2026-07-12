import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import AssetsPage from "@/features/assets";

// Dummy components for now, will replace with real features
const Dashboard = () => <div className="p-6 bg-card rounded-lg shadow-sm border border-border">Welcome to AssetFlow Dashboard</div>;
const AllocationsPage = () => <div className="p-6 bg-card rounded-lg shadow-sm border border-border">Allocations Module (To be implemented)</div>;
const BookingsPage = () => <div className="p-6 bg-card rounded-lg shadow-sm border border-border">Bookings Module (To be implemented)</div>;
const MaintenancePage = () => <div className="p-6 bg-card rounded-lg shadow-sm border border-border">Maintenance Module (To be implemented)</div>;
const AuditsPage = () => <div className="p-6 bg-card rounded-lg shadow-sm border border-border">Audits Module (To be implemented)</div>;
const ReportsPage = () => <div className="p-6 bg-card rounded-lg shadow-sm border border-border">Reports Module (To be implemented)</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "assets/*", element: <AssetsPage /> },
      { path: "allocations/*", element: <AllocationsPage /> },
      { path: "bookings/*", element: <BookingsPage /> },
      { path: "maintenance/*", element: <MaintenancePage /> },
      { path: "audits/*", element: <AuditsPage /> },
      { path: "reports/*", element: <ReportsPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
