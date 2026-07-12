import { useState } from "react";
import { Plus, Building2, Tag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/core/DataTable";
import { StatusBadge } from "@/components/ui/core/StatusBadge";
import type { Department, Category, Employee } from "@/types";

type Tab = "departments" | "categories" | "employees";

// ---- Mock data ----
const MOCK_DEPARTMENTS: Department[] = [
  { id: "1", name: "Information Technology", description: "Manages all IT infrastructure", createdAt: "2023-01-15" },
  { id: "2", name: "Operations", description: "Day-to-day operational processes", createdAt: "2023-01-15" },
  { id: "3", name: "Finance", description: "Financial planning and accounting", createdAt: "2023-01-20" },
  { id: "4", name: "Human Resources", description: "Recruitment and employee wellbeing", createdAt: "2023-02-01" },
  { id: "5", name: "Marketing", description: "Brand and communications", createdAt: "2023-02-10" },
];

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Electronics", description: "Laptops, monitors, phones", assetCount: 98 },
  { id: "2", name: "Furniture", description: "Chairs, desks, cabinets", assetCount: 64 },
  { id: "3", name: "Vehicles", description: "Company cars and trucks", assetCount: 12 },
  { id: "4", name: "Lab Equipment", description: "Scientific and testing tools", assetCount: 34 },
  { id: "5", name: "Software Licenses", description: "Subscriptions and seat licenses", assetCount: 40 },
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", name: "Sarah Lee", email: "sarah.lee@assetflow.com", role: "Manager", departmentName: "IT", status: "Active", joinedAt: "2022-03-10" },
  { id: "2", name: "James Park", email: "james.park@assetflow.com", role: "Employee", departmentName: "Finance", status: "Active", joinedAt: "2022-06-01" },
  { id: "3", name: "Meera Patel", email: "meera.patel@assetflow.com", role: "Employee", departmentName: "Operations", status: "Active", joinedAt: "2021-11-15" },
  { id: "4", name: "Carlos Rivera", email: "c.rivera@assetflow.com", role: "Manager", departmentName: "Marketing", status: "Inactive", joinedAt: "2020-07-20" },
  { id: "5", name: "Aisha Nkosi", email: "a.nkosi@assetflow.com", role: "Employee", departmentName: "HR", status: "Active", joinedAt: "2023-01-09" },
];

// ---- Column Configs ----
const deptColumns: DataTableColumn<Department>[] = [
  { key: "name", header: "Department Name" },
  { key: "description", header: "Description", className: "text-muted-foreground" },
  {
    key: "createdAt",
    header: "Created",
    cell: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
];

const catColumns: DataTableColumn<Category>[] = [
  { key: "name", header: "Category Name" },
  { key: "description", header: "Description", className: "text-muted-foreground" },
  {
    key: "assetCount",
    header: "Assets",
    cell: (row) => (
      <span className="font-semibold text-foreground">{row.assetCount ?? 0}</span>
    ),
  },
];

const empColumns: DataTableColumn<Employee>[] = [
  {
    key: "name",
    header: "Employee",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
          {row.name.split(" ").map((w) => w[0]).join("").toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  { key: "role", header: "Role" },
  { key: "departmentName", header: "Department" },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "joinedAt",
    header: "Joined",
    cell: (row) => new Date(row.joinedAt).toLocaleDateString(),
  },
];

const tabConfig = [
  { id: "departments" as Tab, label: "Departments", icon: Building2 },
  { id: "categories" as Tab, label: "Categories", icon: Tag },
  { id: "employees" as Tab, label: "Employees", icon: Users },
];

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("departments");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Organization</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage departments, categories, and employees.
          </p>
        </div>
        <Button className="gap-2" id="org-add-btn">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
        {tabConfig.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Table Content */}
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
  );
}
