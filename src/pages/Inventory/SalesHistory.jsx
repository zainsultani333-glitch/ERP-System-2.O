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
  Warehouse,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

const mockSalesData = [
  {
    id: 1,
    invoiceNo: "INV-001",
    saleDate: "2025-10-18",
    customerName: "John Doe",
    quantitySold: 20,
    salePrice: "€120",
    marginProfit: "€20",
  },
  {
    id: 2,
    invoiceNo: "INV-002",
    saleDate: "2025-10-25",
    customerName: "Emma Smith",
    quantitySold: 12,
    salePrice: "€95",
    marginProfit: "€15",
  },
];

const SalesHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredSales = mockSalesData.filter(
    (s) =>
      s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => toast.success("Sales report downloaded!");
  const handleSaveSale = () => {
    toast.success("Sales record saved successfully!");
    setIsAddOpen(false);
  };
  const handleEdit = (id) => toast.success(`Editing record #${id}`);
  const handleDelete = (id) => toast.error(`Deleting record #${id}`);
  const handleView = (id) => toast.info(`Viewing details for record #${id}`);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Sales History
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Track product-wise sales, quantity, and profit margin
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Invoices
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {mockSalesData.length}
                </p>
              </div>
              <Package className="w-5 h-5 text-blue-600" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Sales
                </p>
                <p className="text-2xl font-bold text-green-900">
                  €
                  {mockSalesData
                    .reduce(
                      (sum, s) =>
                        sum + parseFloat(s.salePrice.replace(/[^\d.]/g, "")),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-amber-700">
                  Total Profit
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  €
                  {mockSalesData
                    .reduce(
                      (sum, s) =>
                        sum + parseFloat(s.marginProfit.replace(/[^\d.]/g, "")),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-amber-600" />
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                placeholder="Search by invoiceNo or customerName..."
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
                <Warehouse className="w-5 h-5 text-primary" />
                Sales Records
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {filteredSales.length} entries
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Sr
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Invoice No
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Sale Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Sale Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Margin / Profit
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredSales.map((s) => (
                    <tr
                      key={s.id}
                      className="group hover:bg-primary/5 transition-all duration-300 ease-in-out"
                    >
                      <td className="px-6 py-4 font-semibold">{s.id}</td>
                        <td className="px-6 py-4 font-semibold">{s.invoiceNo}</td>
                      <td className="px-6 py-4">{s.saleDate}</td>
                      <td className="px-6 py-4">{s.customerName}</td>
                      <td className="px-6 py-4">{s.quantitySold}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">
                        {s.salePrice}
                      </td>
                      <td className="px-6 py-4 text-amber-600 font-medium">
                        {s.marginProfit}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(s.id)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSales.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium text-lg">
                    No sales records found
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or add a new sale entry
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

export default SalesHistory;
