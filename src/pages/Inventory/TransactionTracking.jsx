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
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import api from "../../Api/AxiosInstance";
import Pagination from "../../components/Pagination";
import TransactionViewModal from "./Models/TransactionViewModal";

const TransactionTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalPurchasedQty: 0,
    totalSoldQty: 0,
    totalBalance: 0,
  });
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/inventory/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setTransactionData(res.data.data || []);
          setSummary(res.data.summary || {});
        } else {
          toast.error("Failed to fetch transactions");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        toast.error("Error fetching transactions");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchTransactions();
  }, []);
  // console.log({ transactionData });
  // search
  const filteredData = transactionData.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.itemName?.toLowerCase().includes(term) ||
      item.itemCode?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term) ||
      item.totalPurchasedQty?.toString().includes(term)
    );
  });

  // pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredData.slice(startIndex, endIndex);

  const handleDownload = () =>
    toast.success("Transaction tracking report downloaded!");
  const handleSave = () => {
    toast.success("Transaction details saved successfully!");
    setIsAddOpen(false);
  };
  const handleEdit = (id) => toast.success(`Editing record #${id}`);
  const handleDelete = (id) => toast.error(`Deleting record #${id}`);
  const handleView = (itemCode) => {
    const transaction = transactionData.find((t) => t.itemCode === itemCode);
    if (!transaction) return toast.error("Transaction not found!");
    setSelectedTransaction(transaction);
    setIsViewOpen(true);
  };

  const handleRefresh = (id) => toast.success(`Refreshing data for #${id}`);

  // ✅ Fields visibility state
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "itemName",
    "itemCode",
    "category",
    "totalPurchasedQty",
    "totalSoldQty",
    "currentStockBalance",
    "lastSaleDate",
    "lastPurchaseDate",
  ]);

  const [tempVisibleFields, setTempVisibleFields] = useState([]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [fieldLimitAlert, setFieldLimitAlert] = useState(false);

  const handleCustomizeOpen = (open) => {
    setIsCustomizeOpen(open);
    if (open) setTempVisibleFields(visibleFields); // copy current settings
  };

  const handleApplyChanges = () => {
    setVisibleFields(tempVisibleFields);
    setIsCustomizeOpen(false);
    toast.success("Display settings updated!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Transaction Tracking
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Auto-updated from sales and purchase transactions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.totalProducts || 0}
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
                    Total Purchased Qty
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {summary.totalPurchasedQty || 0}
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Total Sold Qty
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    <p className="text-2xl font-bold text-purple-900">
                      {summary.totalSoldQty || 0}
                    </p>
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300 w-full">
          <CardContent className="p-4">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                placeholder="Search by item name, code, category, or purchased qty..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50
                   bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // ✅ reset pagination
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              {/* Left side: Title */}
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Transaction Records
              </CardTitle>

              {/* Right side: Records + Customize button */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {filteredData.length} records
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustomizeOpen(true)}
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
                  <tr className="whitespace-nowrap">
                    {visibleFields.includes("sr") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Sr
                      </th>
                    )}
                    {visibleFields.includes("itemName") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Item Name
                      </th>
                    )}
                    {visibleFields.includes("itemCode") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Item Code
                      </th>
                    )}
                    {visibleFields.includes("category") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Category
                      </th>
                    )}
                    {visibleFields.includes("totalPurchasedQty") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Total Purchased Qty
                      </th>
                    )}
                    {visibleFields.includes("totalSoldQty") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Total Sold Qty
                      </th>
                    )}
                    {visibleFields.includes("currentStockBalance") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Current Stock Balance
                      </th>
                    )}
                    {visibleFields.includes("lastSaleDate") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Last Sale Date
                      </th>
                    )}
                    {visibleFields.includes("lastPurchaseDate") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Last Purchase Date
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
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
                  ) : currentTransactions.length > 0 ? (
                    currentTransactions.map((item, index) => (
                      <tr
                        key={item.itemCode}
                        className="group hover:bg-primary/5 transition-all duration-300"
                      >
                        {visibleFields.includes("sr") && (
                          <td className="px-6 py-4">
                            {startIndex + index + 1}
                          </td>
                        )}
                        {visibleFields.includes("itemName") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">{item.itemName || "-"}</td>
                        )}
                        {visibleFields.includes("itemCode") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                            <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                              {item.itemCode || "-"}
                            </div>
                          </td>
                        )}
                        {visibleFields.includes("category") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">{item.category || "-"}</td>
                        )}
                        {visibleFields.includes("totalPurchasedQty") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                            {item.totalPurchasedQty ?? "-"}
                          </td>
                        )}
                        {visibleFields.includes("totalSoldQty") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px] text-green-700 font-semibold">
                            {item.totalSoldQty ?? "-"}
                          </td>
                        )}
                        {visibleFields.includes("currentStockBalance") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px] font-bold text-blue-700">
                            {item.currentStockBalance ?? "-"}
                          </td>
                        )}
                        {visibleFields.includes("lastSaleDate") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px] text-sm">
                            {new Date(item.lastSaleDate).toLocaleDateString() || "-"}
                          </td>
                        )}
                        {visibleFields.includes("lastPurchaseDate") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px] text-sm">
                            {new Date(item.lastPurchaseDate).toLocaleDateString() || "-"}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(item.itemCode)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
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
                          No transaction records found
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your search terms or add a new record
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCustomizeOpen} onOpenChange={handleCustomizeOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border/30">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                ⚙️
              </span>
              Customize Display
            </DialogTitle>
            <p className="text-sm text-gray-500 pl-10">
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
              { key: "itemName", label: "Item Name" },
              { key: "itemCode", label: "Item Code" },
              { key: "category", label: "Category" },
              { key: "totalPurchasedQty", label: "Total Purchased Qty" },
              { key: "totalSoldQty", label: "Total Sold Qty" },
              { key: "currentStockBalance", label: "Current Stock Balance" },
              { key: "lastSaleDate", label: "Last Sale Date" },
              { key: "lastPurchaseDate", label: "Last Purchase Date" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="group flex items-center gap-3 p-3 rounded-xl cursor-pointer border border-transparent hover:border-primary/30 hover:bg-primary/5"
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
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary">
                  {label}
                </span>
              </label>
            ))}
          </div>

          <Button
            className="w-full mt-2 py-3 bg-gradient-to-r from-primary via-primary/80 to-primary/70 text-white font-semibold rounded-xl"
            onClick={handleApplyChanges}
          >
            ✨ Apply Changes
          </Button>
        </DialogContent>
      </Dialog>
      {/* view modal */}
      <TransactionViewModal
        isOpen={isViewOpen}
        onClose={setIsViewOpen}
        transaction={selectedTransaction}
      />
    </DashboardLayout>
  );
};

export default TransactionTracking;
