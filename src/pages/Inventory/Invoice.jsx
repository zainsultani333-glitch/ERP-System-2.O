import { useEffect, useRef, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Mail, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import Pagination from "../../components/Pagination";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoicePDFTemplate from "../../components/InvoicePDFTemplate";
import { useAuth } from "../../context/AuthContext";
import api from "../../Api/AxiosInstance";
import InvoiceViewModal from "./Models/InvoiceViewModal";

const Invoice = () => {
  const [exporting, setExporting] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // adjust per your need

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sendingEmail, setSendingEmail] = useState(false);
  const customers = [
    { _id: "cust001", customerName: "John Doe" },
    { _id: "cust002", customerName: "ABC Traders" },
    { _id: "cust003", customerName: "XYZ Pvt Ltd" },
  ];

  const items = [
    { _id: "item001", itemName: "Premium Vegetable Cooking Oil" },
    { _id: "item002", itemName: "Office Chair" },
    { _id: "item003", itemName: "Laptop Stand" },
  ];

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalAmountExclVAT: 0,
    totalVATAmount: 0,
    highValueInvoices: 0,
  });
  const [loading, setLoading] = useState(false);

  // ---------------- FORM STATES ----------------
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerVAT, setCustomerVAT] = useState("");

  const [vatRegime, setVatRegime] = useState("");

  const [itemId, setItemId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [vatRate, setVatRate] = useState("");

  // Auto-calculated totals
  const [totalExclVAT, setTotalExclVAT] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [totalInclVAT, setTotalInclVAT] = useState(0);
  // Multiple items list
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Auto calculate totals
  useEffect(() => {
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const vat = Number(vatRate) || 0;

    const excl = qty * price;
    const vatAmt = (excl * vat) / 100;
    const incl = excl + vatAmt;

    setTotalExclVAT(excl);
    setVatAmount(vatAmt);
    setTotalInclVAT(incl);
  }, [quantity, unitPrice, vatRate]);

  const { token } = useAuth();
  const pdfRef = useRef();

  // Add item to array
  const handleAddItem = () => {
    if (!itemId || !description || !quantity || !unitPrice) {
      toast.error("Please fill all item fields");
      return;
    }

    const newItem = {
      itemId,
      description,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      vatRate: Number(vatRate) / 100, // convert 20 → 0.20
      totalExclVAT,
      vatAmount,
      totalInclVAT,
    };

    setInvoiceItems([...invoiceItems, newItem]);

    // Reset fields
    setItemId("");
    setDescription("");
    setQuantity("");
    setUnitPrice("");
    setVatRate("");
    setTotalExclVAT(0);
    setVatAmount(0);
    setTotalInclVAT(0);

    toast.success("Item added");
  };

  // fetch invoice
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory/invoice", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setInvoiceData(res.data.data || []);
        setSummary(res.data.summary || {});
      } else {
        toast.error("Failed to fetch invoices");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      toast.error("Error fetching invoices");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Auto-generate invoice number based on highest existing number
  useEffect(() => {
    if (!isEditMode) {
      if (invoiceData.length > 0) {
        const maxNo = Math.max(
          ...invoiceData.map((inv) => {
            const match = inv.invoiceNo?.match(/INV-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
        );
        setInvoiceNo(`INV-${(maxNo + 1).toString().padStart(3, "0")}`);
      } else {
        setInvoiceNo("INV-001");
      }
    }
  }, [invoiceData, isAddOpen, isEditMode]);

  // fetch customers

  const fetchCustomers = async () => {
    try {
      setCustomerLoading(true);
      const res = await api.get("/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setCustomerList(res.data.data);
      } else {
        toast.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Customer fetch error:", error);
      toast.error("Error fetching customers");
    } finally {
      setCustomerLoading(false);
    }
  };
  useEffect(() => {
    if (isAddOpen) fetchCustomers();
  }, [isAddOpen]);

  // auto slect the regime and number of vat
  // Auto-fill VAT Number & VAT Regime on customer selection
  useEffect(() => {
    if (!selectedCustomer) return;

    const selected = customerList.find((c) => c._id === selectedCustomer);
    if (selected) {
      setCustomerVAT(selected.vatNumber || "");
      setVatRegime(selected.vatRegime || "");
    }
  }, [selectedCustomer, customerList]);

  const filteredInvoice = invoiceData
    .map((inv) => ({
      _id: inv._id, // ✅ include this
      invoiceNo: inv.invoiceNo,
      date: new Date(inv.invoiceDate).toLocaleDateString(),
      customerName: inv.customer?.customerName || inv.customerName, // ✅ fix
      phoneNumber: inv.customer?.phoneNumber, // ✅ optional: add for WhatsApp
      description: inv.items?.[0]?.description || "-",
      quantity: inv.items?.[0]?.quantity || 0,
      unit: inv?.items[0].unitPrice,
      vatRate: (inv.items?.[0]?.vatRate || 0) * 100,
      totalExclVAT: inv.netTotal,
      vatAmount: inv.vatTotal,
      totalInclVAT: inv.grandTotal,
    }))
    .filter(
      (invoice) =>
        invoice.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoice.slice(startIndex, endIndex);

  const handleSaveInvoice = () => {
    toast.success("Invoice saved successfully!");
    setIsAddOpen(false);
  };

  const handleDownload = async (item) => {
    try {
      if (!item || !item._id) {
        toast.error("No invoice selected for download");
        return;
      }

      toast.loading("Downloading invoice...");

      // ✅ call backend download endpoint
      const response = await api.get(
        `/inventory/invoice/${item._id}/download`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        }
      );

      // ✅ create blob and link for browser download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${item.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss();
      toast.success(`Invoice ${item.invoiceNo} downloaded successfully`);
    } catch (error) {
      toast.dismiss();
      console.error("Error downloading invoice:", error);
      toast.error(
        error.response?.data?.message || "Failed to download invoice PDF"
      );
    }
  };
  const handleExportExcel = async () => {
    try {
      toast.loading("Exporting invoices to Excel...");

      const response = await api.get("/inventory/invoice/export/excel", {
        responseType: "blob", // important for Excel file
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.api+json", // ✅ added header
        },
      });

      // ✅ create Excel file blob and trigger download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Invoices_Report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss();
      toast.success("Invoice report exported successfully!");
    } catch (error) {
      toast.dismiss();
      console.error("Error exporting invoices:", error);
      toast.error("Failed to export Excel report!");
    }
  };

  const handleView = (invoiceNo) => {
    const invoice = invoiceData.find((inv) => inv.invoiceNo === invoiceNo);
    // console.log({invoice});

    if (!invoice) {
      toast.error("Invoice not found!");
      return;
    }
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };
  const handleSendOption = async (type, invoice) => {
    // console.log(invoice);

    if (!invoice) {
      toast.error("No invoice selected");
      return;
    }

    if (type === "email") {
      try {
        setSendingEmail(true);
        toast.loading("Sending invoice via email...");

        const payload = {
          to: invoice.customer?.email || "emanali262770@gmail.com",
          subject: `Your Invoice ${invoice.invoiceNo} from VESTIAIRE ST. HONORÉ`,
          message: `Hello ${
            invoice.customer?.customerName || invoice.customerName || "Customer"
          }, please find your invoice attached.`,
        };

        const response = await api.post(
          `/inventory/invoice/${invoice._id}/send-email`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.dismiss();
        if (response.data.success) toast.success("Email sent successfully!");
        else toast.error(response.data.message || "Failed to send email.");
      } catch (error) {
        toast.dismiss();
        console.error("Email send error:", error);
        toast.error("Error occurred while sending the email.");
      } finally {
        setSendingEmail(false);
      }
    }

    if (type === "whatsapp") {
      // ✅ handle both real and fallback phone
      const phone = invoice.phoneNumber || "03184486979";

      const msg = encodeURIComponent(
        `Hello ${invoice.customerName || "Customer"}, your invoice ${
          invoice.invoiceNo
        } is ready.`
      );

      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
      toast.success("Redirecting to WhatsApp...");
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
              onClick={handleExportExcel}
              className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger
                onClick={() => {
                  setIsEditMode(false);
                  setInvoiceNo(""); // optional reset to re-trigger useEffect
                }}
                asChild
              >
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-full overflow-y-scroll bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
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
                        value={invoiceNo}
                        readOnly
                        className="border-2 bg-gray-100 cursor-not-allowed focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Invoice Date</Label>
                      <Input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                 
                  {/* Customer + VAT Number + VAT Regime */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Customer Select */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer
                      </Label>

                      {customerLoading ? (
                        <div className="flex justify-center items-center h-12 border rounded-lg bg-muted/30">
                          <Loader className="w-5 h-5 text-primary animate-spin mr-2" />
                        </div>
                      ) : (
                        <Select
                          value={selectedCustomer}
                          onValueChange={setSelectedCustomer}
                        >
                          <SelectTrigger className=" border-2 focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>

                          <SelectContent>
                            {customerList.length > 0 ? (
                              customerList.map((c) => (
                                <SelectItem key={c._id} value={c._id}>
                                  {c.customerName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem disabled>
                                No customers found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* VAT Number + VAT Regime on same line */}
                    <div className="space-y-1">
                      <Label>VAT Number + VAT Regime</Label>

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={customerVAT}
                          readOnly
                          className="border-2 bg-muted/50"
                          placeholder="VAT Number"
                        />

                        <Input
                          value={vatRegime}
                          readOnly
                          className="border-2 bg-muted/50"
                          placeholder="VAT Regime"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ITEM SECTION */}
                  <div className="mt-6 p-4 rounded-lg border bg-muted/30">
                    <h3 className="font-semibold mb-3">Add Item</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Item</Label>
                        <Select onValueChange={(v) => setItemId(v)}>
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="item001">
                              Premium Vegetable Cooking Oil
                            </SelectItem>
                            <SelectItem value="item002">
                              Office Chair
                            </SelectItem>
                            <SelectItem value="item003">
                              Laptop Stand
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Item description"
                          className="border-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="border-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value)}
                          className="border-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>VAT Rate (%)</Label>
                        <Input
                          type="number"
                          value={vatRate}
                          onChange={(e) => setVatRate(e.target.value)}
                          placeholder="20"
                          className="border-2"
                        />
                      </div>
                    </div>

                    {/* Auto totals */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Total Excl. VAT</Label>
                        <Input
                          value={totalExclVAT}
                          readOnly
                          className="border-2 bg-gray-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>VAT Amount</Label>
                        <Input
                          value={vatAmount}
                          readOnly
                          className="border-2 bg-gray-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Incl. VAT</Label>
                        <Input
                          value={totalInclVAT}
                          readOnly
                          className="border-2 bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* ADD ITEM BUTTON */}
                    <Button
                      onClick={handleAddItem}
                      className="mt-4 w-full bg-primary text-white"
                    >
                      Add Item
                    </Button>

                    {/* DISPLAY ADDED ITEMS */}
                    {invoiceItems.length > 0 && (
                      <div className="mt-4 border rounded-lg p-3 bg-white">
                        <h4 className="font-semibold mb-3">Added Items</h4>
                        <table className="w-full border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-left">Description</th>
                              <th className="p-2 text-left">Qty</th>
                              <th className="p-2 text-left">Price</th>
                              <th className="p-2 text-left">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoiceItems.map((it, index) => (
                              <tr key={index} className="border-t">
                                <td className="p-2">{it.description}</td>
                                <td className="p-2">{it.quantity}</td>
                                <td className="p-2">€{it.unitPrice}</td>
                                <td className="p-2 font-semibold">
                                  €{it.totalInclVAT}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* SAVE BUTTON */}
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
                    {summary.totalInvoices || 0}
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
                    € {summary.totalAmountExclVAT || 0}
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
                    € {summary.totalVATAmount || 0}
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
                    {summary.highValueInvoices || 0}
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
                <thead className="bg-gradient-to-r whitespace-nowrap from-muted/40 to-muted/20 border-b border-border/50">
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
                      Unit Price
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
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <Loader className="w-10 h-10 text-primary animate-spin mb-3" />
                        </div>
                      </td>
                    </tr>
                  ) : filteredInvoice.length > 0 ? (
                    currentInvoices.map((item, i) => (
                      <tr
                        key={item._id || i}
                        className="group hover:bg-primary/5 transition-all duration-300"
                      >
                        <td className="px-6 py-4 font-semibold">
                          {startIndex + i + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                            {item.invoiceNo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                          {item.description}
                        </td>
                        <td className="px-6 py-4">{item.quantity}</td>
                        <td className="px-6 py-4">{item.unit}</td>
                        <td className="px-6 py-4">{item.vatRate}%</td>
                        <td className="px-6 py-4">
                          €{item.totalExclVAT?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          €{item.vatAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          €{item.totalInclVAT?.toLocaleString()}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                          <div className="flex items-center ">
                            {/* ✉️ Send Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="none"
                                  size="sm"
                                  className="flex items-center  text-gray-700"
                                >
                                  {sendingEmail ? (
                                    <Loader className="w-4 h-4 text-primary animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4 text-primary" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() =>
                                    handleSendOption("whatsapp", item)
                                  }
                                >
                                  <MessageCircle className="w-4 h-4 text-green-600" />
                                  <span>WhatsApp</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={() =>
                                    handleSendOption("email", item)
                                  }
                                >
                                  <Mail className="w-4 h-4 text-blue-600" />
                                  <span>Email</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            {/* 👁 View */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="View"
                              onClick={() => handleView(item.invoiceNo)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* ✏️ Edit */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {/* 🗑 Delete */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>

                            {/* 📥 Download */}
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <Info className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground font-medium text-lg">
                            No invoice items found
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Try adjusting your search term or create a new
                            invoice
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredInvoice.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <InvoiceViewModal
        isOpen={isViewOpen}
        onClose={setIsViewOpen}
        invoice={selectedInvoice}
      />
      <InvoicePDFTemplate ref={pdfRef} invoice={selectedInvoice} />
    </DashboardLayout>
  );
};

export default Invoice;
