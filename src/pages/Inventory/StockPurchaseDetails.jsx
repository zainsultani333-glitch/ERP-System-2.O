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
  MoreVertical,
  RefreshCw,
  Store,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "../../Api/AxiosInstance";
import { useAuth } from "../../context/AuthContext";
import StockViewModal from "./Models/StockViewModal";
import Pagination from "../../components/Pagination";

const StockPurchaseDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    totalItems: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    storesInConsignment: 0,
  });
  const [itemNames, setItemNames] = useState([]);
  const [itemNameLoading, setItemNameLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStockId, setEditStockId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [openingStock, setOpeningStock] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [minStockLevel, setMinStockLevel] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const { token } = useAuth();

  // Fetch stock data
  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory/items/stock");
      if (res.data.success) {
        setStockData(res.data.data);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      } else {
        toast.error("Failed to fetch inventory data");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Error fetching stock data");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);
  // fetch item name
  // console.log(stockData, "data");

  const fetchItemNames = async () => {
    try {
      setItemNameLoading(true);
      const res = await api.get("/inventory/items/name");
      if (res.data.success) {
        setItemNames(res.data.data);
      } else {
        toast.error("Failed to fetch item names");
      }
    } catch (error) {
      console.error("Error fetching item names:", error);
      toast.error("Error fetching item names");
    } finally {
      setTimeout(() => setItemNameLoading(false), 500);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setWarehouseLoading(true);
      const res = await api.get("/warehouses/name");
      if (res.data.success) {
        setWarehouses(res.data.data);
      } else {
        toast.error("Failed to fetch warehouses");
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast.error("Error fetching warehouses");
    } finally {
      setTimeout(() => setWarehouseLoading(false), 500);
    }
  };

  useEffect(() => {
    if (isAddOpen) {
      fetchWarehouses();
    }
  }, [isAddOpen]);

  // item name useeffect call first time
  useEffect(() => {
    fetchItemNames();
  }, []);

  const filteredStock = stockData.filter(
    (item) =>
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- Calculate paginated data ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStock = filteredStock.slice(startIndex, endIndex);

  // ✅ Fields visibility state
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "itemCode",
    "itemName",
    "openingStock",
    "purchaseRate",
    "sellingPrice",
    "wholesalePrice",
    "location",
    "minStock",
    "actions",
  ]);

  // Temporary selection when opening dialog
  const [tempVisibleFields, setTempVisibleFields] = useState([]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [fieldLimitAlert, setFieldLimitAlert] = useState(false);

  const handleCustomizeOpen = (open) => {
    setIsCustomizeOpen(open);
    if (open) {
      setTempVisibleFields(visibleFields); // copy current visible fields
    }
  };

  const handleApplyChanges = () => {
    setVisibleFields(tempVisibleFields);
    setIsCustomizeOpen(false);
    toast.success("Display settings updated!");
  };

  const handleDownload = () => {
    toast.success("Stock & purchase report downloaded!");
  };

  const handleSaveStock = async () => {
    try {
      setSaving(true);

      // 🧩 Validation
      if (
        !selectedItem ||
        !selectedWarehouse ||
        !openingStock ||
        !purchaseRate ||
        !sellingPrice ||
        !wholesalePrice ||
        !minStockLevel
      ) {
        toast.error("All fields are required before saving!");
        return;
      }

      let itemId;

      // 🧩 If adding new stock → find item ID
      if (!isEditMode) {
        const item = itemNames.find((i) => i.itemName === selectedItem);
        if (!item?._id) {
          toast.error("Invalid item selected!");
          return;
        }
        itemId = item._id;
      } else {
        // 🧩 If editing → use existing stock ID
        itemId = editStockId;
      }

      // 🧩 Find warehouse ID
      const warehouse = warehouses.find(
        (w) => w.warehouseName === selectedWarehouse
      );
      if (!warehouse?._id) {
        toast.error("Invalid warehouse selected!");
        return;
      }

      const payload = {
        openingStock: Number(openingStock),
        purchaseRate: Number(purchaseRate),
        sellingPrice: Number(sellingPrice),
        wholesalePrice: Number(wholesalePrice),
        warehouseId: warehouse._id,
        minStockLevel: Number(minStockLevel),
      };

      // 🧩 Single unified API call
      const res = await api.put(`/inventory/items/stock/${itemId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        toast.success("Stock details updated successfully!");
        fetchStock();
        setIsAddOpen(false);

        // Reset form
        setSelectedItem("");
        setSelectedWarehouse("");
        setOpeningStock("");
        setPurchaseRate("");
        setSellingPrice("");
        setWholesalePrice("");
        setMinStockLevel("");
        setIsEditMode(false);
        setEditStockId(null);
      } else {
        toast.error(res.data.message || "Failed to update stock");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error updating stock:", error);
      toast.error(
        error.response?.data?.message || "Server error while updating stock"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (itemId) => {
    const stockToEdit = stockData.find((s) => s._id === itemId);
    if (!stockToEdit) {
      toast.error("Stock entry not found!");
      return;
    }
    // console.log(stockToEdit);

    // ✅ Set edit mode
    setIsEditMode(true);
    setEditStockId(itemId);
    setIsAddOpen(true);

    // Prefill all fields
    setSelectedItem(stockToEdit.itemName || "");
    setSelectedWarehouse(stockToEdit?.warehouseId?.warehouseName || "");
    setOpeningStock(stockToEdit.openingStock?.toString() || "");
    setPurchaseRate(stockToEdit.purchaseRate?.toString() || "");
    setSellingPrice(stockToEdit.sellingPrice?.toString() || "");
    setWholesalePrice(stockToEdit.wholesalePrice?.toString() || "");
    setMinStockLevel(stockToEdit.minStockLevel?.toString() || "");
  };

  const handleDelete = async (ItemId) => {
    // console.log(ItemId);

    try {
      setLoading(true);
      toast.loading("Deleting product...");
      const res = await api.delete(`/inventory/items/${ItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss(); // remove loader

      if (res.data?.success) {
        toast.success("Stock deleted successfully!");
        fetchStock(); // refresh table
      } else {
        toast.error(res.data?.message || "Failed to delete Stock");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error deleting Stock:", error);
      toast.error(
        error.response?.data?.message || "Server error while deleting"
      );
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleView = (itemId) => {
    const stock = stockData.find((s) => s._id === itemId);
    if (!stock) {
      toast.error("Stock item not found!");
      return;
    }
    setSelectedStock(stock);
    setIsViewOpen(true);
  };

  const handleRestock = (itemId) => {
    toast.success(`Initiating restock for #${itemId}`);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock) return "critical";
    if (stock <= minStock * 2) return "warning";
    return "healthy";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Stock & Purchase Details
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manage opening stock, pricing, and stock alerts
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
              {itemNames.length > 0 && (
                <DialogTrigger
                  onClick={() => {
                    // 🧠 Reset edit mode whenever adding new entry
                    setIsEditMode(false);
                    setEditStockId(null);

                    // 🧼 Optional — clear input fields
                    setSelectedItem("");
                    setSelectedWarehouse("");
                    setOpeningStock("");
                    setPurchaseRate("");
                    setSellingPrice("");
                    setWholesalePrice("");
                    setMinStockLevel("");
                  }}
                  asChild
                >
                  <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock Entry
                  </Button>
                </DialogTrigger>
              )}

              <DialogContent className="max-w-2xl max-h-full overflow-y-scroll bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    {isEditMode
                      ? "Edit Stock & Purchase Details"
                      : "Add Stock & Purchase Details"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Item Code & Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Item Name
                      </Label>

                      {itemNameLoading ? (
                        <div className="flex justify-center items-center h-12 border rounded-lg bg-muted/30">
                          <Loader className="w-5 h-5 text-primary animate-spin mr-2" />
                        </div>
                      ) : isEditMode ? (
                        // 🧩 In edit mode, show item name as a readonly input
                        <Input
                          value={selectedItem}
                          readOnly
                          className="border-2 bg-muted/50 text-foreground "
                        />
                      ) : (
                        // 🧩 In add mode, show dropdown select
                        <Select
                          value={selectedItem}
                          onValueChange={setSelectedItem}
                        >
                          <SelectTrigger className="bg-muted/50 border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                            <SelectValue placeholder="Select Item" />
                          </SelectTrigger>
                          <SelectContent>
                            {itemNames.length > 0 ? (
                              itemNames.map((item) => (
                                <SelectItem
                                  key={item._id}
                                  value={item.itemName}
                                  className="hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                  {item.itemName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No items found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {/* Opening Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Opening Stock Quantity
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={openingStock}
                        onChange={(e) => setOpeningStock(e.target.value)}
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Warehouse className="w-4 h-4" />
                        Stores in Consignment
                      </Label>
                      {warehouseLoading ? (
                        <div className="flex justify-center items-center h-12 border rounded-lg bg-muted/30">
                          <Loader className="w-5 h-5 text-primary animate-spin mr-2" />
                        </div>
                      ) : (
                        <Select
                          value={selectedWarehouse}
                          onValueChange={setSelectedWarehouse}
                        >
                          <SelectTrigger className="bg-muted/50 border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                            <SelectValue placeholder="Select stock location" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.length > 0 ? (
                              warehouses.map((wh) => (
                                <SelectItem
                                  key={wh._id}
                                  value={wh.warehouseName}
                                  className="hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                  {wh.warehouseName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No warehouses found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Purchase Rate (excl. VAT)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={purchaseRate}
                        onChange={(e) => setPurchaseRate(e.target.value)}
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Selling / Retail Price
                      </Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Wholesale Price (Optional)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={wholesalePrice}
                        onChange={(e) => setWholesalePrice(e.target.value)}
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Min Stock Level */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Minimum Stock Level (Alert Trigger)
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minStockLevel}
                      onChange={(e) => setMinStockLevel(e.target.value)}
                      className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium flex items-center justify-center"
                    onClick={handleSaveStock}
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {isEditMode ? "Updating..." : "Saving..."}
                      </div>
                    ) : isEditMode ? (
                      "Update Stock"
                    ) : (
                      "Save Stock Details"
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
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.totalItems || 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Total Stock Value
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    € {summary.totalStockValue.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">
                    Low Stock Items
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {summary.lowStockItems || 0}
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Stores in Consignment
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {summary.storesInConsignment || 0}
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Store className="w-5 h-5 text-purple-600" />
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
                placeholder="Search by item code or name..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // ✅ Reset page to first when searching
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stock Table with Actions Field */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-primary" />
                Stock Inventory
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {filteredStock.length} items
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCustomizeOpen(true);
                  }}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl text-white transition-all duration-200"
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
                    {visibleFields.includes("itemCode") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Item Code
                      </th>
                    )}
                    {visibleFields.includes("itemName") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Item Name
                      </th>
                    )}
                    {visibleFields.includes("openingStock") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Opening Stock
                      </th>
                    )}
                    {visibleFields.includes("purchaseRate") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Purchase Rate
                      </th>
                    )}
                    {visibleFields.includes("sellingPrice") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Selling Price
                      </th>
                    )}
                    {visibleFields.includes("wholesalePrice") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Wholesale Price
                      </th>
                    )}
                    {visibleFields.includes("location") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Location
                      </th>
                    )}
                    {visibleFields.includes("minStock") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Min Stock
                      </th>
                    )}
                    {visibleFields.includes("actions") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Loader className="w-10 h-10 text-primary animate-spin mb-3" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredStock.length > 0 ? (
                    currentStock.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                      >
                        {visibleFields.includes("sr") && (
                          <td className="px-6 py-4 font-semibold">
                            {startIndex + index + 1}
                          </td>
                        )}

                        {visibleFields.includes("itemCode") && (
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                              {item.itemCode || "-"}
                            </div>
                          </td>
                        )}

                        {visibleFields.includes("itemName") && (
                          <td className="px-6 py-4">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                              {item.itemName || "-"}
                            </div>
                          </td>
                        )}

                        {visibleFields.includes("openingStock") && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-lg ${
                                  getStockStatus(
                                    item.openingStock,
                                    item.minStockLevel
                                  ) === "critical"
                                    ? "text-red-600"
                                    : getStockStatus(
                                        item.openingStock,
                                        item.minStockLevel
                                      ) === "warning"
                                    ? "text-amber-600"
                                    : "text-green-600"
                                }`}
                              >
                                {item.openingStock || "-"}
                              </span>
                              {getStockStatus(
                                item.openingStock,
                                item.minStockLevel
                              ) === "critical" && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </td>
                        )}

                        {visibleFields.includes("purchaseRate") && (
                          <td className="px-6 py-4">
                            €{item.purchaseRate ?? "-"}
                          </td>
                        )}
                        {visibleFields.includes("sellingPrice") && (
                          <td className="px-6 py-4">
                            €{item.sellingPrice ?? "-"}
                          </td>
                        )}
                        {visibleFields.includes("wholesalePrice") && (
                          <td className="px-6 py-4">
                            €{item.wholesalePrice ?? "-"}
                          </td>
                        )}
                        {visibleFields.includes("location") && (
                          <td className="px-6 py-4">
                            {item?.warehouseId?.warehouseAddress || "-"}
                          </td>
                        )}
                        {visibleFields.includes("minStock") && (
                          <td className="px-6 py-4">
                            {item.minStockLevel || "-"}
                          </td>
                        )}

                        {visibleFields.includes("actions") && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(item._id)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item._id)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {getStockStatus(
                                item.openingStock,
                                item.minStockLevel
                              ) === "critical" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestock(item._id)}
                                  title="Restock"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item._id)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-12">
                        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground font-medium text-lg">
                          No stock items found
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your search terms or add a new stock
                          entry
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredStock.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
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
              Choose which columns to display in your stock table.
            </p>
          </DialogHeader>

          {/* Alert for max fields */}
          {fieldLimitAlert && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 font-medium text-center animate-fadeIn">
              You can select a maximum of 6 fields only!
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3 py-6 px-1">
            {[
              { key: "sr", label: "Sr" },
              { key: "itemCode", label: "Item Code" },
              { key: "itemName", label: "Item Name" },
              { key: "openingStock", label: "Opening Stock" },
              { key: "purchaseRate", label: "Purchase Rate" },
              { key: "sellingPrice", label: "Selling Price" },
              { key: "wholesalePrice", label: "Wholesale Price" },
              { key: "location", label: "Location" },
              { key: "minStock", label: "Min Stock" },
              { key: "actions", label: "Actions" },
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
                        setFieldLimitAlert(true);
                        setTimeout(() => setFieldLimitAlert(false), 2500);
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

          {/* Apply Button */}
          <Button
            className="w-full mt-2 py-3 bg-gradient-to-r from-primary via-primary/80 to-primary/70 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/40 hover:-translate-y-[1px] transition-all duration-300"
            onClick={handleApplyChanges}
          >
            ✨ Apply Changes
          </Button>
        </DialogContent>
      </Dialog>
      {/* stockView */}
      <StockViewModal
        isOpen={isViewOpen}
        onClose={setIsViewOpen}
        stock={selectedStock}
      />
    </DashboardLayout>
  );
};

export default StockPurchaseDetails;
