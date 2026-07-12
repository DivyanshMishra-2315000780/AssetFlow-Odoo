import { useState } from "react";
import { Search, Filter, CalendarPlus, Clock, Ban, CalendarDays } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/core/DataTable";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import { MockModal } from "@/components/ui/core/MockModal";

const MOCK_BOOKINGS = [
  { id: "1", resourceName: "Conference Room A", requestedBy: "Design Team", date: "Oct 24, 2023", timeSlot: "09:00 - 10:00", status: "Ongoing" },
  { id: "2", resourceName: "Conference Room A", requestedBy: "Marketing", date: "Oct 24, 2023", timeSlot: "10:00 - 11:30", status: "Upcoming" },
  { id: "3", resourceName: "Projector B", requestedBy: "Sales", date: "Oct 25, 2023", timeSlot: "13:00 - 16:00", status: "Upcoming" },
  { id: "4", resourceName: "Studio 1", requestedBy: "Media Team", date: "Oct 22, 2023", timeSlot: "09:00 - 17:00", status: "Completed" },
  { id: "5", resourceName: "Company Van", requestedBy: "Logistics", date: "Oct 23, 2023", timeSlot: "08:00 - 12:00", status: "Cancelled" },
];

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    alert("Resource booked successfully! (Mock)");
  };

  const columns: DataTableColumn<any>[] = [
    { 
      key: "resource", 
      header: "Resource", 
      cell: (row) => <span className="font-bold text-foreground">{row.resourceName}</span>
    },
    { 
      key: "requestedBy", 
      header: "Requested By", 
      cell: (row) => <span className="font-medium text-muted-foreground">{row.requestedBy}</span>
    },
    { 
      key: "schedule", 
      header: "Schedule", 
      cell: (row) => (
        <div>
          <p className="font-bold text-sm text-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {row.date}</p>
          <p className="text-xs font-black bg-secondary px-2 py-0.5 rounded-full border border-border inline-block mt-1">{row.timeSlot}</p>
        </div>
      ) 
    },
    { 
      key: "status", 
      header: "Status", 
      cell: (row) => {
        let variant: 'default' | 'success' | 'destructive' | 'warning' = 'default';
        if (row.status === 'Ongoing') variant = 'success';
        if (row.status === 'Upcoming') variant = 'warning';
        if (row.status === 'Cancelled') variant = 'destructive';
        
        return <StatusBadge status={row.status} variant={variant} />;
      }
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Upcoming' && (
            <>
              <button className="p-2 bg-white border-2 border-border hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] rounded-full text-foreground transition-all" title="Reschedule">
                <Clock className="w-3 h-3 stroke-[3]" />
              </button>
              <button className="p-2 bg-white border-2 border-border hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:bg-red-50 rounded-full text-red-500 transition-all" title="Cancel">
                <Ban className="w-3 h-3 stroke-[3]" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground">Resource Bookings</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Time-slot booking of shared resources with overlap validation.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary border-2 border-border text-foreground px-6 py-3 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all w-fit">
          <CalendarPlus className="w-4 h-4 stroke-[3]" /> Book Resource
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            className="w-full bg-white border-2 border-border rounded-full pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary focus:border-border transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border-2 border-border px-6 py-3 rounded-full text-sm font-bold hover:bg-muted transition-colors">
          <Filter className="w-4 h-4 stroke-[3]" /> Filters
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white border-2 border-border rounded-[24px] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] overflow-hidden p-2">
        <DataTable
          columns={columns}
          data={MOCK_BOOKINGS}
          keyField="id"
          emptyMessage="No bookings found."
        />
      </div>

      <MockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book Resource">
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
    </div>
  );
}
