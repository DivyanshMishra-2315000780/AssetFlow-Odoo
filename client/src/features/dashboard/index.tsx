import { useAuth } from "@/features/auth/context/AuthContext";
import { Box, CalendarClock, Wrench, ArrowRightLeft, Users, AlertTriangle, Plus, CalendarPlus, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import type { DashboardStats } from "@/types";

// Mock stats matching the new requirements
const MOCK_STATS = {
  assetsAvailable: 156,
  assetsAllocated: 89,
  maintenanceToday: 4,
  activeBookings: 12,
  pendingTransfers: 3,
  upcomingReturns: 8,
};

const MOCK_OVERDUE = [
  { id: 1, asset: "Dell XPS 15 (AF-0142)", assignedTo: "Raj Patel", expectedReturn: "2023-10-24" },
  { id: 2, asset: "Projector B (AF-0055)", assignedTo: "Marketing Dept", expectedReturn: "2023-10-25" },
];

const MOCK_RECENT_ACTIVITY = [
  { id: 1, event: "MacBook Pro assigned to Sarah Lee", time: "2 min ago", type: "Allocation" },
  { id: 2, event: "Conference Room A booked", time: "1 hr ago", type: "Booking" },
];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start justify-between hover:shadow-md transition-all duration-200">
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {greeting}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time operational snapshot of your assets and resources.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition shadow-sm">
            <Plus className="w-4 h-4" /> Register Asset
          </button>
          <button className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition shadow-sm">
            <CalendarPlus className="w-4 h-4 text-blue-500" /> Book Resource
          </button>
          <button className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition shadow-sm">
            <Wrench className="w-4 h-4 text-orange-500" /> Raise Maintenance
          </button>
        </div>
      </div>

      {/* Overdue Returns Alert Section */}
      {MOCK_OVERDUE.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
           <div className="flex items-center gap-2 text-red-700 font-semibold mb-4">
             <AlertTriangle className="w-5 h-5" />
             <h3 className="text-base">Overdue Returns ({MOCK_OVERDUE.length})</h3>
           </div>
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {MOCK_OVERDUE.map((item) => (
               <div key={item.id} className="bg-white border border-red-100 rounded-lg p-4 flex justify-between items-start">
                 <div>
                   <p className="font-semibold text-sm text-gray-900">{item.asset}</p>
                   <p className="text-xs text-gray-500 mt-1">Assigned to: {item.assignedTo}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Past Due</p>
                   <p className="text-[10px] text-gray-500 mt-1">{item.expectedReturn}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Assets Available"
          value={stats.assetsAvailable}
          icon={Box}
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          title="Assets Allocated"
          value={stats.assetsAllocated}
          icon={Users}
          color="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          title="Maintenance Today"
          value={stats.maintenanceToday}
          icon={Wrench}
          color="bg-orange-500/10 text-orange-600"
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings}
          icon={CalendarClock}
          color="bg-purple-500/10 text-purple-600"
        />
        <StatCard
          title="Pending Transfers"
          value={stats.pendingTransfers}
          icon={ArrowRightLeft}
          color="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          title="Upcoming Returns"
          value={stats.upcomingReturns}
          icon={AlertCircle}
          color="bg-slate-500/10 text-slate-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">Recent Activity Stream</h3>
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
