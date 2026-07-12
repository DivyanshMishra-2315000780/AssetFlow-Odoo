import { useState } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Box, CalendarClock, Wrench, ArrowRightLeft, Users, AlertTriangle, Plus, CalendarPlus, AlertCircle, Star } from "lucide-react";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import { MockModal } from "@/components/ui/core/MockModal";
import type { DashboardStats } from "@/types";

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
  bgColor: string;
}

function StatCard({ title, value, icon: Icon, bgColor }: StatCardProps) {
  return (
    <div className="bg-white border-2 border-border rounded-2xl p-5 flex items-start justify-between shadow-[2px_2px_0px_0px_rgba(17,17,17,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-1 transition-all duration-200">
      <div>
        <p className="text-sm font-bold text-muted-foreground">{title}</p>
        <p className="text-3xl font-black text-foreground mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full border-2 border-border ${bgColor} flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-foreground" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const stats = MOCK_STATS;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveModal(null);
    alert("Action submitted successfully! (Mock)");
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12 relative">
      <Star className="absolute -top-4 right-20 text-primary w-8 h-8 rotate-12 stroke-[2] fill-current opacity-50 pointer-events-none" />

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-secondary/30 p-8 rounded-[32px] border-2 border-border relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-foreground">
            {greeting}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
          </h2>
          <p className="text-sm text-foreground/80 mt-2 font-medium max-w-sm">
            Here's a real-time operational snapshot of your assets and resources today.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 relative z-10">
          <button onClick={() => setActiveModal('register')} className="flex items-center gap-2 bg-primary text-foreground border-2 border-border px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 stroke-[3]" /> Register Asset
          </button>
          <button onClick={() => setActiveModal('book')} className="flex items-center gap-2 bg-white text-foreground border-2 border-border px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all">
            <CalendarPlus className="w-4 h-4 stroke-[3] text-blue-500" /> Book Resource
          </button>
          <button onClick={() => setActiveModal('maintenance')} className="flex items-center gap-2 bg-white text-foreground border-2 border-border px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all">
            <Wrench className="w-4 h-4 stroke-[3] text-orange-500" /> Raise Maintenance
          </button>
        </div>
        
        {/* Abstract Deco */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Overdue Returns Alert Section */}
      {MOCK_OVERDUE.length > 0 && (
        <div className="bg-white border-2 border-border rounded-[24px] p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-2 h-full bg-red-400"></div>
           <div className="flex items-center gap-3 text-red-600 font-black mb-6 pl-4">
             <AlertTriangle className="w-6 h-6 stroke-[3]" />
             <h3 className="text-xl">Action Required: Overdue Returns ({MOCK_OVERDUE.length})</h3>
           </div>
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pl-4">
             {MOCK_OVERDUE.map((item) => (
               <div key={item.id} className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex justify-between items-start">
                 <div>
                   <p className="font-bold text-sm text-foreground">{item.asset}</p>
                   <p className="text-xs text-muted-foreground mt-1 font-medium">Assigned to: {item.assignedTo}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-black uppercase text-white bg-red-500 px-2 py-1 rounded-full border border-red-700">Past Due</p>
                   <p className="text-[10px] text-red-600 font-bold mt-2">{item.expectedReturn}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Assets Available" value={stats.assetsAvailable} icon={Box} bgColor="bg-[#b4f0b4]" />
        <StatCard title="Assets Allocated" value={stats.assetsAllocated} icon={Users} bgColor="bg-accent" />
        <StatCard title="Maintenance Today" value={stats.maintenanceToday} icon={Wrench} bgColor="bg-[#ffc8a2]" />
        <StatCard title="Active Bookings" value={stats.activeBookings} icon={CalendarClock} bgColor="bg-secondary" />
        <StatCard title="Pending Transfers" value={stats.pendingTransfers} icon={ArrowRightLeft} bgColor="bg-[#ffe1a8]" />
        <StatCard title="Upcoming Returns" value={stats.upcomingReturns} icon={AlertCircle} bgColor="bg-[#e2e8f0]" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white border-2 border-border rounded-[24px] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b-2 border-border flex items-center justify-between bg-muted/30">
          <h3 className="font-black text-foreground text-lg">Activity Log</h3>
        </div>
        <div className="divide-y-2 divide-border">
          {MOCK_RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 border border-border" />
                <div>
                  <p className="font-bold text-foreground">{item.event}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1">{item.time}</p>
                </div>
              </div>
              <StatusBadge status={item.type} />
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <MockModal isOpen={activeModal === 'register'} onClose={() => setActiveModal(null)} title="Register New Asset">
        <form onSubmit={handleModalSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold mb-1">Asset Name</label>
            <input type="text" required className="w-full border-2 border-border rounded-xl p-2 focus:outline-none focus:border-primary" placeholder="e.g. MacBook Pro M2" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Category</label>
            <select className="w-full border-2 border-border rounded-xl p-2 bg-white focus:outline-none focus:border-primary">
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Vehicles</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-foreground text-background font-bold py-3 rounded-full hover:bg-gray-800 transition-colors">
            Register Asset
          </button>
        </form>
      </MockModal>

      <MockModal isOpen={activeModal === 'book'} onClose={() => setActiveModal(null)} title="Book Resource">
        <form onSubmit={handleModalSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold mb-1">Select Resource</label>
            <select className="w-full border-2 border-border rounded-xl p-2 bg-white focus:outline-none focus:border-primary">
              <option>Conference Room A</option>
              <option>Studio 1</option>
              <option>Company Van</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Date</label>
              <input type="date" required className="w-full border-2 border-border rounded-xl p-2 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Time</label>
              <input type="time" required className="w-full border-2 border-border rounded-xl p-2 focus:outline-none focus:border-primary" />
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-foreground border-2 border-border font-bold py-3 rounded-full shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all">
            Confirm Booking
          </button>
        </form>
      </MockModal>

      <MockModal isOpen={activeModal === 'maintenance'} onClose={() => setActiveModal(null)} title="Raise Maintenance Request">
        <form onSubmit={handleModalSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold mb-1">Select Asset</label>
            <select className="w-full border-2 border-border rounded-xl p-2 bg-white focus:outline-none focus:border-primary">
              <option>Projector B (AF-0055)</option>
              <option>Dell XPS 15 (AF-0142)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Issue Description</label>
            <textarea required rows={3} className="w-full border-2 border-border rounded-xl p-2 focus:outline-none focus:border-primary" placeholder="Describe the problem..."></textarea>
          </div>
          <button type="submit" className="w-full bg-red-100 text-red-700 border-2 border-red-200 font-bold py-3 rounded-full hover:bg-red-200 transition-colors">
            Submit Request
          </button>
        </form>
      </MockModal>
    </div>
  );
}
