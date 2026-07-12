import { useState } from "react";
import { Plus, Building2, Tag, Users, ShieldAlert, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/core/DataTable";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import type { Department, Category, Employee } from "@/types";

type Tab = "departments" | "categories" | "employees";

// ---- Mock data matching requirements ----
const MOCK_DEPARTMENTS = [
  { id: "1", name: "Information Technology", head: "Sarah Lee", parent: "None", status: "Active", createdAt: "2023-01-15" },
  { id: "2", name: "Operations", head: "Meera Patel", parent: "None", status: "Active", createdAt: "2023-01-15" },
  { id: "3", name: "IT Support", head: "Unassigned", parent: "Information Technology", status: "Inactive", createdAt: "2023-02-01" },
];

const MOCK_CATEGORIES = [
  { id: "1", name: "Electronics", description: "Laptops, monitors", extraFields: "Warranty Period (Months)", assetCount: 98 },
  { id: "2", name: "Furniture", description: "Chairs, desks", extraFields: "None", assetCount: 64 },
  { id: "3", name: "Vehicles", description: "Company cars", extraFields: "License Plate, Mileage", assetCount: 12 },
];

const MOCK_EMPLOYEES = [
  { id: "1", name: "Sarah Lee", email: "sarah.lee@assetflow.com", role: "Department Head", departmentName: "IT", status: "Active", joinedAt: "2022-03-10" },
  { id: "2", name: "James Park", email: "james.park@assetflow.com", role: "Asset Manager", departmentName: "Finance", status: "Active", joinedAt: "2022-06-01" },
  { id: "3", name: "Meera Patel", email: "meera.patel@assetflow.com", role: "Employee", departmentName: "Operations", status: "Active", joinedAt: "2021-11-15" },
];

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("departments");

  // ---- Column Configs ----
  const deptColumns: DataTableColumn<any>[] = [
    { key: "name", header: "Department Name", cell: (row) => <span className="font-bold">{row.name}</span> },
    { key: "head", header: "Department Head", className: "font-medium" },
    { key: "parent", header: "Parent Dept", className: "text-muted-foreground text-sm font-medium" },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} variant={row.status === 'Active' ? 'success' : 'default'} /> },
    {
      key: "actions",
      header: "",
      cell: () => (
        <button className="p-2 bg-white border-2 border-border hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] rounded-full text-foreground transition-all">
          <Edit2 className="w-3 h-3 stroke-[3]" />
        </button>
      ),
    },
  ];

  const catColumns: DataTableColumn<any>[] = [
    { key: "name", header: "Category Name", cell: (row) => <span className="font-bold">{row.name}</span> },
    { key: "description", header: "Description", className: "font-medium" },
    { key: "extraFields", header: "Custom Fields", cell: (row) => <span className="text-xs font-mono font-bold bg-secondary px-2 py-1 rounded-full border border-border">{row.extraFields}</span> },
    { key: "assetCount", header: "Assets", cell: (row) => <span className="font-black text-lg bg-primary px-3 py-1 rounded-full border border-border">{row.assetCount}</span> },
    {
      key: "actions",
      header: "",
      cell: () => (
        <button className="p-2 bg-white border-2 border-border hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] rounded-full text-foreground transition-all">
          <Edit2 className="w-3 h-3 stroke-[3]" />
        </button>
      ),
    },
  ];

  const empColumns: DataTableColumn<any>[] = [
    {
      key: "name",
      header: "Employee",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-foreground text-sm font-black shadow-sm">
            {row.name.split(" ").map((w: string) => w[0]).join("").toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-foreground">{row.name}</p>
            <p className="text-xs font-medium text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (row) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-border ${row.role === 'Employee' ? 'bg-white' : 'bg-accent'}`}>
        {row.role}
      </span>
    )},
    { key: "departmentName", header: "Department", className: "font-bold" },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} variant="success" /> },
    {
      key: "actions",
      header: "Admin Action",
      cell: (row) => (
        row.role === 'Employee' ? (
          <button className="flex items-center gap-2 text-xs font-bold text-foreground bg-primary px-4 py-2 rounded-full hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all border-2 border-border">
            <ShieldAlert className="w-3 h-3 stroke-[3]" /> Promote Role
          </button>
        ) : (
          <button className="flex items-center gap-2 text-xs font-bold text-foreground bg-white px-4 py-2 rounded-full hover:shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] transition-all border-2 border-border">
            Edit Access
          </button>
        )
      ),
    },
  ];

  const tabConfig = [
    { id: "departments" as Tab, label: "Departments", icon: Building2 },
    { id: "categories" as Tab, label: "Asset Categories", icon: Tag },
    { id: "employees" as Tab, label: "Employee Directory", icon: Users },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground">Organization Setup</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Maintain master data for departments, categories, and users.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition shadow-md w-fit">
          <Plus className="w-4 h-4 stroke-[3]" />
          {activeTab === 'departments' ? 'New Department' : activeTab === 'categories' ? 'New Category' : 'Invite Employee'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabConfig.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200 border-2 ${
              activeTab === id
                ? "bg-primary border-border text-foreground shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] -translate-y-0.5"
                : "bg-white border-transparent text-muted-foreground hover:border-border hover:shadow-sm"
            }`}
          >
            <Icon className="w-4 h-4 stroke-[3]" />
            {label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white border-2 border-border rounded-[24px] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] overflow-hidden p-2">
        {activeTab === "departments" && (
          <DataTable
            columns={deptColumns}
            data={MOCK_DEPARTMENTS}
            keyField="id"
            emptyMessage="No departments found."
          />
        )}
        {activeTab === "categories" && (
          <DataTable
            columns={catColumns}
            data={MOCK_CATEGORIES}
            keyField="id"
            emptyMessage="No categories found."
          />
        )}
        {activeTab === "employees" && (
          <DataTable
            columns={empColumns}
            data={MOCK_EMPLOYEES}
            keyField="id"
            emptyMessage="No employees found."
          />
        )}
      </div>
    </div>
  );
}
