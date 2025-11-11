import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Package, Warehouse, AlertTriangle, TrendingUp, MapPin, Edit, Trash2, Eye, MoreVertical, RefreshCw, Store } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const mockStockData = [
  {
    id: 1,
    itemCode: "ITM001",
    itemName: "Wireless Mouse",
    openingStock: 50,
    purchaseRate: 480,
    sellingPrice: 750,
    wholesalePrice: 650,
    location: "Main Warehouse",
    minStockLevel: 10,
  },
  {
    id: 2,
    itemCode: "ITM002",
    itemName: "Cotton T-Shirt",
    openingStock: 200,
    purchaseRate: 280,
    sellingPrice: 499,
    wholesalePrice: 420,
    location: "Store Room A",
    minStockLevel: 50,
  },
  {
    id: 3,
    itemCode: "ITM003",
    itemName: "Basmati Rice",
    openingStock: 500,
    purchaseRate: 145,
    sellingPrice: 220,
    wholesalePrice: null,
    location: "Cold Storage",
    minStockLevel: 100,
  },
];

const StockPurchaseDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredStock = mockStockData.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Fields visibility state
  const [visibleFields, setVisibleFields] = useState([
    "sr", "itemCode", "itemName", "openingStock", "purchaseRate",
    "sellingPrice", "wholesalePrice", "location", "minStock", "actions"
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

  const handleSaveStock = () => {
    toast.success("Stock details saved successfully!");
    setIsAddOpen(false);
  };

  const handleEdit = (itemId) => {
    toast.success(`Editing stock entry #${itemId}`);
  };

  const handleDelete = (itemId) => {
    toast.error(`Deleting stock entry #${itemId}`);
  };

  const handleView = (itemId) => {
    toast.info(`Viewing stock details for #${itemId}`);
  };

  const handleRestock = (itemId) => {
    toast.success(`Initiating restock for #${itemId}`);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock) return "critical";
    if (stock <= minStock * 2) return "warning";
    return "healthy";
  };

  const getLocationColor = (location) => {
    const locationMap = {
      "Main Warehouse": "bg-blue-50 text-blue-700 border-blue-200",
      "Store Room A": "bg-purple-50 text-purple-700 border-purple-200",
      "Cold Storage": "bg-cyan-50 text-cyan-700 border-cyan-200",
    };
    return locationMap[location] || "bg-gray-50 text-gray-700 border-gray-200";
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
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    Add Stock & Purchase Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Item Code & Name */}
                  <div className="grid grid-cols-2 gap-4">

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Item Name</Label>
                      <Select>
                        <SelectTrigger className="bg-muted/50 border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="item1">Item 1</SelectItem>
                          <SelectItem value="item2">Item 2</SelectItem>
                          <SelectItem value="item3">Item 3</SelectItem>
                        </SelectContent>
                      </Select>
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
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Warehouse className="w-4 h-4" />
                        Stores in Consignment
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-muted/50 border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                          <SelectValue placeholder="Select stock location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main-warehouse" className="hover:bg-blue-500 hover:text-white">
                            Main Warehouse
                          </SelectItem>
                          <SelectItem value="secondary-warehouse" className="hover:bg-blue-500 hover:text-white">
                            Secondary Warehouse
                          </SelectItem>
                          <SelectItem value="consignment-store" className="hover:bg-blue-500 hover:text-white">
                            Consignment Store
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Purchase Rate (excl. VAT)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Selling / Retail Price</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Wholesale Price (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
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
                      className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                    onClick={handleSaveStock}
                  >
                    Save Stock Details
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
                  <p className="text-sm font-medium text-blue-700">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{mockStockData.length}</p>
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
                  <p className="text-sm font-medium text-green-700">Total Stock Value</p>
                  <p className="text-2xl font-bold text-green-900">
                    PKR {mockStockData.reduce((sum, item) => sum + (item.openingStock * item.purchaseRate), 0).toLocaleString()}
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
                  <p className="text-sm font-medium text-amber-700">Low Stock Items</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {mockStockData.filter(item => item.openingStock <= item.minStockLevel).length}
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
                  <p className="text-sm font-medium text-purple-700">Stores in Consignment</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {new Set(mockStockData.map(item => item.location)).size}
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
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
                    {visibleFields.includes("sr") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Sr</th>}
                    {visibleFields.includes("itemCode") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Item Code</th>}
                    {visibleFields.includes("itemName") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Item Name</th>}
                    {visibleFields.includes("openingStock") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Opening Stock</th>}
                    {visibleFields.includes("purchaseRate") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Purchase Rate</th>}
                    {visibleFields.includes("sellingPrice") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Selling Price</th>}
                    {visibleFields.includes("wholesalePrice") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Wholesale Price</th>}
                    {visibleFields.includes("location") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Location</th>}
                    {visibleFields.includes("minStock") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Min Stock</th>}
                    {visibleFields.includes("actions") && <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {filteredStock.map((item, index) => (
                    <tr key={item.id} className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]">
                      {visibleFields.includes("sr") && <td className="px-6 py-4 font-semibold">{index + 1}</td>}
                      {visibleFields.includes("itemCode") && (
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                            {item.itemCode}
                          </div>
                        </td>
                      )}
                      {visibleFields.includes("itemName") && (
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                            {item.itemName}
                          </div>
                        </td>
                      )}
                      {visibleFields.includes("openingStock") && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-lg ${getStockStatus(item.openingStock, item.minStockLevel) === "critical"
                              ? "text-red-600"
                              : getStockStatus(item.openingStock, item.minStockLevel) === "warning"
                                ? "text-amber-600"
                                : "text-green-600"
                              }`}>
                              {item.openingStock}
                            </span>
                            {getStockStatus(item.openingStock, item.minStockLevel) === "critical" && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </td>
                      )}
                      {visibleFields.includes("purchaseRate") && <td className="px-6 py-4">PKR {item.purchaseRate}</td>}
                      {visibleFields.includes("sellingPrice") && <td className="px-6 py-4">PKR {item.sellingPrice}</td>}
                      {visibleFields.includes("wholesalePrice") && (
                        <td className="px-6 py-4">{item.wholesalePrice ?? "Not set"}</td>
                      )}
                      {visibleFields.includes("location") && (
                        <td className="px-6 py-4">{item.location}</td>
                      )}
                      {visibleFields.includes("minStock") && (
                        <td className="px-6 py-4">{item.minStockLevel}</td>
                      )}
                      {visibleFields.includes("actions") && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(item.id)} title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item.id)} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {getStockStatus(item.openingStock, item.minStockLevel) === "critical" && (
                              <Button variant="ghost" size="sm" onClick={() => handleRestock(item.id)} title="Restock">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>


              {filteredStock.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium text-lg">No stock items found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or add a new stock entry
                  </p>
                </div>
              )}
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


    </DashboardLayout>
  );
};

export default StockPurchaseDetails;