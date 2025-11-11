import { useRef, useState } from "react";
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
  FileText,
  Calendar,
  User,
  Globe,
  Building2,
  Percent,
  FileSignature,
  Wallet,
  Info,
  Edit,
  Trash2,
  Eye,
  DownloadIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoicePDFTemplate from "../../components/InvoicePDFTemplate";

// Mock Data
const mockInvoiceData = [
  {
    invoiceNo: "INV-001",
    date: "2025-11-11",
    customerName: "John Doe",
    customerCompany: "ABC Traders",
    customerCountry: "France",
    vatNo: "FR123456789",
    vatRate: 20,
    vatRegime: "Local VAT",
    paymentTerms: "Net 30 Days",
    bankDetails: {
      bank: "HSBC",
      accountNumber: "12345673445",
      accountType: "Current",
      currency: "EUR",
      reference: "INV-001",
    },
    items: [
      {
        description: "Wireless Mouse",
        quantity: 2,
        unitPrice: 600,
        vatRate: 20,
        total: 1440,
      },
      {
        description: "Office Chair",
        quantity: 1,
        unitPrice: 15000,
        vatRate: 21,
        total: 18150,
      },
    ],
  },
  {
    invoiceNo: "INV-002",
    date: "2025-11-10",
    customerName: "Emma Watson",
    customerCompany: "Global Furnishers Ltd.",
    customerCountry: "Germany",
    vatNo: "DE987654321",
    vatRate: 19,
    vatRegime: "Customer Local Rate",
    paymentTerms: "Due on Receipt",
    bankDetails: {
      bank: "Deutsche Bank",
      accountNumber: "4455667788",
      accountType: "Business",
      currency: "EUR",
      reference: "INV-002",
    },
    items: [
      {
        description: "Standing Desk",
        quantity: 1,
        unitPrice: 4500,
        vatRate: 19,
        total: 5355,
      },
      {
        description: "LED Desk Lamp",
        quantity: 3,
        unitPrice: 250,
        vatRate: 19,
        total: 892.5,
      },
    ],
  },
];

const Invoice = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const pdfRef = useRef();

  const filteredInvoice = mockInvoiceData
    .map((inv) => {
      // Calculate totals for display compatibility
      const totalExclVAT = inv.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const vatAmount = inv.items.reduce(
        (sum, item) =>
          sum + (item.unitPrice * item.quantity * item.vatRate) / 100,
        0
      );
      const totalInclVAT = totalExclVAT + vatAmount;

      return {
        ...inv,
        itemId: inv.invoiceNo, // For your table "Item / Product" column
        description: inv.customerCompany,
        quantity: inv.items.length,
        unit: "pcs",
        totalExclVAT,
        vatAmount,
        totalInclVAT,
      };
    })
    .filter((invoice) => {
      const matchInvoiceNo = invoice.invoiceNo
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCustomer = invoice.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchItems = invoice.items?.some((it) =>
        it.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return matchInvoiceNo || matchCustomer || matchItems;
    });

  const handleSaveInvoice = () => {
    toast.success("Invoice saved successfully!");
    setIsAddOpen(false);
  };

  const handleDownload = async (item) => {
    try {
      if (!item) {
        toast.error("Please select an invoice to download.");
        return;
      }

      // Set selected invoice and wait for it to render
      setSelectedInvoice(item);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const element = pdfRef.current;
      if (!element) {
        toast.error("PDF element not found!");
        return;
      }

      // ✅ Temporarily show the element so html2canvas can capture it
      element.style.display = "block";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // ✅ Hide again after capture
      element.style.display = "none";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${item.itemId}.pdf`);

      toast.success(`Invoice ${item.itemId} downloaded!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Invoice Management
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Manage invoice creation, VAT regime & customer details
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              //   onClick={handleDownload}
              className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <FileSignature className="w-5 h-5 text-primary" />
                    Add New Invoice
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  {/* Invoice No & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Invoice No</Label>
                      <Input
                        placeholder="INV-001"
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Date</Label>
                      <Input
                        type="date"
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Customer Name & Country */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer Name
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-muted/50 border-2 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cust1">John Doe</SelectItem>
                          <SelectItem value="cust2">ABC Traders</SelectItem>
                          <SelectItem value="cust3">XYZ Pvt Ltd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Customer Country
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-muted/50 border-2 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="france">France</SelectItem>
                          <SelectItem value="germany">Germany</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* VAT Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer VAT No. (optional)</Label>
                      <Input
                        placeholder="FR123456789"
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT Regime</Label>
                      <Select>
                        <SelectTrigger className="bg-muted/50 border-2 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select VAT Regime" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="local">Local VAT</SelectItem>
                          <SelectItem value="margin">VAT Margin</SelectItem>
                          <SelectItem value="customer">
                            Customer Local Rate
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>VAT Rate (%)</Label>
                      <Input
                        type="number"
                        placeholder="20"
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Terms</Label>
                      <Input
                        placeholder="Net 30 Days / Due on Receipt"
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Bank & Notes */}
                  <div className="space-y-2">
                    <Label>Bank Details</Label>
                    <textarea
                      className="w-full rounded-md border-2 p-2 focus:ring-2 focus:ring-primary/20 bg-muted/50"
                      placeholder="Account Name, IBAN, SWIFT..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount Threshold Flag</Label>
                      <Input
                        readOnly
                        value="Auto: True if total > €10,000"
                        className="border-2 bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes / Terms</Label>
                      <textarea
                        className="w-full rounded-md border-2 p-2 focus:ring-2 focus:ring-primary/20 bg-muted/50"
                        placeholder="Optional legal or payment notes..."
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                    onClick={handleSaveInvoice}
                  >
                    Save Invoice
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
                    Total Invoices
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {mockInvoiceData.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Total Amount (Excl. VAT)
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    € 
                    {mockInvoiceData
                      .reduce(
                        (sum, inv) =>
                          sum +
                          inv.items.reduce(
                            (s, item) => s + item.unitPrice * item.quantity,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">
                    Total VAT Amount
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    €
                    {mockInvoiceData
                      .reduce(
                        (sum, inv) =>
                          sum +
                          inv.items.reduce(
                            (s, item) =>
                              s +
                              (item.unitPrice * item.quantity * item.vatRate) /
                                100,
                            0
                          ),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Percent className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    High-Value Invoices
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {
                      mockInvoiceData.filter((i) => i.totalInclVAT > 10000)
                        .length
                    }
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search by item or description..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items Table */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Invoice Items
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {filteredInvoice.length} items
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
                      Item / Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      VAT Rate (%)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Total (Excl. VAT)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      VAT Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Total (Incl. VAT)
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {filteredInvoice.map((item,i) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-primary/5 transition-all duration-300"
                    >
                         <td className="px-6 py-4">{i+1}</td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                          {item.itemId}
                        </div>
                      </td>

                      <td className="px-6 py-4">{item.description}</td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">{item.unit}</td>
                      <td className="px-6 py-4">{item.vatRate}%</td>
                      <td className="px-6 py-4">
                        €{item.totalExclVAT.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        €{item.vatAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        €{item.totalInclVAT.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-[2px]">
                          <Button
                            variant="ghost"
                            size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                           className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                             className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDownload(item)}
                            variant="ghost"
                            size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="Download"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredInvoice.length === 0 && (
                <div className="text-center py-12">
                  <Info className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium text-lg">
                    No invoice items found
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <InvoicePDFTemplate ref={pdfRef} invoice={selectedInvoice} />
    </DashboardLayout>
  );
};

export default Invoice;
