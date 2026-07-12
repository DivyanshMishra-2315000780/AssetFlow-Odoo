import { useState } from "react";
import { Plus, Search, Filter, Box, Edit2, History } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/core/DataTable";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import { MockModal } from "@/components/ui/core/MockModal";

// ---- Mock Data matching requirements ----
const MOCK_ASSETS = [
  { id: "1", tag: "AF-0001", name: "Dell XPS 15", category: "Electronics", serial: "DX15-9982", condition: "Good", location: "HQ - IT Room", status: "Allocated", bookable: false },
  { id: "2", tag: "AF-0002", name: "Conference Room A", category: "Spaces", serial: "N/A", condition: "Excellent", location: "Floor 2", status: "Available", bookable: true },
  { id: "3", tag: "AF-0003", name: "Herman Miller Chair", category: "Furniture", serial: "HM-1234", condition: "Fair", location: "Floor 3", status: "Available", bookable: false },
  { id: "4", tag: "AF-0004", name: "Projector B", category: "Electronics", serial: "PR-992", condition: "Requires Maintenance", location: "HQ - Storage", status: "Under Maintenance", bookable: true },
];

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    alert("Asset Registered successfully! (Mock)");
  };

  const columns: DataTableColumn<any>[] = [
    { key: "tag", header: "Asset Tag", cell: (row) => <span className="font-black bg-secondary px-2 py-1 rounded-full border border-border text-xs">{row.tag}</span> },
    { 
      key: "name", 
      header: "Asset Details", 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-border flex items-center justify-center shadow-sm">
            <Box className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="font-bold text-foreground">{row.name}</p>
            <p className="text-xs font-medium text-muted-foreground">{row.category} • SN: {row.serial}</p>
          </div>
        </div>
      )
    },
    { key: "location", header: "Location", className: "font-medium" },
    { key: "condition", header: "Condition", className: "font-medium text-sm text-muted-foreground" },
    { key: "status", header: "Lifecycle Status", cell: (row) => <StatusBadge status={row.status} variant={row.status === 'Available' ? 'success' : row.status === 'Under Maintenance' ? 'destructive' : 'default'} /> },
    {
      key: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex items-center gap-2">
          <button className="p-2 bg-white border-2 border-border hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] rounded-full text-foreground transition-all" title="Edit">
            <Edit2 className="w-3 h-3 stroke-[3]" />
          </button>
          <button className="p-2 bg-white border-2 border-border hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] rounded-full text-foreground transition-all" title="View History">
            <History className="w-3 h-3 stroke-[3]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground">Asset Directory</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Register and track assets centrally.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary border-2 border-border text-foreground px-6 py-3 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all w-fit">
          <Plus className="w-4 h-4 stroke-[3]" /> Register Asset
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by Asset Tag, Name, Serial Number, or QR Code..." 
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
          data={MOCK_ASSETS}
          keyField="id"
          emptyMessage="No assets found matching your criteria."
        />
      </div>

      <MockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Asset">
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
    </div>
  );
}
