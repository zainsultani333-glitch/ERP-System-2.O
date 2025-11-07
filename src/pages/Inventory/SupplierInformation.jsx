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
} from "lucide-react";
import { toast } from "sonner";

const mockSupplierData = [
  {
    id: 1,
    supplierName: "ABC Traders",
    company: "ABC Distributors Ltd.",
    address: "Plot 22, Industrial Area, Lahore",
    vatNumber: "PK-123456789",
    lastPurchase: "2025-10-22 — €90 excl. VAT",
    avgPurchasePrice: "€85",
    totalPurchasedQty: 420,
    totalSpendings: "€37,800",
    numberOfOrders: 28,
    email: "info@abctraders.com",
    phone: "+92-321-4567890",
  },
  {
    id: 2,
    supplierName: "Mega Supply Co.",
    company: "Mega Supply Pvt Ltd.",
    address: "Main Boulevard, Johar Town, Lahore",
    vatNumber: "PK-987654321",
    lastPurchase: "2025-09-10 — €120 excl. VAT",
    avgPurchasePrice: "€110",
    totalPurchasedQty: 280,
    totalSpendings: "€30,500",
    numberOfOrders: 19,
    email: "support@megasupply.com",
    phone: "+92-333-1122334",
  },
];

const SupplierInformation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredSuppliers = mockSupplierData.filter(
    (s) =>
      s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => toast.success("Supplier report downloaded!");
  const handleSaveSupplier = () => {
    toast.success("Supplier details saved successfully!");
    setIsAddOpen(false);
  };
  const handleEdit = (id) => toast.success(`Editing supplier #${id}`);
  const handleDelete = (id) => toast.error(`Deleting supplier #${id}`);
  const handleView = (id) => toast.info(`Viewing supplier #${id}`);

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
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    Add Supplier Information
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Supplier Name</Label>
                      <Input placeholder="Enter supplier name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input placeholder="Enter company name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input placeholder="Enter supplier address" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>VAT Number</Label>
                      <Input placeholder="Enter VAT / Tax ID" />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Purchase Date & Price</Label>
                      <Input placeholder='e.g. "2025-10-22 — €90 excl. VAT"' />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Average Purchase Price</Label>
                      <Input placeholder="Enter average price" />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Purchased Quantity</Label>
                      <Input placeholder="Enter total quantity" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Spendings</Label>
                      <Input placeholder="Enter total spendings" />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Orders</Label>
                      <Input placeholder="Enter order count" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input placeholder="Enter email address" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile / Phone No</Label>
                      <Input placeholder="Enter contact number" />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                    onClick={handleSaveSupplier}
                  >
                    Save Supplier Details
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Suppliers
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {mockSupplierData.length}
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
                  €
                  {mockSupplierData
                    .reduce(
                      (sum, s) =>
                        sum +
                        parseFloat(s.totalSpendings.replace(/[^\d.]/g, "")),
                      0
                    )
                    .toLocaleString()}
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
                <p className="text-2xl font-bold text-amber-900">€98</p>
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
                  {mockSupplierData.reduce(
                    (sum, s) => sum + s.numberOfOrders,
                    0
                  )}
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
                Supplier Records
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {filteredSuppliers.length} suppliers
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent md:overflow-x-visible">
            <table className="w-full text-sm table-auto md:table-fixed">
              <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[60px]">
                    Sr
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[150px]">
                    Supplier Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[150px]">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[180px]">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[120px]">
                    VAT Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[140px]">
                    Avg Purchase Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[140px]">
                    Total Spendings
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/30">
                {filteredSuppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                  >
                    <td className="px-6 py-4 font-semibold whitespace-nowrap overflow-hidden text-ellipsis ">
                      {s.id}
                    </td>
                    <td className="px-6 py-4 font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
                      {s.supplierName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                      {s.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                      {s.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                      {s.vatNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                      {s.avgPurchasePrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                      {s.totalSpendings}
                    </td>

                    <td className="px-6 py-4 flex items-center gap-1 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(s.id)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(s.id)}
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium text-lg">
                  No suppliers found
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search terms or add a new supplier entry
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SupplierInformation;
