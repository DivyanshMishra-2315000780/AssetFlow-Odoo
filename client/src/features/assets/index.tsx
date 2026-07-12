import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssetsTable } from "./AssetsTable";
import { AssetForm } from "./AssetForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type Asset } from "@/types";

// Temporary mock data until backend is ready
const MOCK_ASSETS: Asset[] = [
  {
    id: "1",
    name: "MacBook Pro M3 Max",
    category: "Electronics",
    status: "In Use",
    assignedTo: "Jane Doe",
    location: "HQ - Floor 3",
    purchaseDate: "2023-11-01",
  },
  {
    id: "2",
    name: "Dell UltraSharp 32 4K",
    category: "Electronics",
    status: "Available",
    location: "Storage Room A",
    purchaseDate: "2023-12-15",
  },
  {
    id: "3",
    name: "Herman Miller Aeron",
    category: "Furniture",
    status: "Maintenance",
    location: "HQ - Floor 2",
    purchaseDate: "2022-06-10",
  }
];

export default function AssetsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);

  const handleOpenForm = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
    } else {
      setEditingAsset(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  const handleSubmit = (data: any) => {
    if (editingAsset) {
      setAssets(assets.map(a => a.id === editingAsset.id ? { ...a, ...data } : a));
    } else {
      const newAsset = { ...data, id: Math.random().toString(36).substr(2, 9) };
      setAssets([newAsset, ...assets]);
    }
    handleCloseForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Assets Management</h2>
          <p className="text-muted-foreground mt-1">
            Centrally manage and track all organizational assets.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => handleOpenForm()} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <AssetsTable 
        assets={assets} 
        onEdit={handleOpenForm} 
        onDelete={handleDelete} 
      />

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingAsset ? "Edit Asset" : "Add New Asset"}</SheetTitle>
            <SheetDescription>
              {editingAsset 
                ? "Update the details of the asset below." 
                : "Enter the details for the new asset to register it in the system."}
            </SheetDescription>
          </SheetHeader>
          
          <AssetForm 
            initialData={editingAsset}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
