import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Download,
  Package,
  Warehouse,
  Building2,
  Edit,
  Trash2,
  Eye,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import api from "../../Api/AxiosInstance";
import SupplierViewModal from "../Inventory/Models/SupplierViewModal";
import Pagination from "../../components/Pagination";

const SupplierInformation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [supplierData, setSupplierData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Only fields from the payload
  const [form, setForm] = useState({
    supplierName: "",
    company: "",
    vatPrefix: "",
    address: "",
    vatNumber: "",
    email: "",
    phone: "",
  });

  const [summary, setSummary] = useState({
    totalSuppliers: 0,
    totalSpendings: 0,
    averagePurchasePrice: 0,
    totalOrders: 0,
  });

  const { token } = useAuth();

  // Table column visibility
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "supplierName",
    "company",
    "address",
    "vatNumber",
    "avgPurchasePrice",
    "totalSpendings",
    "orders",
  ]);
  const [fieldLimitAlert, setFieldLimitAlert] = useState(false);
  const [tempVisibleFields, setTempVisibleFields] = useState([]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const handleCustomizeOpen = (open) => {
    setIsCustomizeOpen(open);
    if (open) {
      setTempVisibleFields([...visibleFields]);
    }
  };

  const handleAddClick = () => {
    setForm({
      supplierName: "",
      company: "",
      address: "",
      vatNumber: "",
      vatPrefix: "",
      email: "",
      phone: "",
    });
    setIsEditMode(false);
    setEditSupplierId(null);
  };

  const handleApplyChanges = () => {
    setVisibleFields(tempVisibleFields);
    setIsCustomizeOpen(false);
    toast.success("Display settings updated!");
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setSupplierData(res.data.data || []);
        if (res.data.summary) setSummary(res.data.summary);
      } else {
        toast.error("Failed to fetch suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Error fetching supplier data");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = supplierData.filter(
    (s) =>
      s.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  const handleDownload = () => toast.success("Supplier report downloaded!");

  const handleSaveSupplier = async () => {
    try {
      setSaving(true);
      if (!form.supplierName.trim()) {
        toast.error("Supplier name is required!");
        return;
      }

      if (!form.company.trim()) {
        toast.error("Company name is required!");
        return;
      }
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
        toast.error("Please enter a valid email address!");
        return;
      }

      const payload = {
        supplierName: form.supplierName,
        company: form.company,
        address: form.address,
        vatNumber: form.vatPrefix
          ? `${form.vatPrefix}${form.vatNumber}`
          : form.vatNumber || "",
        email: form.email || "",
        phone: form.phone || "",
      };

      let res;
      if (isEditMode && editSupplierId) {
        res = await api.put(`/suppliers/${editSupplierId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await api.post("/suppliers", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (res.data.success) {
        toast.success(
          isEditMode ? "Supplier updated!" : "Supplier added successfully!"
        );
        fetchSuppliers();
        setIsAddOpen(false);
        setForm({
          supplierName: "",
          company: "",
          address: "",
          vatNumber: "",
          vatPrefix: "",
          email: "",
          phone: "",
        });
        setIsEditMode(false);
        setEditSupplierId(null);
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (id) => {
    const supplier = supplierData.find((s) => s._id === id);
    if (!supplier) {
      toast.error("Supplier not found!");
      return;
    }
    const vat = supplier.vatNumber || "";
    setForm({
      supplierName: supplier.supplierName || "",
      company: supplier.company || "",
      address: supplier.address || "",
      vatPrefix: vat.substring(0, 2) || "",
      vatNumber: vat.substring(2) || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
    });

    setEditSupplierId(id);
    setIsEditMode(true);
    setIsAddOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      toast.loading("Deleting supplier...");
      const res = await api.delete(`/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.dismiss();
      if (res.data?.success) {
        toast.success("Supplier deleted successfully!");
        fetchSuppliers();
      } else {
        toast.error(res.data?.message || "Failed to delete");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleView = (id) => {
    const supplier = supplierData.find((s) => s._id === id);
    if (!supplier) return toast.error("Supplier not found!");
    setSelectedSupplier(supplier);
    setIsViewOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Supplier Information
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Manage supplier records, purchase history & stats
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleAddClick}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-full overflow-y-scroll bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    {isEditMode ? "Edit Supplier" : "Add New Supplier"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Supplier Name <span className="text-red-500">*</span>{" "}
                      </Label>
                      <Input
                        placeholder="e.g. ABC Traders"
                        value={form.supplierName}
                        onChange={(e) =>
                          setForm({ ...form, supplierName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Company <span className="text-red-500">*</span>{" "}
                      </Label>
                      <Input
                        placeholder="e.g. ABC Distributors Ltd."
                        value={form.company}
                        onChange={(e) =>
                          setForm({ ...form, company: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        placeholder="e.g. Plot 22, Industrial Area, Lahore"
                        value={form.address}
                        onChange={(e) =>
                          setForm({ ...form, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT Number</Label>

                      <div className="flex items-center border-2 rounded-lg overflow-hidden bg-white">
                        {/* VAT Country Code Dropdown */}
                        <Select
                          value={form.vatPrefix}
                          onValueChange={(value) =>
                            setForm({ ...form, vatPrefix: value })
                          }
                        >
                          <SelectTrigger className="w-24 border-0 rounded-none bg-muted/30 h-[42px]">
                            <SelectValue placeholder="FR" />
                          </SelectTrigger>

                          <SelectContent className="max-h-60">
                            {[
                              "AT",
                              "BE",
                              "BG",
                              "CY",
                              "CZ",
                              "DE",
                              "DK",
                              "EE",
                              "EL",
                              "ES",
                              "FI",
                              "FR",
                              "HR",
                              "HU",
                              "IE",
                              "IT",
                              "LT",
                              "LU",
                              "LV",
                              "MT",
                              "NL",
                              "PL",
                              "PT",
                              "RO",
                              "SE",
                              "SI",
                              "SK",
                            ].map((prefix) => (
                              <SelectItem key={prefix} value={prefix}>
                                {prefix}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* VAT Number Input */}
                        <Input
                          placeholder="Enter VAT Number"
                          value={form.vatNumber}
                          onChange={(e) =>
                            setForm({ ...form, vatNumber: e.target.value })
                          }
                          className="border-0 rounded-none h-[42px] flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="e.g. abc@suppliers.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="e.g. Enter Number"
                        value={form.phone}
                        onChange={(e) => {
                          // Allow ONLY digits
                          const cleaned = e.target.value.replace(/[^0-9]/g, "");
                          setForm({ ...form, phone: cleaned });
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                    onClick={handleSaveSupplier}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {isEditMode ? "Updating..." : "Saving..."}
                      </>
                    ) : isEditMode ? (
                      "Update Supplier"
                    ) : (
                      "Save Supplier"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Suppliers
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {summary.totalSuppliers || 0}
                </p>
              </div>
              <Building2 className="w-5 h-5 text-blue-600" />
            </CardContent>
          </Card>
          {/* Other stats remain unchanged */}
        </div>

        {/* Search Bar */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                placeholder="Search by name, email, or company..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {/* Table */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-primary" />
                Supplier Records
              </CardTitle>

              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {filteredSuppliers.length} entries
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomizeOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl text-white transition-all duration-200"
                >
                  Customize
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full">
                <thead className="bg-gradient-to-r whitespace-nowrap from-muted/40 to-muted/20 border-b border-border/50">
                  <tr>
                    {visibleFields.includes("sr") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Sr
                      </th>
                    )}

                    {visibleFields.includes("supplierName") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Supplier Name
                      </th>
                    )}

                    {visibleFields.includes("company") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Company
                      </th>
                    )}

                    {visibleFields.includes("address") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Address
                      </th>
                    )}

                    {visibleFields.includes("vatNumber") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        VAT Number
                      </th>
                    )}

                    {visibleFields.includes("avgPurchasePrice") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Avg Purchase Price
                      </th>
                    )}

                    {visibleFields.includes("totalSpendings") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Total Spendings
                      </th>
                    )}

                    {visibleFields.includes("orders") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Orders
                      </th>
                    )}

                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan={visibleFields.length + 1} className="py-20">
                        <div className="flex flex-col items-center justify-center w-full">
                          <Loader className="w-10 h-10 text-primary animate-spin mb-3" />
                        </div>
                      </td>
                    </tr>
                  ) : currentSuppliers.length > 0 ? (
                    currentSuppliers.map((s, index) => (
                      <tr
                        key={s._id}
                        className="group hover:bg-primary/5 transition-all duration-300"
                      >
                        {visibleFields.includes("sr") && (
                          <td className="px-6 py-4">
                            {startIndex + index + 1}
                          </td>
                        )}

                        {visibleFields.includes("supplierName") && (
                          <td className="px-6 py-4 font-semibold truncate max-w-[150px]">
                            {s.supplierName || "-"}
                          </td>
                        )}

                        {visibleFields.includes("company") && (
                          <td className="px-6 py-4 truncate max-w-[150px]">
                            {s.company || "-"}
                          </td>
                        )}

                        {visibleFields.includes("address") && (
                          <td className="px-6 py-4 truncate max-w-[200px]">
                            {s.address || "-"}
                          </td>
                        )}

                        {visibleFields.includes("vatNumber") && (
                          <td className="px-6 py-4">{s.vatNumber || "-"}</td>
                        )}

                        {visibleFields.includes("avgPurchasePrice") && (
                          <td className="px-6 py-4">
                            €{(s.avgPurchasePrice || 0).toLocaleString()}
                          </td>
                        )}

                        {visibleFields.includes("totalSpendings") && (
                          <td className="px-6 py-4">
                            €{(s.totalSpendings || 0).toLocaleString()}
                          </td>
                        )}

                        {visibleFields.includes("orders") && (
                          <td className="px-6 py-4">{s.numberOfOrders || 0}</td>
                        )}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(s._id)}
                            >
                              <Eye size={16} />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(s._id)}
                            >
                              <Edit size={16} />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(s._id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={visibleFields.length + 1}
                        className="text-center py-12"
                      >
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground font-medium text-lg">
                          No suppliers found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalItems={filteredSuppliers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customize Columns Dialog */}
      <Dialog open={isCustomizeOpen} onOpenChange={handleCustomizeOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-900/80 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border/30">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                Settings
              </span>
              Customize Display
            </DialogTitle>
          </DialogHeader>

          {fieldLimitAlert && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 font-medium text-center">
              Maximum 6 fields allowed!
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 py-6">
            {[
              { key: "sr", label: "Serial Number" },
              { key: "supplierName", label: "Supplier Name" },
              { key: "company", label: "Company" },
              { key: "address", label: "Address" },
              { key: "vatNumber", label: "VAT Number" },
              { key: "avgPurchasePrice", label: "Avg Purchase Price" },
              { key: "totalSpendings", label: "Total Spendings" },
              { key: "orders", label: "Orders" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer border hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <input
                  type="checkbox"
                  checked={tempVisibleFields.includes(key)}
                  onChange={() => {
                    setTempVisibleFields((prev) => {
                      if (prev.includes(key))
                        return prev.filter((f) => f !== key);
                      if (prev.length >= 6) {
                        setFieldLimitAlert(true);
                        setTimeout(() => setFieldLimitAlert(false), 2500);
                        return prev;
                      }
                      return [...prev, key];
                    });
                  }}
                  className="w-5 h-5 rounded border-gray-300 checked:bg-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>

          <Button className="w-full" onClick={handleApplyChanges}>
            Apply Changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <SupplierViewModal
        isOpen={isViewOpen}
        onClose={setIsViewOpen}
        supplier={selectedSupplier}
      />
    </DashboardLayout>
  );
};

export default SupplierInformation;
