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
  CreditCard,
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
  const [purchaseNo, setPurchaseNo] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [itemId, setItemId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [barcode, setBarcode] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([]);
  // const [categoryInput, setCategoryInput] = useState("");
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
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [isItemEditMode, setIsItemEditMode] = useState(false);
  const [size, setSize] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const { token } = useAuth();

  const handleAddPurchaseItem = () => {
    if (!itemId || !quantity) {
      toast.error("Please fill all Items required fields");
      return;
    }

    const selectedItemName = itemNames.find((x) => x._id === itemId)?.itemName;

    const newItem = {
      itemId,
      itemName: selectedItemName,
      size,
      description,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      barcode,
    };

    // 🔥 EDIT MODE
    if (isItemEditMode && editItemIndex !== null) {
      const updatedList = [...purchaseItems];
      updatedList[editItemIndex] = newItem;
      setPurchaseItems(updatedList);
    } else {
      // 🔥 ADD MODE
      setPurchaseItems([...purchaseItems, newItem]);
    }

    // Reset form
    setItemId("");
    setSize("");
    setDescription("");
    setQuantity("");
    setUnitCost("");
    // setBarcode("");

    setEditItemIndex(null);
    setIsItemEditMode(false);
  };

  // Fetch stock data
  const fetchStock = async () => {
    try {
      setLoading(true);

      let endpoint = "/inventory/purchases";

      if (activeTab === "pending") {
        endpoint = "/inventory/purchases?status=Pending";
      } else if (activeTab === "received") {
        endpoint = "/inventory/purchases?status=Received";
      }

      const res = await api.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setStockData(res.data.data);
        setSummary(res.data.summary || {});
      } else {
        toast.error("Failed to fetch purchase stock");
      }
    } catch (error) {
      toast.error("Error fetching stock data");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);
  useEffect(() => {
    fetchStock();
  }, [activeTab]);

  // fetch item name
  const fetchItemNames = async () => {
    try {
      setItemNameLoading(true);

      // NEW API ENDPOINT
      const res = await api.get("/inventory/items");

      if (res.data.success) {
        // res.data.data = array of items
        setItemNames(res.data.data);
      } else {
        setTimeout(() => {
          toast.error("Failed to fetch item names");
        }, 2000);
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
      const res = await api.get("/warehouses");

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

  const fetchSuppliers = async () => {
    try {
      setSupplierLoading(true);
      const res = await api.get("/suppliers");

      if (res.data.success) {
        setSuppliers(res.data.data);
      } else {
        toast.error("Failed to fetch suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Error fetching suppliers");
    } finally {
      setTimeout(() => setSupplierLoading(false), 500);
    }
  };

  useEffect(() => {
    if (isAddOpen) {
      fetchWarehouses();
      fetchSuppliers();
      fetchItemNames();
    }
  }, [isAddOpen]);
  // select item name auto select decription
  useEffect(() => {
    if (itemId) {
      const item = itemNames.find((i) => i._id === itemId);
      if (item) {
        setDescription(item.description || "");
      }
    }
  }, [itemId, itemNames]);

  // Auto-generate Purchase No based on highest existing number
  useEffect(() => {
    if (!isEditMode) {
      if (stockData.length > 0) {
        const maxNo = Math.max(
          ...stockData.map((p) => {
            const match = p.purchaseNo?.match(/PUR-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
        );

        setPurchaseNo(`PUR-${(maxNo + 1).toString().padStart(3, "0")}`);
      } else {
        setPurchaseNo("PUR-001");
      }
    }
  }, [stockData, isAddOpen, isEditMode]);

  const filteredStock = stockData.filter(
    (p) =>
      p.purchaseNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.supplier?.supplierName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // --- Calculate paginated data ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStock = filteredStock.slice(startIndex, endIndex);

  // ✅ Fields visibility state
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "purchaseNo",
    "supplier",
    "purchaseDate",
    "trackingNumber",
    "status",
    "grandTotal",
    "warehouse",
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

  const handleSavePurchase = async () => {
    try {
      setSaving(true);

      // 🧩 Individual field validation
      if (!purchaseNo.trim()) {
        toast.error("Purchase Number is required");
        return;
      }

      if (!purchaseDate) {
        toast.error("Purchase Date is required");
        return;
      }

      if (!supplier) {
        toast.error("Supplier is required");
        return;
      }

      if (!selectedWarehouse) {
        toast.error("Warehouse is required");
        return;
      }

      // if (!trackingNumber.trim()) {
      //   toast.error("Tracking Number is required");
      //   return;
      // }

      if (purchaseItems.length === 0) {
        toast.error("Please add at least one item");
        return;
      }

      // 🧩 Find warehouse ID
      const warehouse = warehouses.find((w) => w._id === selectedWarehouse);
      if (!warehouse?._id) {
        toast.error("Invalid warehouse selected!");
        return;
      }

      // 🧩 Build payload EXACT like Postman
      const payload = {
        purchaseNo,
        purchaseDate,
        supplier, // supplierId
        warehouse: warehouse._id,
        trackingNumber,
        items: purchaseItems.map((it) => ({
          itemId: it.itemId,
          description: it.description,
          quantity: it.quantity,
          unitCost: it.unitCost,
          barcode: it.barcode,
        })),

        netTotal: purchaseItems.reduce(
          (sum, i) => sum + i.quantity * i.unitCost,
          0
        ),
        vatTotal: 0,
        grandTotal: purchaseItems.reduce(
          (sum, i) => sum + i.quantity * i.unitCost,
          0
        ),
      };

      // 🧩 Correct API (PURCHASE INVOICE)

      let res;

      if (isEditMode && editStockId) {
        // UPDATE MODE (PUT)
        res = await api.put(`/inventory/purchases/${editStockId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // CREATE MODE (POST)
        res = await api.post(`/inventory/purchases`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (res.data.success) {
        toast.success("Purchase added successfully!");
        fetchStock();
        setIsAddOpen(false);

        // Reset
        setPurchaseItems([]);
        setPurchaseNo("");
        setTrackingNumber("");
        setSupplier("");
        setSelectedWarehouse("");
        setPurchaseDate(new Date().toISOString().split("T")[0]);
      } else {
        toast.error(res.data.message || "Failed to add purchase");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Server error while saving purchase"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (purchaseId) => {
    const purchase = stockData.find((p) => p._id === purchaseId);

    if (!purchase) {
      toast.error("Purchase entry not found!");
      return;
    }

    console.log("Editing Purchase:", purchase);

    setIsEditMode(true);
    setEditStockId(purchaseId);
    setIsAddOpen(true);

    // TOP FIELDS
    setPurchaseNo(purchase.purchaseNo || "");
    setPurchaseDate(purchase.purchaseDate?.split("T")[0] || "");
    setSupplier(purchase.supplier?._id || "");
    setSelectedWarehouse(purchase.warehouse?._id || "");
    setTrackingNumber(purchase.trackingNumber || "");

    // ITEMS (convert API to your form structure)
    const formattedItems = purchase.items.map((it) => ({
      itemId: it.itemId._id,
      itemName: it.itemId.itemName,
      description: it.description,
      quantity: it.quantity,
      unitCost: it.unitCost,
      barcode: it.barcode,
    }));

    setPurchaseItems(formattedItems);
  };

  const handleDelete = async (ItemId) => {
    // console.log(ItemId);

    try {
      setLoading(true);
      toast.loading("Deleting product...");
      const res = await api.delete(`/inventory/purchases/${ItemId}`, {
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
    console.log({ stock });

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

  const handleRemoveItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const totalQty = purchaseItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const totalUnitCost = purchaseItems.reduce(
    (sum, item) => sum + Number(item.unitCost),
    0
  );

  const totalAmount = purchaseItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );
  const handleEditItem = (index) => {
    const item = purchaseItems[index];

    setItemId(item.itemId);
    setDescription(item.description);
    setQuantity(item.quantity);
    setUnitCost(item.unitCost);
    // setBarcode(item.barcode);

    setEditItemIndex(index);
    setIsItemEditMode(true);
  };

  useEffect(() => {
    const totalPages = Math.ceil(filteredStock.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredStock]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Stock & Purchase (Purchase Invoice)
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
                  Add Stock & Purchase
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-full overflow-y-scroll bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    {isEditMode
                      ? "Edit Stock & Purchase Details"
                      : "Add Stock & Purchase (Purchase Invoice)"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Purchase No & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Purchase No <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={purchaseNo}
                        onChange={(e) => setPurchaseNo(e.target.value)}
                        placeholder="PUR-001"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Purchase Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="border-2"
                      />
                    </div>
                  </div>

                  {/* Supplier & Warehouse */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Supplier <span className="text-red-500">*</span>
                      </Label>

                      {supplierLoading ? (
                        <div className="flex justify-center items-center h-12 border rounded-lg bg-muted/30">
                          <Loader className="w-5 h-5 text-primary animate-spin mr-2" />
                        </div>
                      ) : (
                        <Select value={supplier} onValueChange={setSupplier}>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select Supplier" />
                          </SelectTrigger>

                          <SelectContent>
                            {suppliers.length > 0 ? (
                              suppliers.map((s) => (
                                <SelectItem
                                  key={s._id}
                                  value={s._id}
                                  className="hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                  {s.supplierName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No suppliers found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Warehouse <span className="text-red-500">*</span>
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
                          <SelectTrigger className=" border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                            <SelectValue placeholder="Select Warehouse" />
                          </SelectTrigger>

                          <SelectContent>
                            {warehouses.length > 0 ? (
                              warehouses.map((wh) => (
                                <SelectItem
                                  key={wh._id}
                                  value={wh._id}
                                  className="hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                  <span>{wh.warehouseName}</span>
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

                  <div className="grid grid-cols-2 gap-4">
                    {/* Tracking Number */}
                    <div className="space-y-2">
                      <Label>Tracking Number</Label>
                      <Input
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="TRK-99221-PK"
                        className="border-2"
                      />
                    </div>
                    {/* Category Input */}
                    {/* <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        type="text"
                        placeholder="Enter category"
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        className="border-2"
                      />
                    </div> */}
                  </div>

                  {/* ITEM SECTION */}
                  <div className="mt-6 p-4 rounded-lg border bg-muted/30">
                    <h3 className="font-semibold mb-3">Add Item</h3>

                    {/* Item + Description (same line) */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Item Select */}
                      <div className="space-y-2">
                        <Label>
                          Item <span className="text-red-500">*</span>
                        </Label>
                        <Select value={itemId} onValueChange={setItemId}>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select Item" />
                          </SelectTrigger>

                          <SelectContent>
                            {itemNameLoading ? (
                              <SelectItem
                                value="loading"
                                disabled
                                className="flex justify-center items-center py-3"
                              >
                                <Loader className="w-5 h-5 text-primary animate-spin" />
                              </SelectItem>
                            ) : itemNames.length > 0 ? (
                              itemNames.map((item) => (
                                <SelectItem key={item._id} value={item._id}>
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
                      </div>

                      {/* Sizes */}
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select onValueChange={(value) => setSize(value)}>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select Size" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="xl">XL</SelectItem>
                            <SelectItem value="xxl">XXL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Quantity - Unit Cost - Barcode */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {/* Qty */}
                      <div className="space-y-2">
                        <Label>
                          Quantity <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="border-2"
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="space-y-2">
                        <Label>Unit Cost</Label>
                        <Input
                          type="number"
                          value={unitCost}
                          onChange={(e) => setUnitCost(e.target.value)}
                          placeholder="0"
                          className="border-2"
                        />
                      </div>

                      {/* Add Item Button */}
                      <Button
                        onClick={handleAddPurchaseItem}
                        className="mt-8 w-full bg-primary text-white"
                      >
                        {isItemEditMode ? "Update Item" : "Add Item"}
                      </Button>

                      {/* Barcode */}
                      {/* <div className="space-y-2">
                        <Label>Barcode</Label>
                        <Input
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          placeholder="BRC-POND-001"
                          className="border-2"
                        />
                      </div> */}
                    </div>

                    {/* Display Added Items */}
                    {purchaseItems.length > 0 && (
                      <div className="mt-4 border rounded-lg p-3 bg-white">
                        <h4 className="font-semibold mb-3">Added Items</h4>
                        <table className="w-full border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-left">Item</th>
                              <th className="p-2 text-left">Size</th>
                              <th className="p-2 text-left">Qty</th>
                              <th className="p-2 text-left">Unit Cost</th>
                              <th className="p-2 text-left">Total</th>
                              <th className="p-2 text-end">Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {purchaseItems.map((it, i) => (
                              <tr key={i} className="border-t">
                                <td className="p-2">{it.itemName}</td>
                                <td className="p-2">{it.size}</td>
                                <td className="p-2">{it.quantity}</td>
                                <td className="p-2">€{it.unitCost}</td>
                                <td className="p-2 font-semibold">
                                  €{it.quantity * it.unitCost}
                                </td>
                                <td className="p-2 flex gap-2 justify-end">
                                  {/* Edit Button */}
                                  <button
                                    onClick={() => handleEditItem(i)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit size={18} />
                                  </button>

                                  {/* Remove Button */}
                                  <button
                                    onClick={() => handleRemoveItem(i)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {purchaseItems.length > 0 && (
                      <>
                        {/* Totals Summary Box */}
                        <div className="mt-4 w-full flex justify-end">
                          <div className="p-4  w-64">
                            <h4 className="font-semibold mb-3 text-gray-700">
                              Summary
                            </h4>

                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Total Qty:</span>
                              <span className="font-semibold">{totalQty}</span>
                            </div>

                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">
                                Total Unit Cost:
                              </span>
                              <span className="font-semibold">
                                €{totalUnitCost}
                              </span>
                            </div>

                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-600">
                                Grand Total:
                              </span>
                              <span className="font-bold text-primary">
                                €{totalAmount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplierInvoice">
                      Supplier Invoice PDF
                    </Label>
                    <Input
                      id="supplierInvoice"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className="border-2"
                    />
                  </div>
                  {/* SAVE BUTTON */}
                  <Button
                    disabled={saving}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium mt-4 flex items-center justify-center"
                    onClick={handleSavePurchase}
                  >
                    {saving ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {isEditMode ? "Updating..." : "Saving..."}
                      </div>
                    ) : isEditMode ? (
                      "Update Purchase"
                    ) : (
                      "Save Purchase"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 gap-y-6">
          {/* Existing 4 cards */}
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
                    € {(summary.totalStockValue ?? 0).toLocaleString()}
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

          {/* New Card: Grand Total Pending */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Grand Total Pending
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    € {(summary.grandTotalPending ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Card: Total Items Pending */}
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700">
                    Total Items Pending
                  </p>
                  <p className="text-2xl font-bold text-teal-900">
                    {summary.totalItemsPending || 0}
                  </p>
                </div>
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-teal-600" />
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

              {/* ⭐ TABS ADDED HERE */}
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTab("all");
                      setCurrentPage(1);
                    }}
                  >
                    All
                  </Button>

                  <Button
                    variant={activeTab === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTab("pending");
                      setCurrentPage(1);
                    }}
                  >
                    Pending
                  </Button>

                  <Button
                    variant={activeTab === "received" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTab("received");
                      setCurrentPage(1);
                    }}
                  >
                    Received
                  </Button>
                </div>

                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {filteredStock.length} items
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Sr
                      </th>
                    )}

                    {visibleFields.includes("purchaseNo") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Purchase No
                      </th>
                    )}

                    {visibleFields.includes("supplier") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Supplier
                      </th>
                    )}

                    {visibleFields.includes("purchaseDate") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Purchase Date
                      </th>
                    )}

                    {visibleFields.includes("trackingNumber") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Tracking No
                      </th>
                    )}

                    {visibleFields.includes("status") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Status
                      </th>
                    )}

                    {visibleFields.includes("grandTotal") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Grand Total
                      </th>
                    )}

                    {visibleFields.includes("warehouse") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Warehouse
                      </th>
                    )}

                    {visibleFields.includes("actions") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y whitespace-nowrap divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="py-20">
                        <div className="flex flex-col items-center justify-center w-full">
                          <Loader className="w-10 h-10 text-primary animate-spin mb-3" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredStock.length > 0 ? (
                    currentStock.map((purchase, index) => (
                      <tr
                        key={purchase._id}
                        className="group hover:bg-primary/5 transition-all duration-300"
                      >
                        {visibleFields.includes("sr") && (
                          <td className="px-6 py-4">
                            {startIndex + index + 1}
                          </td>
                        )}

                        {visibleFields.includes("purchaseNo") && (
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                              {purchase?.purchaseNo || "-"}
                            </div>
                          </td>
                        )}

                        {visibleFields.includes("supplier") && (
                          <td className="px-6 py-4">
                            {purchase?.supplier?.supplierName || "-"}
                          </td>
                        )}

                        {visibleFields.includes("purchaseDate") && (
                          <td className="px-6 py-4">
                            {purchase?.purchaseDate?.split("T")[0] || "-"}
                          </td>
                        )}

                        {visibleFields.includes("trackingNumber") && (
                          <td className="px-6 py-4">
                            {purchase?.trackingNumber || "-"}
                          </td>
                        )}

                        {visibleFields.includes("status") && (
                          <td className="px-6 py-4">
                            <Badge
                              className={`px-2 py-1 ${
                                purchase.status === "Received"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-300 text-gray-600"
                              }`}
                            >
                              {purchase?.status}
                            </Badge>
                          </td>
                        )}

                        {visibleFields.includes("grandTotal") && (
                          <td className="px-6 py-4 font-semibold">
                            € {(purchase?.grandTotal ?? 0).toLocaleString()}
                          </td>
                        )}

                        {visibleFields.includes("warehouse") && (
                          <td className="px-6 py-4">
                            {purchase?.warehouse?.warehouseName || "-"}
                          </td>
                        )}

                        {/* ⭐ UPDATED ACTIONS BY TAB */}
                        {visibleFields.includes("actions") && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              {/* VIEW (Always) */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(purchase._id)}
                              >
                                <Eye size={16} />
                              </Button>

                              {/* EDIT (Only when purchase is Pending) */}
                              {purchase.status === "Pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(purchase._id)}
                                >
                                  <Edit size={16} />
                                </Button>
                              )}

                              {/* DELETE (Always allowed) */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(purchase._id)}
                              >
                                <Trash2 size={16} />
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
                          No purchase stock found
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
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
              { key: "purchaseNo", label: "Purchase No" },
              { key: "supplier", label: "Supplier Name" },
              { key: "purchaseDate", label: "Purchase Date" },
              { key: "trackingNumber", label: "Tracking Number" },
              { key: "status", label: "Status" },
              { key: "grandTotal", label: "Grand Total" },
              { key: "warehouse", label: "Warehouse" },
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
