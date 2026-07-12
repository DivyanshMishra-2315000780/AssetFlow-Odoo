import { useState } from "react";
import { ArrowRightLeft, Search, Filter, Box, AlertTriangle, ArrowDownToLine } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/core/DataTable";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import { MockModal } from "@/components/ui/core/MockModal";

const MOCK_ALLOCATIONS = [
  { id: "1", assetTag: "AF-0114", assetName: "MacBook Pro M2", assignedTo: "Priya Singh", role: "Employee", assignedDate: "2023-10-01", expectedReturn: "2024-10-01", status: "Active" },
  { id: "2", assetTag: "AF-0142", assetName: "Dell XPS 15", assignedTo: "Raj Patel", role: "Manager", assignedDate: "2023-09-15", expectedReturn: "2023-10-24", status: "Overdue" },
  { id: "3", assetTag: "AF-0088", assetName: "Canon EOS R5", assignedTo: "Marketing Dept", role: "Department", assignedDate: "2023-10-20", expectedReturn: "2023-11-20", status: "Transfer Requested" },
];

export default function AllocationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    alert("Asset Allocated successfully! (Mock)");
  };

  const columns: DataTableColumn<any>[] = [
    { 
      key: "asset", 
      header: "Asset", 
      cell: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.assetName}</p>
          <span className="font-black bg-secondary px-2 py-0.5 rounded-full border border-border text-[10px] mt-1 inline-block">{row.assetTag}</span>
        </div>
      )
    },
    { 
      key: "assignedTo", 
      header: "Assigned To", 
      cell: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.assignedTo}</p>
          <p className="text-xs font-medium text-muted-foreground">{row.role}</p>
        </div>
      )
    },
    { 
      key: "dates", 
      header: "Timeline", 
      cell: (row) => (
        <div className="text-sm">
          <p><span className="text-muted-foreground">From:</span> <span className="font-medium">{row.assignedDate}</span></p>
          <p><span className="text-muted-foreground">Until:</span> <span className={`font-medium ${row.status === 'Overdue' ? 'text-red-600 font-bold' : ''}`}>{row.expectedReturn}</span></p>
        </div>
      ) 
    },
    { 
      key: "status", 
      header: "Status", 
      cell: (row) => {
        if (row.status === 'Overdue') return <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3"/> Overdue</span>;
        if (row.status === 'Transfer Requested') return <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded-full text-xs font-bold w-fit">Transfer Requested</span>;
        return <StatusBadge status={row.status} variant="success" />;
      }
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Transfer Requested' ? (
             <button className="flex items-center gap-1 text-[10px] bg-primary border-2 border-border px-2 py-1 rounded-full font-bold hover:shadow-sm">
               Review Transfer
             </button>
          ) : (
            <>
              <button className="p-2 bg-white border-2 border-border hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] rounded-full text-foreground transition-all" title="Request Transfer">
                <ArrowRightLeft className="w-3 h-3 stroke-[3]" />
              </button>
              <button className="p-2 bg-white border-2 border-border hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] rounded-full text-foreground transition-all" title="Process Return">
                <ArrowDownToLine className="w-3 h-3 stroke-[3]" />
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
          <h2 className="text-3xl font-black text-foreground">Asset Allocations</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Manage who holds what, process transfers, and track returns.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary border-2 border-border text-foreground px-6 py-3 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all w-fit">
          <Box className="w-4 h-4 stroke-[3]" /> Allocate Asset
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search allocations by Asset or Person..." 
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
          data={MOCK_ALLOCATIONS}
          keyField="id"
          emptyMessage="No active allocations found."
        />
      </div>

      <MockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Asset">
        <form onSubmit={handleModalSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold mb-1">Select Asset</label>
            <select className="w-full border-2 border-border rounded-xl p-2 bg-white focus:outline-none focus:border-primary">
              <option>Dell XPS 15 (AF-0142)</option>
              <option>Projector B (AF-0055)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Assign To (Employee / Dept)</label>
            <input type="text" required className="w-full border-2 border-border rounded-xl p-2 focus:outline-none focus:border-primary" placeholder="Search employee..." />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Expected Return Date</label>
            <input type="date" required className="w-full border-2 border-border rounded-xl p-2 focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" className="w-full bg-primary text-foreground border-2 border-border font-bold py-3 rounded-full shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all">
            Confirm Allocation
          </button>
        </form>
      </MockModal>
    </div>
  );
}
