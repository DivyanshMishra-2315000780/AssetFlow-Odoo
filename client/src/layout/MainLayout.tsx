import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  ArrowRightLeft,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Building2,
  LogOut,
  ChevronRight,
  Bell
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Box },
  { name: "Allocations", href: "/allocations", icon: ArrowRightLeft },
  { name: "Bookings", href: "/bookings", icon: CalendarClock },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Audits", href: "/audits", icon: ClipboardCheck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Organization", href: "/organization", icon: Building2 },
];

export function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "AF";

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans selection:bg-primary selection:text-foreground">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r-2 border-border flex flex-col flex-shrink-0 z-20 shadow-[4px_0px_0px_0px_rgba(17,17,17,0.05)]">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b-2 border-border gap-4 bg-primary/20">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center border-2 border-border shadow-sm flex-shrink-0">
            <Box className="w-5 h-5 text-foreground stroke-[3]" />
          </div>
          <div>
            <p className="font-black text-lg leading-tight">AssetFlow</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enterprise ERP</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-bold group border-2 ${
                  isActive
                    ? "bg-primary border-border text-foreground shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] translate-x-1"
                    : "bg-transparent border-transparent text-muted-foreground hover:border-border hover:bg-white hover:text-foreground hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]"
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'stroke-[3]' : 'stroke-[2.5]'}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 stroke-[3]" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t-2 border-border bg-muted/20">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl border-2 border-transparent hover:border-border hover:bg-white hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all group">
            <div className="w-10 h-10 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-foreground font-black text-sm flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.name ?? "Admin User"}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">{user?.role ?? "System Admin"}</p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl border-2 border-transparent hover:border-red-600 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f9f5f0]">
        {/* Topbar */}
        <header className="h-20 border-b-2 border-border bg-white flex items-center justify-between px-10 flex-shrink-0 relative z-10">
          <div>
             {/* Decorative pill */}
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 text-foreground text-[10px] font-black uppercase tracking-wider border-2 border-border mb-1">
                Workspace
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-12 h-12 flex items-center justify-center bg-white border-2 border-border rounded-full hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all">
              <Bell className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
