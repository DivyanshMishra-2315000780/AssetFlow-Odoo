import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Box, 
  ArrowRightLeft, 
  CalendarClock, 
  Wrench, 
  ClipboardCheck,
  BarChart3,
  Bell
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Box },
  { name: "Allocations", href: "/allocations", icon: ArrowRightLeft },
  { name: "Bookings", href: "/bookings", icon: CalendarClock },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Audits", href: "/audits", icon: ClipboardCheck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Box className="w-6 h-6 text-primary mr-2" />
          <span className="font-semibold text-lg tracking-tight">AssetFlow</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                             (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              JD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold text-foreground">
            {navigation.find(n => location.pathname === n.href || (n.href !== "/" && location.pathname.startsWith(n.href)))?.name || "Dashboard"}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
