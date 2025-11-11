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

  // Columns that will be shown by default
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "invoiceNo",
    "saleDate",
    "customerName",
    "quantitySold",
    "salePrice",
    "marginProfit",
  ]);

  // Temporary selection when opening dialog
  const [tempVisibleFields, setTempVisibleFields] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [fieldLimitAlert, setFieldLimitAlert] = useState(false);

  const handleDownload = () => toast.success("Sales report downloaded!");
  const handleSaveSale = () => {
    toast.success("Sales record saved successfully!");
    setIsAddOpen(false);
  };
  const handleEdit = (id) => toast.success(`Editing record #${id}`);
  const handleDelete = (id) => toast.error(`Deleting record #${id}`);
  const handleView = (id) => toast.info(`Viewing details for record #${id}`);

  const handleCustomizeOpen = (open) => {
    setIsCustomizeOpen(open);
    if (open) {
      setTempVisibleFields([...visibleFields]); // copy current visible fields
    }
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
              Sales History
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Track product-wise sales, quantity, and profit margin
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6">
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
              {/* Left: Title */}
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-primary" />
                Sales Records
              </CardTitle>

              {/* Right: Entries + Customize */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {filteredSales.length} entries
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                  <tr>
                    {visibleFields.includes("sr") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Sr
                      </th>
                    )}
                    {visibleFields.includes("invoiceNo") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Invoice No
                      </th>
                    )}
                    {visibleFields.includes("saleDate") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Sale Date
                      </th>
                    )}
                    {visibleFields.includes("customerName") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Customer Name
                      </th>
                    )}
                    {visibleFields.includes("quantitySold") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Quantity Sold
                      </th>
                    )}
                    {visibleFields.includes("salePrice") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Sale Price
                      </th>
                    )}
                    {visibleFields.includes("marginProfit") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                        Margin / Profit
                      </th>
                    )}
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {filteredSales.map((s, index) => (
                    <tr
                      key={s.id}
                      className="group hover:bg-primary/5 transition-all duration-300 ease-in-out"
                    >
                      {visibleFields.includes("sr") && (
                        <td className="px-6 py-4 font-semibold">{index + 1}</td>
                      )}
                      {visibleFields.includes("invoiceNo") && (
                        <td className="px-6 py-4 font-semibold">{s.invoiceNo}</td>
                      )}
                      {visibleFields.includes("saleDate") && (
                        <td className="px-6 py-4">{s.saleDate}</td>
                      )}
                      {visibleFields.includes("customerName") && (
                        <td className="px-6 py-4">{s.customerName}</td>
                      )}
                      {visibleFields.includes("quantitySold") && (
                        <td className="px-6 py-4">{s.quantitySold}</td>
                      )}
                      {visibleFields.includes("salePrice") && (
                        <td className="px-6 py-4 text-green-600 font-medium">{s.salePrice}</td>
                      )}
                      {visibleFields.includes("marginProfit") && (
                        <td className="px-6 py-4 text-amber-600 font-medium">{s.marginProfit}</td>
                      )}
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
              Choose which columns to display in your sales table.
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
              { key: "sr", label: "Sr" },
              { key: "invoiceNo", label: "Invoice No" },
              { key: "saleDate", label: "Sale Date" },
              { key: "customerName", label: "Customer Name" },
              { key: "quantitySold", label: "Quantity Sold" },
              { key: "salePrice", label: "Sale Price" },
              { key: "marginProfit", label: "Margin / Profit" },
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

export default SalesHistory;
