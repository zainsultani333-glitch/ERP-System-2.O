import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

const mockTransactionData = [
  {
    id: 1,
    totalPurchasedQty: 200,
    totalSoldQty: 150,
    currentStockBalance: 50,
    lastSaleDate: "2025-11-05",
    lastPurchaseDate: "2025-10-28",
  },
  {
    id: 2,
    totalPurchasedQty: 300,
    totalSoldQty: 260,
    currentStockBalance: 40,
    lastSaleDate: "2025-11-06",
    lastPurchaseDate: "2025-10-20",
  },
  {
    id: 3,
    totalPurchasedQty: 500,
    totalSoldQty: 480,
    currentStockBalance: 20,
    lastSaleDate: "2025-11-07",
    lastPurchaseDate: "2025-10-25",
  },
];

const TransactionTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredData = mockTransactionData.filter((item) =>
    item.totalPurchasedQty.toString().includes(searchTerm)
  );

  const handleDownload = () => toast.success("Transaction tracking report downloaded!");
  const handleSave = () => {
    toast.success("Transaction details saved successfully!");
    setIsAddOpen(false);
  };
  const handleEdit = (id) => toast.success(`Editing record #${id}`);
  const handleDelete = (id) => toast.error(`Deleting record #${id}`);
  const handleView = (id) => toast.info(`Viewing transaction details for #${id}`);
  const handleRefresh = (id) => toast.success(`Refreshing data for #${id}`);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Products</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {mockTransactionData.length}
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
                  <p className="text-sm font-medium text-green-700">Total Purchased Qty</p>
                  <p className="text-2xl font-bold text-green-900">
                    {mockTransactionData.reduce((sum, item) => sum + item.totalPurchasedQty, 0)}
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
                  <p className="text-sm font-medium text-purple-700">Total Sold Qty</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {mockTransactionData.reduce((sum, item) => sum + item.totalSoldQty, 0)}
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
       <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                placeholder="Search by totalPurchasedQty..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50
                   bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Transaction Records
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {filteredData.length} records
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                  <tr className=" whitespace-nowrap">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Sr
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Total Purchased Qty
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Total Sold Qty
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Current Stock Balance
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Last Sale Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Last Purchase Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-primary/5 transition-all duration-300"
                    >
                      <td className="px-6 py-4">{item.id}</td>
                      <td className="px-6 py-4">{item.totalPurchasedQty}</td>
                      <td className="px-6 py-4 text-green-700 font-semibold">
                        {item.totalSoldQty}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-700">
                        {item.currentStockBalance}
                      </td>
                      <td className="px-6 py-4 text-sm">{item.lastSaleDate}</td>
                      <td className="px-6 py-4 text-sm">{item.lastPurchaseDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(item.id)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                         
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredData.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium text-lg">
                    No transaction records found
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or add a new record
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TransactionTracking;
