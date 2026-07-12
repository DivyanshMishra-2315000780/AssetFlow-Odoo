import { useState } from "react";
import { Plus, Search, Filter, Wrench, CheckCircle2, Clock, Ban } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/core/DataTable";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import { MockModal } from "@/components/ui/core/MockModal";

const MOCK_MAINTENANCE = [
  { id: "1", ticket: "MNT-001", asset: "Projector B (AF-0055)", reportedBy: "Sarah Lee", issue: "Bulb blown out", priority: "High", status: "Pending", date: "Oct 24, 2023" },
  { id: "2", ticket: "MNT-002", asset: "Dell XPS 15 (AF-0142)", reportedBy: "Raj Patel", issue: "Battery swelling", priority: "Critical", status: "In Progress", date: "Oct 22, 2023" },
  { id: "3", ticket: "MNT-003", asset: "Conference Table (AF-0099)", reportedBy: "Operations", issue: "Wobbly leg", priority: "Low", status: "Resolved", date: "Oct 15, 2023" },
];

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    alert("Maintenance Request raised successfully! (Mock)");
  };

  const columns: DataTableColumn<any>[] = [
    { 
      key: "ticket", 
      header: "Ticket", 
      cell: (row) => <span className="font-black bg-primary/20 px-2 py-1 rounded-md border-2 border-border text-xs">{row.ticket}</span> 
    },
    { 
      key: "asset", 
      header: "Asset & Issue", 
      cell: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.asset}</p>
          <p className="text-xs font-medium text-muted-foreground line-clamp-1">{row.issue}</p>
        </div>
      )
    },
    { key: "reportedBy", header: "Reported By", className: "font-medium text-sm" },
    { 
      key: "priority", 
      header: "Priority", 
      cell: (row) => (
        <span className={`text-xs font-bold uppercase tracking-wider ${row.priority === 'Critical' ? 'text-red-600' : row.priority === 'High' ? 'text-orange-500' : 'text-gray-500'}`}>
          {row.priority}
        </span>
      )
    },
    { key: "status", header: "Workflow Stage", cell: (row) => <StatusBadge status={row.status} variant={row.status === 'Resolved' ? 'success' : row.status === 'In Progress' ? 'warning' : 'default'} /> },
    {
      key: "actions",
      header: "Admin Action",
      cell: (row) => {
        if (row.status === 'Pending') {
           return (
             <div className="flex gap-2">
               <button className="bg-green-100 text-green-700 border-2 border-green-200 px-3 py-1 rounded-full text-xs font-bold hover:shadow-sm">Approve</button>
               <button className="bg-red-100 text-red-700 border-2 border-red-200 px-3 py-1 rounded-full text-xs font-bold hover:shadow-sm">Reject</button>
             </div>
           );
        }
        return <span className="text-xs text-muted-foreground font-medium">No actions</span>;
      },
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground">Maintenance Routing</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Route repairs through approval before work starts.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary border-2 border-border text-foreground px-6 py-3 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all w-fit">
          <Wrench className="w-4 h-4 stroke-[3]" /> Raise Request
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tickets by Asset or Issue..." 
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
          data={MOCK_MAINTENANCE}
          keyField="id"
          emptyMessage="No maintenance tickets found."
        />
      </div>

      <MockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise Maintenance Request">
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
