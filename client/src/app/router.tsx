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

// Landing Page
import LandingPage from "@/pages/LandingPage";

import AllocationsPage from "@/features/allocations";
import BookingsPage from "@/features/bookings";
import MaintenancePage from "@/features/maintenance";
import AuditsPage from "@/features/audits";
import ReportsPage from "@/features/reports";

export const router = createBrowserRouter([
  // ---- Public Auth Routes ----
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
  
  // ---- Public Landing Route ----
  {
    path: "/",
    element: <LandingPage />,
  },

  // ---- Protected App Routes ----
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
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
