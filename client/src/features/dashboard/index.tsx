import { useAuth } from "@/features/auth/context/AuthContext";
import { Box, ArrowRightLeft, CalendarClock, Wrench, ClipboardCheck, TrendingUp, Users, Activity } from "lucide-react";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import type { DashboardStats } from "@/types";

// Mock stats until backend is wired up
const MOCK_STATS: DashboardStats = {
  totalAssets: 248,
  assetsInUse: 187,
  assetsInMaintenance: 12,
  activeBookings: 34,
  pendingAudits: 5,
};

const MOCK_RECENT_ACTIVITY = [
  { id: 1, event: "MacBook Pro M3 assigned to Sarah Lee", time: "2 min ago", type: "Allocation" },
  { id: 2, event: "Dell Monitor flagged for maintenance", time: "15 min ago", type: "Maintenance" },
  { id: 3, event: "Conference Room A booked by Design Team", time: "1 hr ago", type: "Booking" },
  { id: 4, event: "Annual audit completed for Floor 2", time: "3 hr ago", type: "Audit" },
  { id: 5, event: "iPhone 15 Pro added to inventory", time: "5 hr ago", type: "Asset Added" },
];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  change?: string;
}

function StatCard({ title, value, icon: Icon, color, change }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start justify-between hover:shadow-md transition-all duration-200 group">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {change && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            {change}
          </p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = MOCK_STATS;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's what's happening with your assets today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-600">System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={stats.totalAssets}
          icon={Box}
          color="bg-blue-500/10 text-blue-600"
          change="+3 this week"
        />
        <StatCard
          title="Assets In Use"
          value={stats.assetsInUse}
          icon={Users}
          color="bg-violet-500/10 text-violet-600"
          change={`${Math.round((stats.assetsInUse / stats.totalAssets) * 100)}% utilization`}
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings}
          icon={CalendarClock}
          color="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          title="In Maintenance"
          value={stats.assetsInMaintenance}
          icon={Wrench}
          color="bg-rose-500/10 text-rose-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Asset Utilization</p>
            <span className="text-sm font-semibold text-foreground">
              {Math.round((stats.assetsInUse / stats.totalAssets) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-700"
              style={{ width: `${(stats.assetsInUse / stats.totalAssets) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Audits</p>
            <p className="text-2xl font-bold text-foreground">{stats.pendingAudits}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Assets</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalAssets - stats.assetsInUse - stats.assetsInMaintenance}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">Recent Activity</h3>
          <StatusBadge status="Live" variant="success" />
        </div>
        <div className="divide-y divide-border/50">
          {MOCK_RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground">{item.event}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
              <StatusBadge status={item.type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
