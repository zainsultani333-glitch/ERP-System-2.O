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
  const [invoiceNo, setInvoiceNo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // adjust per your need

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sendingEmail, setSendingEmail] = useState(false);

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

  const { token } = useAuth();
  const pdfRef = useRef();
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

  const filteredInvoice = invoiceData
    .map((inv) => ({
      _id: inv._id, // ✅ include this
      invoiceNo: inv.invoiceNo,
      date: new Date(inv.invoiceDate).toLocaleDateString(),
      customerName: inv.customerName,
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
    if (!invoice) {
      toast.error("No invoice selected");
      return;
    }

    if (type === "email") {
      try {
        setSendingEmail(true);
        toast.loading("Sending invoice via email...");

        const payload = {
          to: invoice.customerEmail || "emanali262770@gmail.com",
          subject: `Your Invoice ${invoice.invoiceNo} from VESTIAIRE ST. HONORÉ`,
          message: `Hello ${
            invoice.customerName || "Customer"
          }, please find your invoice attached.`,
        };

        const response = await api.post(
          `/inventory/invoice/${invoice._id}/send-email`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.dismiss();
        if (response.data.success) toast.success(" Email sent successfully!");
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
      if (!invoice.customerPhone) {
        toast.error("Customer phone number missing!");
        return;
      }
      const msg = encodeURIComponent(
        `Hello ${invoice.customerName}, your invoice ${invoice.invoiceNo} is ready.`
      );
      const phone = invoice.customerPhone.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
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
                        className="border-2 focus:ring-2 focus:ring-primary/20 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Date</Label>
                      <Input
                        type="date"
                        className="border-2 focus:ring-2 focus:ring-primary/20"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
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
