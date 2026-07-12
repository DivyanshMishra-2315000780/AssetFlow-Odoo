import { useState } from "react";
import { Plus, Search, Filter, ClipboardCheck, AlertCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/core/DataTable";
import { StatusBadge } from "@/components/ui/core/StatusBadge";

const MOCK_AUDITS = [
  { id: "1", name: "Q4 HQ IT Equipment Audit", scope: "IT Dept / HQ", assignedTo: "James Park", status: "In Progress", discrepancies: 2, dueDate: "Nov 01, 2023" },
  { id: "2", name: "Annual Furniture Inventory", scope: "All Departments", assignedTo: "Meera Patel", status: "Pending", discrepancies: 0, dueDate: "Nov 15, 2023" },
  { id: "3", name: "Vehicles Compliance Check", scope: "Logistics", assignedTo: "Carlos Rivera", status: "Completed", discrepancies: 1, dueDate: "Oct 10, 2023" },
];

export default function AuditsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const columns: DataTableColumn<any>[] = [
    { 
      key: "name", 
      header: "Audit Cycle Name", 
      cell: (row) => (
        <div>
          <p className="font-bold text-foreground">{row.name}</p>
          <p className="text-xs font-medium text-muted-foreground">{row.scope}</p>
        </div>
      )
    },
    { key: "assignedTo", header: "Lead Auditor", className: "font-medium" },
    { key: "dueDate", header: "Due Date", className: "font-medium text-sm" },
    { 
      key: "status", 
      header: "Status", 
      cell: (row) => <StatusBadge status={row.status} variant={row.status === 'Completed' ? 'success' : row.status === 'In Progress' ? 'warning' : 'default'} /> 
    },
    {
      key: "discrepancies",
      header: "Discrepancies",
      cell: (row) => (
        row.discrepancies > 0 ? (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded-full text-xs font-bold w-fit">
            <AlertCircle className="w-3 h-3" /> {row.discrepancies} Found
          </span>
        ) : (
          <span className="text-xs text-muted-foreground font-medium">None</span>
        )
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        row.status === 'Completed' ? (
          <button className="text-xs font-bold bg-white border-2 border-border px-3 py-1.5 rounded-full hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all">View Report</button>
        ) : (
          <button className="text-xs font-bold bg-primary border-2 border-border px-3 py-1.5 rounded-full hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all">Start Audit</button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground">Asset Audits</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Run structured verification cycles and generate discrepancy reports.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary border-2 border-border text-foreground px-6 py-3 rounded-full text-sm font-bold hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 transition-all w-fit">
          <Plus className="w-4 h-4 stroke-[3]" /> Create Audit Cycle
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search audits..." 
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
          data={MOCK_AUDITS}
          keyField="id"
          emptyMessage="No audits found."
        />
      </div>
    </div>
  );
}
