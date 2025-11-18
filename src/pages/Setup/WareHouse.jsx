import { useState, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WarehouseViewModal from "../Inventory/Models/WareHouseModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Pagination from "../../components/Pagination";
import {
  Plus,
  Search,
  Download,
  Warehouse,
  MapPin,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Building2,
  Users,
  AlertCircle,
  List,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import api from "../../Api/AxiosInstance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WareHouse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Loader
  const TableLoader = ({ message = "Loading..." }) => {
    return (
      <tr>
        <td colSpan="9" className="py-20 text-center">
          <div className="flex flex-col items-center justify-center">
            <Loader className="w-10 h-10 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              {message}
            </p>
          </div>
        </td>
      </tr>
    );
  };

  // 🟢 Fetch Warehouse Data
  const fetchWareHouse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/warehouses");

      if (response.data.success && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map((w) => ({
          id: w._id,
          name: w.warehouseName || "-",
          address: w.warehouseAddress || "-",
          incharge: w.inCharge || { name: "-", contact: "-", email: "-" },
          itemsInStock: w.itemsInStock || 0,
          PurchaseValue: w.totalPurchaseValue || 0,
        }));

        setWarehouses(formattedData);
      }
    } catch (error) {
      console.error("❌ Failed to fetch Warehouse:", error);
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  }, []);

  useEffect(() => {
    fetchWareHouse();
  }, [fetchWareHouse]);

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.incharge.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      warehouse.itemsInStock.toString().includes(searchTerm) ||
      warehouse.PurchaseValue.toString().includes(searchTerm)
  );

  // Customize table columns
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "name",
    "address",
    "incharge",
    "itemsInStock",
    "PurchaseValue",
  ]);

  // Temporary selection when opening dialog
  const [tempVisibleFields, setTempVisibleFields] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [fieldLimitAlert, setFieldLimitAlert] = useState(false);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewWarehouse, setViewWarehouse] = useState(null);
  const handleCustomizeOpen = (open) => {
    setIsCustomizeOpen(open);
    if (open) setTempVisibleFields([...visibleFields]); // ✅ start with all checkboxes unchecked
  };

  const handleApplyChanges = () => {
    setVisibleFields(tempVisibleFields);
    setIsCustomizeOpen(false);
    toast.success("Display settings updated!");
  };

  const handleDownload = () => {
    toast.success("Warehouse report downloaded!");
  };

  const clearForm = () => {
    setNewWarehouse({
      id: "",
      name: "",
      address: "",
      inchargeName: "",
      inchargeContact: "",
      inchargeEmail: "",
    });
  };

  // Handle Save
  const handleSaveWarehouse = async () => {
    try {
      setButtonLoading(true);

      const payload = {
        warehouseName: newWarehouse.name,
        warehouseAddress: newWarehouse.address,
        inCharge: {
          name: newWarehouse.inchargeName,
          contact: newWarehouse.inchargeContact,
          email: newWarehouse.inchargeEmail,
        },
      };

      const response = await api.post(`/warehouses`, payload);

      if (response.data.success) {
        toast.success("Warehouse added successfully!");

        const newRow = {
          id: response.data.data._id,
          name: response.data.data.warehouseName,
          address: response.data.data.warehouseAddress,
          incharge: response.data.data.inCharge,
          itemsInStock: response.data.data.itemsInStock || 0,
          PurchaseValue: response.data.data.totalPurchaseValue || 0,
        };

        // ⭐ INSTANT UPDATE
        setWarehouses((prev) => [newRow, ...prev]);

        setIsAddOpen(false);
        clearForm();

        // Optional — soft refresh from DB
        fetchWareHouse();
      } else {
        toast.error("Failed to add warehouse!");
      }
    } catch (error) {
      console.error("❌ Error adding warehouse:", error);
      toast.error("Error adding warehouse!");
    } finally {
      setButtonLoading(false);
    }
  };

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    address: "",
    inchargeName: "",
    inchargeContact: "",
    inchargeEmail: "",
  });

  // ------------------------ DELETE WAREHOUSE ------------------------
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(`/warehouses/${id}`);

      if (response.data.success) {
        toast.success(" Warehouse deleted successfully!");
        fetchWareHouse(); // Refresh the list
      } else {
        toast.error(" Failed to delete warehouse!");
      }
    } catch (error) {
      console.error("❌ Error deleting warehouse:", error);
      toast.error("Error deleting warehouse!");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------ EDIT WAREHOUSE ------------------------
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState({
    id: "",
    name: "",
    address: "",
    inchargeName: "",
    inchargeContact: "",
    inchargeEmail: "",
  });

  const handleEdit = (warehouse) => {
    setEditWarehouse({
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address,
      inchargeName: warehouse.incharge?.name || "",
      inchargeContact: warehouse.incharge?.contact || "",
      inchargeEmail: warehouse.incharge?.email || "",
    });
    setIsEditOpen(true);
  };

  // Handle Update
  const handleUpdateWarehouse = async () => {
    try {
      setButtonLoading(true);

      const payload = {
        warehouseName: newWarehouse.name,
        warehouseAddress: newWarehouse.address,
        inCharge: {
          name: newWarehouse.inchargeName,
          contact: newWarehouse.inchargeContact,
          email: newWarehouse.inchargeEmail,
        },
      };

      const response = await api.put(`/warehouses/${newWarehouse.id}`, payload);

      if (response.data.success) {
        toast.success("Warehouse updated successfully!");

        // ⭐ INSTANT UPDATE
        setWarehouses((prev) =>
          prev.map((w) =>
            w.id === newWarehouse.id
              ? {
                  ...w,
                  name: newWarehouse.name,
                  address: newWarehouse.address,
                  incharge: {
                    name: newWarehouse.inchargeName,
                    contact: newWarehouse.inchargeContact,
                    email: newWarehouse.inchargeEmail,
                  },
                }
              : w
          )
        );

        setIsAddOpen(false);
        clearForm();

        // optional soft reload
        fetchWareHouse();
      } else {
        toast.error("Failed to update warehouse!");
      }
    } catch (error) {
      console.error("❌ Error updating warehouse:", error);
      toast.error("Error updating warehouse!");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleView = (warehouse) => {
    setViewWarehouse(warehouse); // store selected warehouse
    setIsViewOpen(true); // open view dialog
  };

  const totalStockValue = warehouses.reduce(
    (sum, w) => sum + w.PurchaseValue,
    0
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWarehouses = filteredWarehouses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Search Bar
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to page 1 on every new search
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Warehouse Management
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Warehouse className="w-4 h-4" />
              Manage warehouses, addresses, and incharge details
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
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Warehouse
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    Add New Warehouse
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Warehouse Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Warehouse Name
                    </Label>
                    <Input
                      placeholder="e.g., Main Warehouse"
                      value={newWarehouse.name}
                      onChange={(e) =>
                        setNewWarehouse({
                          ...newWarehouse,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Warehouse Address
                    </Label>
                    <Input
                      placeholder="Full address with city"
                      value={newWarehouse.address}
                      onChange={(e) =>
                        setNewWarehouse({
                          ...newWarehouse,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Incharge Group */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Incharge Details
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          Name
                        </Label>
                        <Input
                          placeholder="Full name"
                          value={newWarehouse.inchargeName}
                          onChange={(e) =>
                            setNewWarehouse({
                              ...newWarehouse,
                              inchargeName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2 ">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Contact
                        </Label>
                        <Input
                          type="text"
                          placeholder="+92 3XX XXXXXXX"
                          value={newWarehouse.inchargeContact}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // remove all non-digits
                            setNewWarehouse({
                              ...newWarehouse,
                              inchargeContact: value,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> Email
                        </Label>
                        <Input
                          type="email"
                          placeholder="incharge@company.com"
                          value={newWarehouse.inchargeEmail}
                          onChange={(e) =>
                            setNewWarehouse({
                              ...newWarehouse,
                              inchargeEmail: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                    onClick={() =>
                      newWarehouse.id
                        ? handleUpdateWarehouse()
                        : handleSaveWarehouse()
                    }
                    disabled={buttonLoading} // disable while loading
                  >
                    {buttonLoading ? (
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : newWarehouse.id ? (
                      "Update Warehouse"
                    ) : (
                      "Save Warehouse"
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
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Total Warehouses
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {warehouses.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Warehouse className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Active Incharges
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {new Set(warehouses.map((w) => w.incharge.name)).size}
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {
                      new Set(
                        warehouses.map((w) => w.address.split(",").pop().trim())
                      ).size
                    }
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <List className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Total Stock Value
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    € {totalStockValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                placeholder="Search by warehouse name, address, incharge, stock, or value..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Table */}

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-primary" />
                Warehouse Directory
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {filteredWarehouses.length} warehouses
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCustomizeOpen(true);
                  }}
                  className="bg-gradient-to-r from-primary to-primary/90 text-white"
                >
                  Customize
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                  <tr>
                    {visibleFields.includes("sr") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Sr
                      </th>
                    )}
                    {visibleFields.includes("name") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Warehouse
                      </th>
                    )}
                    {visibleFields.includes("address") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Address
                      </th>
                    )}
                    {visibleFields.includes("incharge") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Incharge
                      </th>
                    )}
                    {visibleFields.includes("itemsInStock") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Items in Stock
                      </th>
                    )}
                    {visibleFields.includes("PurchaseValue") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Value
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                {loading ? (
                  <TableLoader message="Fetching categories..." />
                ) : (
                  <tbody className="divide-y divide-border/30">
                    {filteredWarehouses.length > 0 ? (
                      currentWarehouses.map((warehouse, index) => (
                        <tr
                          key={warehouse.id}
                          className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                        >
                          {visibleFields.includes("sr") && (
                            <td className="px-6 py-4 font-semibold">
                              {indexOfFirstItem + index + 1}
                            </td>
                          )}
                          {visibleFields.includes("name") && (
                            <td className="px-6 py-4">
                              <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 flex items-center gap-2">
                                <Warehouse className="w-4 h-4 text-primary/60" />
                                {warehouse.name}
                              </div>
                            </td>
                          )}
                          {visibleFields.includes("address") && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 text-amber-600" />
                                <span>{warehouse.address}</span>
                              </div>
                            </td>
                          )}
                          {visibleFields.includes("incharge") && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">
                                  {warehouse.incharge?.name}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                  >
                                    <DropdownMenuItem className="flex items-center gap-2">
                                      <Phone className="w-3 h-3" />
                                      {warehouse.incharge?.contact}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center gap-2">
                                      <Mail className="w-3 h-3" />
                                      {warehouse.incharge?.email}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          )}
                          {visibleFields.includes("itemsInStock") && (
                            <td className="px-6 py-4">
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-700 border-emerald-200"
                              >
                                {warehouse.itemsInStock.toLocaleString()}
                              </Badge>
                            </td>
                          )}
                          {visibleFields.includes("PurchaseValue") && (
                            <td className="px-6 py-4">
                              <div className="font-medium text-foreground">
                                € {warehouse.PurchaseValue.toLocaleString()}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(warehouse)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setNewWarehouse({
                                    id: warehouse.id,
                                    name: warehouse.name,
                                    address: warehouse.address,
                                    inchargeName:
                                      warehouse.incharge?.name || "",
                                    inchargeContact:
                                      warehouse.incharge?.contact || "",
                                    inchargeEmail:
                                      warehouse.incharge?.email || "",
                                  });
                                  setIsAddOpen(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-lg"
                                title="Edit Warehouse"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(warehouse.id)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg"
                                title="Delete Warehouse"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={visibleFields.length + 1}>
                          <div className="text-center py-12">
                            <Warehouse className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground font-medium text-lg">
                              No warehouses found
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Try adjusting your search or add a new warehouse
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                )}
              </table>
            </div>
            {/* Pagination Component */}
            {filteredWarehouses.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredWarehouses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCustomizeOpen} onOpenChange={handleCustomizeOpen}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border/30">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              ⚙️ Customize Display
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Choose which columns to display in your table.
            </p>
          </DialogHeader>

          {fieldLimitAlert && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 font-medium text-center">
              You can select a maximum of 6 fields only!
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 py-6 px-1">
            {[
              { key: "sr", label: "Serial Number" },
              { key: "name", label: "Warehouse" },
              { key: "address", label: "Address" },
              { key: "incharge", label: "Incharge" },
              { key: "itemsInStock", label: "Items in Stock" },
              { key: "PurchaseValue", label: "Value" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer border border-transparent hover:border-primary/30 hover:bg-primary/5"
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
                  className="peer appearance-none w-5 h-5 border border-gray-300 dark:border-gray-700 rounded-md checked:bg-gradient-to-br checked:from-primary checked:to-primary/70 transition-all duration-200 flex items-center justify-center relative
            after:content-['✓'] after:text-white after:font-bold after:text-[11px] after:opacity-0 checked:after:opacity-100 after:transition-opacity"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <Button
            className="w-full mt-2 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl"
            onClick={handleApplyChanges}
          >
            ✨ Apply Changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* Warehouse View */}
      <WarehouseViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        viewWarehouse={viewWarehouse}
      />
    </DashboardLayout>
  );
};

export default WareHouse;
