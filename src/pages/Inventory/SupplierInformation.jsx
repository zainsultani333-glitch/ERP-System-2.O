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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Download,
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Store,
  Mail,
  Phone,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import api from "../../Api/AxiosInstance";
import SupplierViewModal from "./Models/SupplierViewModal";
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
  const [form, setForm] = useState({
    supplierName: "",
    company: "",
    address: "",
    vatNumber: "",
    email: "",
    phone: "",
    lastPurchaseDate: "",
    lastPurchasePrice: "",
    avgPurchasePrice: "",
    totalPurchasedQty: "",
    totalSpendings: "",
    numberOfOrders: "",
  });

  const [summary, setSummary] = useState({
    totalSuppliers: 0,
    totalSpendings: 0,
    averagePurchasePrice: 0,
    totalOrders: 0,
  });

  const { token } = useAuth();
  // --- state setup ---
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

  // temporary dialog fields
  const [tempVisibleFields, setTempVisibleFields] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // when dialog opens, copy the actual visible fields
  const handleCustomizeOpen = (open) => {
    setIsCustomizeOpen(open);
    if (open) {
      setTempVisibleFields([...visibleFields]); // <-- start with nothing selected
    }
  };

  const handleAddClick = () => {
    setForm({
      supplierName: "",
      company: "",
      address: "",
      vatNumber: "",
      email: "",
      phone: "",
      lastPurchaseDate: "",
      lastPurchasePrice: "",
      avgPurchasePrice: "",
      totalPurchasedQty: "",
      totalSpendings: "",
      numberOfOrders: "",
    });
    setIsEditMode(false);
    setEditSupplierId(null);
  };

  // apply changes
  const handleApplyChanges = () => {
    setVisibleFields(tempVisibleFields);
    setIsCustomizeOpen(false);
    toast.success("Display settings updated!");
  };

  // ✅ Fetch suppliers
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

  // console.log(supplierData);

  const filteredSuppliers = supplierData.filter(
    (s) =>
      s.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  const handleDownload = () => toast.success("Supplier report downloaded!");
  const handleSaveSupplier = async () => {
    try {
      setSaving(true);

      if (!form.supplierName || !form.company || !form.address) {
        toast.error("Please fill all required fields!");
        return;
      }
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        toast.error("Please enter a valid email address!");
        return;
      }

      const payload = {
        supplierName: form.supplierName,
        company: form.company,
        address: form.address,
        vatNumber: form.vatNumber,
        email: form.email,
        phone: form.phone,
        lastPurchase: {
          date: form.lastPurchaseDate || new Date().toISOString().split("T")[0],
          price: Number(form.lastPurchasePrice) || 0,
        },

        avgPurchasePrice: Number(form.avgPurchasePrice) || 0,
        totalPurchasedQty: Number(form.totalPurchasedQty) || 0,
        totalSpendings: Number(form.totalSpendings) || 0,
        numberOfOrders: Number(form.numberOfOrders) || 0,
      };
      //  console.log(payload);

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
        toast.success("Supplier added successfully!");
        fetchSuppliers();
        setIsAddOpen(false);
        setForm({
          supplierName: "",
          company: "",
          address: "",
          vatNumber: "",
          email: "",
          phone: "",
          lastPurchaseDate: "",
          lastPurchasePrice: "",
          avgPurchasePrice: "",
          totalPurchasedQty: "",
          totalSpendings: "",
          numberOfOrders: "",
        });
        setIsEditMode(false);
        setEditSupplierId(null);
      } else {
        toast.error(res.data.message || "Failed to add supplier");
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error(
        error.response?.data?.message || "Server error while adding supplier"
      );
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

    // 🧩 Clean up ISO date format for input fields
    const formattedDate = supplier.lastPurchase?.date
      ? new Date(supplier.lastPurchase.date).toISOString().split("T")[0]
      : "";

    setForm({
      supplierName: supplier.supplierName || "",
      company: supplier.company || "",
      address: supplier.address || "",
      vatNumber: supplier.vatNumber || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      lastPurchaseDate: formattedDate, // ✅ fixed here
      lastPurchasePrice: supplier.lastPurchase?.price || "",
      avgPurchasePrice: supplier.avgPurchasePrice || "",
      totalPurchasedQty: supplier.totalPurchasedQty || "",
      totalSpendings: supplier.totalSpendings || "",
      numberOfOrders: supplier.numberOfOrders || "",
    });

    setEditSupplierId(id);
    setIsEditMode(true);
    setIsAddOpen(true);
  };

  const handleDelete = async (Id) => {
    // console.log(ItemId);

    try {
      setLoading(true);
      toast.loading("Deleting supplier...");
      const res = await api.delete(`/suppliers/${Id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss(); // remove loader

      if (res.data?.success) {
        toast.success("supplier deleted successfully!");
        fetchSuppliers(); // refresh table
      } else {
        toast.error(res.data?.message || "Failed to delete supplier");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error deleting supplier:", error);
      toast.error(
        error.response?.data?.message || "Server error while deleting"
      );
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

  const preventNonNumeric = (e) => {
    if (["e", "E", "+", "-", ","].includes(e.key)) e.preventDefault();
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
                    {isEditMode
                      ? "Edit Supplier Information"
                      : "Add Supplier Information"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Supplier Name</Label>
                      <Input
                        placeholder="Enter supplier name"
                        value={form.supplierName}
                        onChange={(e) =>
                          setForm({ ...form, supplierName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={form.company}
                        onChange={(e) =>
                          setForm({ ...form, company: e.target.value })
                        }
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Enter supplier address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>VAT Number</Label>
                      <Input
                        type="number"
                        onKeyDown={preventNonNumeric}
                        value={form.vatNumber}
                        onChange={(e) =>
                          setForm({ ...form, vatNumber: e.target.value })
                        }
                        placeholder="Enter VAT / Tax ID"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Last Purchase Date</Label>
                        <Input
                          type="date"
                          value={form.lastPurchaseDate}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              lastPurchaseDate: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Last Purchase Price (€)</Label>
                        <Input
                          type="number"
                          onKeyDown={preventNonNumeric}
                          placeholder="0.00"
                          value={form.lastPurchasePrice}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              lastPurchasePrice: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Average Purchase Price</Label>
                      <Input
                        type="number"
                        onKeyDown={preventNonNumeric}
                        value={form.avgPurchasePrice}
                        onChange={(e) =>
                          setForm({ ...form, avgPurchasePrice: e.target.value })
                        }
                        placeholder="Enter average price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Purchased Quantity</Label>
                      <Input
                        type="number"
                        onKeyDown={preventNonNumeric}
                        value={form.totalPurchasedQty}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            totalPurchasedQty: e.target.value,
                          })
                        }
                        placeholder="Enter total quantity"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Spendings</Label>
                      <Input
                        type="number"
                        onKeyDown={preventNonNumeric}
                        value={form.totalSpendings}
                        onChange={(e) =>
                          setForm({ ...form, totalSpendings: e.target.value })
                        }
                        placeholder="Enter total spendings"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Orders</Label>
                      <Input
                        type="number"
                        onKeyDown={preventNonNumeric}
                        value={form.numberOfOrders}
                        onChange={(e) =>
                          setForm({ ...form, numberOfOrders: e.target.value })
                        }
                        placeholder="Enter order count"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        required
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mobile / Phone No</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                    onClick={handleSaveSupplier}
                  >
                    {saving ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {isEditMode ? "Updating..." : "Saving..."}
                      </div>
                    ) : isEditMode ? (
                      "Update Supplier"
                    ) : (
                      " Save Supplier Details"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
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
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Spendings
                </p>
                <p className="text-2xl font-bold text-green-900">
                  € {summary.totalSpendings.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-green-600" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-amber-700">
                  Average Purchase Price
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {" "}
                  € {summary.averagePurchasePrice || 0}
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-amber-600" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {summary.totalOrders || 0}
                </p>
              </div>
              <Package className="w-5 h-5 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                placeholder="Search by name, email, or company..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50
                          bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
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
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-primary" />
                Supplier Records
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge
                  variant="primary"
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

          <CardContent className="p-0 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent md:overflow-x-visible">
            <table className="w-full text-sm table-auto md:table-fixed">
              <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                <tr>
                  {visibleFields.includes("sr") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[60px]">
                      Sr
                    </th>
                  )}

                  {visibleFields.includes("supplierName") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[120px]">
                      Supplier Name
                    </th>
                  )}
                  {visibleFields.includes("company") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[130px]">
                      Company
                    </th>
                  )}
                  {visibleFields.includes("address") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[180px]">
                      Address
                    </th>
                  )}
                  {visibleFields.includes("vatNumber") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[100px]">
                      VAT Number
                    </th>
                  )}
                  {visibleFields.includes("avgPurchasePrice") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[140px]">
                      Avg Purchase Price
                    </th>
                  )}
                  {visibleFields.includes("totalSpendings") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[140px]">
                      Total Spendings
                    </th>
                  )}
                  {visibleFields.includes("orders") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[120px]">
                      Orders
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr>
                    <td
                      colSpan={visibleFields.length + 1}
                      className="py-20 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Loader className="w-10 h-10 text-primary animate-spin mb-3" />
                      </div>
                    </td>
                  </tr>
                ) : filteredSuppliers.length > 0 ? (
                  currentSuppliers.map((s, index) => (
                    <tr
                      key={s._id || index}
                      className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                    >
                      {visibleFields.includes("sr") && (
                        <td className="px-6 py-4 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                          {startIndex + index + 1}
                        </td>
                      )}

                      {visibleFields.includes("supplierName") && (
                        <td className="px-6 py-4 font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                          {s.supplierName || "-"}
                        </td>
                      )}
                      {visibleFields.includes("company") && (
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                          {s.company || "-"}
                        </td>
                      )}
                      {visibleFields.includes("address") && (
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                          {s.address || "-"}
                        </td>
                      )}
                      {visibleFields.includes("vatNumber") && (
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                          {s.vatNumber || "-"}
                        </td>
                      )}
                      {visibleFields.includes("avgPurchasePrice") && (
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                          €{s.avgPurchasePrice || 0}
                        </td>
                      )}
                      {visibleFields.includes("totalSpendings") && (
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                          €{s.totalSpendings || 0}
                        </td>
                      )}
                      {visibleFields.includes("orders") && (
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                          {s.numberOfOrders || 0}
                        </td>
                      )}
                      <td className="px-6 py-4 flex items-center gap-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(s._id)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(s._id)}
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s._id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                      <p className="text-sm text-muted-foreground mt-2">
                        Try adjusting your search terms or add a new supplier
                        entry
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
          </CardContent>
        </Card>
      </div>
      <Dialog open={isCustomizeOpen} onOpenChange={handleCustomizeOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-900/80 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl transition-all duration-500 ease-in-out">
          {/* Header */}
          <DialogHeader className="pb-3 border-b border-border/30">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                ⚙️
              </span>
              Customize Display
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 pl-10">
              Choose which columns you want to display in your supplier table.
            </p>
          </DialogHeader>

          {/* Alert popup */}
          {fieldLimitAlert && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 font-medium text-center animate-fadeIn">
              You can select a maximum of 6 fields only!
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 py-6 px-1">
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
                className="group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-primary/30 hover:bg-primary/5"
              >
                <input
                  type="checkbox"
                  checked={tempVisibleFields.includes(key)}
                  onChange={() => {
                    setTempVisibleFields((prev) => {
                      if (prev.includes(key)) {
                        return prev.filter((f) => f !== key);
                      } else if (prev.length >= 6) {
                        // Show red alert popup
                        setFieldLimitAlert(true);
                        setTimeout(() => setFieldLimitAlert(false), 2500); // hide after 2.5s
                        return prev;
                      } else {
                        return [...prev, key];
                      }
                    });
                  }}
                  className="peer appearance-none w-5 h-5 border border-gray-300 dark:border-gray-700 rounded-md checked:bg-gradient-to-br checked:from-primary checked:to-primary/70 transition-all duration-200 flex items-center justify-center relative
            after:content-['✓'] after:text-white after:font-bold after:text-[11px] after:opacity-0 checked:after:opacity-100 after:transition-opacity"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>

          {/* Button */}
          <Button
            className="w-full mt-2 py-3 bg-gradient-to-r from-primary via-primary/80 to-primary/70 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/40 hover:-translate-y-[1px] transition-all duration-300"
            onClick={handleApplyChanges}
          >
            ✨ Apply Changes
          </Button>
        </DialogContent>
      </Dialog>
      {/* view model */}
      <SupplierViewModal
        isOpen={isViewOpen}
        onClose={setIsViewOpen}
        supplier={selectedSupplier}
      />
    </DashboardLayout>
  );
};

export default SupplierInformation;
