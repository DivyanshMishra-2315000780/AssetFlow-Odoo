import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import { AuthLayout } from "@/layout/AuthLayout";
import { ProtectedRoute } from "@/app/ProtectedRoute";

// Auth pages
import LoginPage from "@/features/auth/pages/Login";
import SignupPage from "@/features/auth/pages/Signup";

// Feature pages
import DashboardPage from "@/features/dashboard";
import AssetsPage from "@/features/assets";
import OrganizationPage from "@/features/organization";

// Placeholder pages (to be replaced)
const AllocationsPage = () => (
  <div className="p-8 rounded-xl bg-card border border-border text-center">
    <h2 className="text-lg font-semibold text-foreground mb-1">Allocations</h2>
    <p className="text-muted-foreground text-sm">Module coming soon…</p>
  </div>
);
const BookingsPage = () => (
  <div className="p-8 rounded-xl bg-card border border-border text-center">
    <h2 className="text-lg font-semibold text-foreground mb-1">Bookings</h2>
    <p className="text-muted-foreground text-sm">Module coming soon…</p>
  </div>
);
const MaintenancePage = () => (
  <div className="p-8 rounded-xl bg-card border border-border text-center">
    <h2 className="text-lg font-semibold text-foreground mb-1">Maintenance</h2>
    <p className="text-muted-foreground text-sm">Module coming soon…</p>
  </div>
);
const AuditsPage = () => (
  <div className="p-8 rounded-xl bg-card border border-border text-center">
    <h2 className="text-lg font-semibold text-foreground mb-1">Audits</h2>
    <p className="text-muted-foreground text-sm">Module coming soon…</p>
  </div>
);
const ReportsPage = () => (
  <div className="p-8 rounded-xl bg-card border border-border text-center">
    <h2 className="text-lg font-semibold text-foreground mb-1">Reports</h2>
    <p className="text-muted-foreground text-sm">Module coming soon…</p>
  </div>
);

export const router = createBrowserRouter([
  // ---- Public Auth Routes ----
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },

  // ---- Protected App Routes ----
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/assets", element: <AssetsPage /> },
          { path: "/allocations", element: <AllocationsPage /> },
          { path: "/bookings", element: <BookingsPage /> },
          { path: "/maintenance", element: <MaintenancePage /> },
          { path: "/audits", element: <AuditsPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/organization", element: <OrganizationPage /> },
        ],
      },
    ],
  },

  // Fallback redirect
  { path: "*", element: <Navigate to="/" replace /> },
]);
