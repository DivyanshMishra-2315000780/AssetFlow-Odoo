import { useState } from "react";
import { Plus, Building2, Tag, Users, MoreHorizontal, ShieldAlert, Edit2 } from "lucide-react";
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
    { key: "name", header: "Department Name" },
    { key: "head", header: "Department Head", className: "text-muted-foreground font-medium" },
    { key: "parent", header: "Parent Dept", className: "text-muted-foreground text-sm" },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} variant={row.status === 'Active' ? 'success' : 'default'} /> },
    {
      key: "actions",
      header: "",
      cell: () => (
        <button className="p-2 hover:bg-muted rounded-md text-gray-500">
          <Edit2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const catColumns: DataTableColumn<any>[] = [
    { key: "name", header: "Category Name" },
    { key: "description", header: "Description", className: "text-muted-foreground" },
    { key: "extraFields", header: "Custom Fields", className: "text-xs font-mono bg-gray-100 px-2 py-1 rounded" },
    { key: "assetCount", header: "Assets", cell: (row) => <span className="font-semibold">{row.assetCount}</span> },
    {
      key: "actions",
      header: "",
      cell: () => (
        <button className="p-2 hover:bg-muted rounded-md text-gray-500">
          <Edit2 className="w-4 h-4" />
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
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
            {row.name.split(" ").map((w: string) => w[0]).join("").toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${row.role === 'Employee' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
        {row.role}
      </span>
    )},
    { key: "departmentName", header: "Department" },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} variant="success" /> },
    {
      key: "actions",
      header: "Admin Action",
      cell: (row) => (
        row.role === 'Employee' ? (
          <button className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition border border-blue-100">
            <ShieldAlert className="w-3 h-3" /> Promote Role
          </button>
        ) : (
          <button className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded hover:bg-gray-100 transition border border-gray-100">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Organization Setup</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Admin screen to maintain master data (Departments, Categories, Users).
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4" />
          {activeTab === 'departments' ? 'New Department' : activeTab === 'categories' ? 'New Category' : 'Invite Employee'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit border border-border">
        {tabConfig.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === id
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
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
