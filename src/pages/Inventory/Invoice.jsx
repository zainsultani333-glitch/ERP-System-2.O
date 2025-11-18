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
import InvoiceViewModal from "../Inventory/Models/InvoiceViewModal";

const Invoice = () => {
  const [qtyError, setQtyError] = useState("");

  const [saving, setSaving] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [itemsList, setItemsList] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("Draft");
  const [activeTab, setActiveTab] = useState("all");
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const itemsPerPage = 8;

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sendingEmail, setSendingEmail] = useState(false);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState([]);
  const [draftInvoices, setDraftInvoices] = useState([]);
  const [finalInvoices, setFinalInvoices] = useState([]);
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
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [vatRate, setVatRate] = useState("");

  // Auto-calculated totals
  const [totalExclVAT, setTotalExclVAT] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [totalInclVAT, setTotalInclVAT] = useState(0);

  // Multiple items list
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [size, setSize] = useState("");

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

  // Fetch items from inventory
  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      const res = await api.get("/inventory/items", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setItemsList(res.data.data || []);
      } else {
        toast.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Items fetch error:", error);
      toast.error("Error fetching items");
    } finally {
      setItemsLoading(false);
    }
  };

  // Remove item from array
  const handleRemoveItem = (index) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
    toast.success("Item removed");
  };

  // fetch invoice
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory/invoice", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        console.log("Data ", res.data?.data);

        const allInvoices = res.data.data || [];
        setInvoiceData(allInvoices);

        // Split into draft and final invoices
        const drafts = allInvoices.filter(
          (inv) => inv.status === "Draft" || !inv.status
        );
        const finals = allInvoices.filter((inv) => inv.status === "Final");

        setDraftInvoices(drafts);
        setFinalInvoices(finals);
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
    if (!isEditMode && isAddOpen) {
      if (status === "Final" && invoiceData.length > 0) {
        const maxNo = Math.max(
          ...invoiceData.map((inv) => {
            const match = inv.invoiceNo?.match(/INV-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
        );
        setInvoiceNo(`INV-${(maxNo + 1).toString().padStart(3, "0")}`);
      } else {
        setInvoiceNo("INV-DRAFT");
      }
    }
  }, [invoiceData, isAddOpen, isEditMode, status]);

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
    if (isAddOpen) {
      fetchCustomers();
      fetchItems();
    }
  }, [isAddOpen]);

  // Auto-fill VAT Number & VAT Regime on customer selection
  useEffect(() => {
    if (!selectedCustomer) return;

    const selected = customerList.find((c) => c._id === selectedCustomer);
    if (selected) {
      setCustomerVAT(selected.vatNumber || "");
      setVatRegime(selected.vatRegime || "");
    }
  }, [selectedCustomer, customerList]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddOpen) {
      // Reset all form states
      setInvoiceItems([]);
      setSelectedCustomer("");
      setCustomerVAT("");
      setVatRegime("");
      setStatus("Draft");
      setItemId("");
      setQuantity("");
      setUnitPrice("");
      setVatRate("");
      setTotalExclVAT(0);
      setVatAmount(0);
      setAvailableSizes([]);
      setTotalInclVAT(0);
      setIsEditMode(false);
      setEditingInvoiceId(null);
      setInvoiceDate(new Date().toISOString().split("T")[0]);
    }
  }, [isAddOpen]);

  // Handle Edit Invoice
  const handleEdit = async (invoice) => {
    try {
      setIsEditMode(true);
      setEditingInvoiceId(invoice._id);

      // Fetch complete invoice data from API
      const response = await api.get(`/inventory/invoice/${invoice._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) {
        throw new Error("Failed to fetch invoice details");
      }

      const fullInvoice = response.data.data;
      console.log("Full invoice data:", fullInvoice);

      // Populate form with existing invoice data
      setSelectedCustomer(fullInvoice.customer?._id || fullInvoice.customer);
      setCustomerVAT(fullInvoice.customerVAT || "");
      setVatRegime(fullInvoice.items?.[0]?.vatRegime || "Local");
      setStatus(fullInvoice.status || "Draft");
      setInvoiceDate(
        fullInvoice.invoiceDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0]
      );

      // Set invoice items
      if (fullInvoice.items && fullInvoice.items.length > 0) {
        const formattedItems = fullInvoice.items.map((item) => ({
          itemId: item.itemId?._id || item.itemId,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRegime: item.vatRegime,
          vatRate: item.vatRate,
          totalExclVAT: item.totalExclVAT || item.quantity * item.unitPrice,
          vatAmount:
            item.vatAmount || item.quantity * item.unitPrice * item.vatRate,
          totalInclVAT:
            item.totalInclVAT ||
            item.quantity * item.unitPrice * (1 + item.vatRate),
        }));
        setInvoiceItems(formattedItems);
      }

      setInvoiceNo(fullInvoice.invoiceNo || "INV-DRAFT");
      setIsAddOpen(true);

      toast.success("Invoice loaded for editing");
    } catch (error) {
      console.error("Error setting up edit:", error);
      toast.error("Error loading invoice for editing");
    }
  };

  const handleEditItem = async (index, item) => {
    setEditingItemIndex(index);

    setItemId(item.itemId);
    setSize(item.size);
    setQuantity(item.quantity.toString());
    setUnitPrice(item.unitPrice.toString());
    setVatRegime(item.vatRegime);
    setVatRate(item.vatRate.toString());

    // 🚀 Load category sizes for edit mode
    const selectedItem = itemsList.find((it) => it._id === item.itemId);
    if (selectedItem) {
      try {
        const res = await api.get(
          `/categories/sizes-available/${selectedItem.category.replace(
            /\s+/g,
            ""
          )}`
        );
        setAvailableSizes(res.data.data?.sizes || []);
      } catch (err) {
        console.log("Size fetch failed:", err);
        setAvailableSizes([]);
      }
    }

    toast.success("Item loaded for editing.");
  };

  // Update handleAddItem to handle both add and update
  const handleAddItem = () => {
    if (!itemId || !quantity || !unitPrice) {
      toast.error("Please fill all item fields");
      return;
    }
    if (!vatRegime) {
      toast.error("Select a VAT regime");
      return;
    }

    const selectedItem = itemsList.find((item) => item._id === itemId);

    const newItem = {
      itemId,
      size: size || selectedItem?.itemName || "Item",
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      vatRegime: vatRegime,
      vatRate: Number(vatRate),
      totalExclVAT,
      vatAmount,
      totalInclVAT,
      size,
    };

    if (editingItemIndex !== null) {
      // Update existing item
      const updatedItems = [...invoiceItems];
      updatedItems[editingItemIndex] = newItem;
      setInvoiceItems(updatedItems);
      setEditingItemIndex(null);
      toast.success("Item updated successfully!");
    } else {
      // Add new item
      setInvoiceItems([...invoiceItems, newItem]);
      toast.success("Item added successfully!");
    }

    // Reset fields
    resetItemForm();
  };

  // Reset item form function
  const resetItemForm = () => {
    setItemId("");
    setSize("");
    setQuantity("");
    setUnitPrice("");
    setVatRate("");
    setVatRegime("");
    setTotalExclVAT(0);
    setVatAmount(0);
    setTotalInclVAT(0);
    setEditingItemIndex(null);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddOpen) {
      // Reset all form states
      setInvoiceItems([]);
      setSelectedCustomer("");
      setCustomerVAT("");
      setVatRegime("");
      setStatus("Draft");
      setAvailableSizes([]);
      resetItemForm(); // Use the new reset function
      setIsEditMode(false);
      setEditingInvoiceId(null);
      setInvoiceDate(new Date().toISOString().split("T")[0]);
    }
  }, [isAddOpen]);

  // Update the Add Item button text dynamically
  const getAddButtonText = () => {
    return editingItemIndex !== null ? "Update Item" : "Add Item";
  };
  // Handle Update Invoice
  const handleUpdateInvoice = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    try {
      const payload = {
        status: status,
        companyCode: "VE",
        invoiceDate: invoiceDate,
        customer: selectedCustomer,
        items: invoiceItems.map((item) => ({
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRegime: vatRegime,
          vatRate: item.vatRate,
        })),
      };

      console.log("Updating invoice:", payload);

      const response = await api.put(
        `/inventory/invoice/draft/${editingInvoiceId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Invoice updated successfully!");
        setIsAddOpen(false);
        fetchInvoices();
      } else {
        toast.error(response.data.message || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error(error.response?.data?.message || "Error updating invoice");
    }
  };

  // Handle Finalize Invoice
  const handleFinalizeInvoice = async (invoiceId) => {
    try {
      toast.loading("Finalizing invoice...");

      const response = await api.put(
        `/inventory/invoice/finalize/${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.dismiss();
      if (response.data.success) {
        toast.success("Invoice finalized successfully!");
        fetchInvoices();
      } else {
        toast.error(response.data.message || "Failed to finalize invoice");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error finalizing invoice:", error);
      toast.error(error.response?.data?.message || "Error finalizing invoice");
    }
  };

  // Handle Delete Invoice
  const handleDeleteInvoice = async (invoiceId) => {
    try {
      toast.loading("Deleting invoice...");

      const response = await api.delete(`/inventory/invoice/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss();
      if (response.data.success) {
        toast.success("Invoice deleted successfully!");
        fetchInvoices();
      } else {
        toast.error(response.data.message || "Failed to delete invoice");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error deleting invoice:", error);
      toast.error(error.response?.data?.message || "Error deleting invoice");
    }
  };

  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        status,
        companyCode: "VE",
        invoiceDate,
        customer: selectedCustomer,
        items: invoiceItems.map((item) => ({
          itemId: item.itemId,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRegime: item.vatRegime, // ✅ FIXED
          vatRate: item.vatRate,
        })),
      };

      // Only send invoiceNo if it's Final AND available
      if (status === "Final" && invoiceNo && invoiceNo !== "INV-DRAFT") {
        payload.invoiceNo = invoiceNo;
      }

      console.log("Sending payload:", payload);

      let response;

      // =============================
      // 🚀 FINAL INVOICE LOGIC
      // =============================

      if (status === "Final") {
        if (!editingInvoiceId) {
          toast.error("Cannot finalize without invoice ID / draft first!");
          return;
        }

        response = await api.post(
          `/inventory/invoice/finalize/${editingInvoiceId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // =============================
      // 📝 DRAFT LOGIC
      // =============================
      else {
        if (isEditMode && editingInvoiceId) {
          // Update draft
          response = await api.put(
            `/inventory/invoice/draft/${editingInvoiceId}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          // Create new draft
          response = await api.post(`/inventory/invoice/draft`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }
      }

      if (response.data.success) {
        toast.success(
          `Invoice ${
            status === "Final" ? "finalized" : isEditMode ? "updated" : "saved"
          } successfully!`
        );
        setIsAddOpen(false);
        fetchInvoices();
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Invoice Error:", error);
      toast.error(error.response?.data?.message || "Error saving invoice");
    } finally {
      setSaving(false);
    }
  };

  const filteredInvoice = invoiceData
    .map((inv) => ({
      _id: inv._id,
      invoiceNo: inv.invoiceNo,
      date: new Date(inv.invoiceDate).toLocaleDateString(),
      customerName: inv.customer?.customerName || inv.customerName,
      phoneNumber: inv.customer?.phoneNumber,
      size: inv.items?.[0]?.size || "-",
      quantity: inv.items?.[0]?.quantity || 0,
      unit: inv?.items[0].unitPrice,
      vatRate: inv.items?.[0]?.vatRate || 0,
      totalExclVAT: inv.netTotal,
      vatAmount: inv.vatTotal,
      totalInclVAT: inv.grandTotal,
      status: inv.status || "draft",
    }))
    .filter(
      (invoice) =>
        invoice.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredDrafts = draftInvoices
    .map((inv) => ({
      _id: inv._id,
      invoiceNo: inv.invoiceNo,
      date: new Date(inv.invoiceDate).toLocaleDateString(),
      customerName: inv.customer?.customerName || inv.customerName,
      phoneNumber: inv.customer?.phoneNumber,
      size: inv.items?.[0]?.size || "-",
      quantity: inv.items?.[0]?.quantity || 0,
      unit: inv?.items[0].unitPrice,
      vatRate: inv.items?.[0]?.vatRate || 0,
      totalExclVAT: inv.netTotal,
      vatAmount: inv.vatTotal,
      totalInclVAT: inv.grandTotal,
      status: "draft",
    }))
    .filter(
      (invoice) =>
        invoice.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredFinals = finalInvoices
    .map((inv) => ({
      _id: inv._id,
      invoiceNo: inv.invoiceNo,
      date: new Date(inv.invoiceDate).toLocaleDateString(),
      customerName: inv.customer?.customerName || inv.customerName,
      phoneNumber: inv.customer?.phoneNumber,
      size: inv.items?.[0]?.size || "-",
      quantity: inv.items?.[0]?.quantity || 0,
      unit: inv?.items[0].unitPrice,
      vatRate: inv.items?.[0]?.vatRate || 0,
      totalExclVAT: inv.netTotal,
      vatAmount: inv.vatTotal,
      totalInclVAT: inv.grandTotal,
      status: "final",
    }))
    .filter(
      (invoice) =>
        invoice.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Get current invoices based on active tab
  const getCurrentInvoices = () => {
    let invoicesToShow = [];
    if (activeTab === "all") {
      invoicesToShow = filteredInvoice;
    } else if (activeTab === "draft") {
      invoicesToShow = filteredDrafts;
    } else if (activeTab === "final") {
      invoicesToShow = filteredFinals;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return invoicesToShow.slice(startIndex, endIndex);
  };

  const getTotalItems = () => {
    if (activeTab === "all") return filteredInvoice.length;
    if (activeTab === "draft") return filteredDrafts.length;
    if (activeTab === "final") return filteredFinals.length;
    return 0;
  };

  const currentInvoices = getCurrentInvoices();

  const handleDownload = async (item) => {
    try {
      if (!item || !item._id) {
        toast.error("No invoice selected for download");
        return;
      }

      toast.loading("Downloading invoice...");

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
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.api+json",
        },
      });

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
    let invoice;
    if (activeTab === "all") {
      invoice = invoiceData.find((inv) => inv.invoiceNo === invoiceNo);
    } else if (activeTab === "draft") {
      invoice = draftInvoices.find((inv) => inv.invoiceNo === invoiceNo);
    } else if (activeTab === "final") {
      invoice = finalInvoices.find((inv) => inv.invoiceNo === invoiceNo);
    }

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
  console.log({ finalInvoices, draftInvoices });

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
                  setEditingInvoiceId(null);
                  setInvoiceNo("");
                }}
                asChild
              >
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-full overflow-y-scroll bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <FileSignature className="w-5 h-5 text-primary" />
                    {isEditMode ? "Edit Invoice" : "Add New Invoice"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                  {/* Invoice No & Date */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Invoice No</Label>
                      <Input
                        value={
                          status === "Final"
                            ? invoiceNo
                            : "Auto-generated when finalized"
                        }
                        readOnly
                        className="border-2 bg-gray-100 cursor-not-allowed"
                        placeholder={
                          status === "Draft"
                            ? "Will be generated when finalized"
                            : "Enter invoice number"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Invoice Date</Label>
                      <Input
                        type="date"
                        value={invoiceDate}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className="border-2"
                      />
                    </div>
                  </div>

                  {/* Customer + VAT Number */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Customer */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer{" "}
                        <span className="text-red-500">*</span>{" "}
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
                          <SelectTrigger className="border-2">
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

                    {/* VAT NUMBER ONLY */}
                    <div className="space-y-1">
                      <Label>Customer VAT Number</Label>
                      <Input
                        value={customerVAT}
                        readOnly
                        className="border-2 bg-muted/50"
                      />
                    </div>
                  </div>

                  {/* ITEM SECTION */}
                  <div className="mt-6 p-4 rounded-lg border bg-muted/30">
                    <h3 className="font-semibold mb-3">Add Item</h3>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Item Selection */}
                      <div className="space-y-2">
                        <Label>Item</Label>
                        {itemsLoading ? (
                          <div className="flex justify-center items-center h-10 border rounded-lg bg-muted/30">
                            <Loader className="w-4 h-4 text-primary animate-spin mr-2" />
                            Loading items...
                          </div>
                        ) : (
                          <Select
                            value={itemId}
                            onValueChange={async (value) => {
                              setItemId(value);

                              const selectedItem = itemsList.find(
                                (item) => item._id === value
                              );

                              if (selectedItem) {
                                setUnitPrice(selectedItem.sellingPrice || 0);

                                // 🚀 GET SIZES FROM CATEGORY API
                                try {
                                  const res = await api.get(
                                    `/categories/sizes-available/${selectedItem.category}`
                                  );

                                  setAvailableSizes(
                                    (res.data.data?.sizes || []).map((s) => ({
                                      size: s.size,
                                      stock: s.stock,
                                    }))
                                  );
                                } catch (err) {
                                  console.log("Size fetch failed:", err);
                                  setAvailableSizes([]); // No sizes found
                                }
                              }
                            }}
                          >
                            <SelectTrigger className="border-2">
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>

                            <SelectContent>
                              {itemsList.length > 0 ? (
                                itemsList.map((item) => (
                                  <SelectItem key={item._id} value={item._id}>
                                    {item.itemCode} - {item.itemName}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem disabled>No items found</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Size Selection */}
                      {/* Size Selection (ONLY show when sizes exist) */}
                      {availableSizes.length > 0 && (
                        <div className="space-y-2">
                          <Label>Size</Label>

                          <Select value={size} onValueChange={setSize}>
                            <SelectTrigger className="border-2">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>

                            <SelectContent>
                              {availableSizes.map((szObj) => (
                                <SelectItem key={szObj.size} value={szObj.size}>
                                  {szObj.size} (Stock: {szObj.stock})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    {/* Qty - Price - VAT Type */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {/* Quantity */}
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const value = Number(e.target.value);

                            const selectedSizeObj = availableSizes.find(
                              (x) => x.size === size
                            );

                            // ❌ If no size selected yet
                            if (!selectedSizeObj) {
                              setQuantity(value);
                              return;
                            }

                            // ❌ Block if > stock
                            if (value > selectedSizeObj.stock) {
                              toast.error(
                                `Only ${selectedSizeObj.stock} units available in stock`
                              );
                              return; // ⛔ STOP — prevents updating state
                            }

                            // ✅ Allowed
                            setQuantity(value);
                            setQtyError("");
                          }}
                          className="border-2"
                        />
                        {qtyError && (
                          <p className="text-red-500 text-sm">{qtyError}</p>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div className="space-y-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value)}
                          className="border-2"
                        />
                      </div>

                      {/* VAT TYPE */}
                      <div className="space-y-2">
                        <Label>VAT Regime</Label>
                        <Select
                          value={vatRegime}
                          onValueChange={(value) => {
                            setVatRegime(value);
                            if (value === "Exemption") setVatRate(0);
                            if (value === "Local") setVatRate(20);
                            if (value === "Margin") setVatRate(0);
                            if (value === "Non-local individual") {
                              const c = customerList.find(
                                (x) => x._id === selectedCustomer
                              );
                              setVatRate(c?.defaultVatRate || 0);
                            }
                          }}
                        >
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select VAT Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Exemption">
                              Exemption (0%)
                            </SelectItem>
                            <SelectItem value="Local">Local VAT</SelectItem>
                            <SelectItem value="Margin">Margin</SelectItem>
                            <SelectItem value="Non-local Individual">
                              Non-local Individual (Customer VAT)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* VAT RATE & TOTALS */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {/* VAT Rate */}
                      <div className="space-y-2">
                        <Label>VAT Rate (%)</Label>
                        <Input
                          type="number"
                          value={vatRate}
                          onChange={(e) => setVatRate(e.target.value)}
                          className="border-2"
                        />
                      </div>

                      {/* Total Excl VAT */}
                      <div className="space-y-2">
                        <Label>Total Excl. VAT</Label>
                        <Input
                          value={totalExclVAT}
                          readOnly
                          className="border-2 bg-gray-100"
                        />
                      </div>

                      {/* VAT Amount */}
                      <div className="space-y-2">
                        <Label>VAT Amount</Label>
                        <Input
                          value={vatAmount}
                          readOnly
                          className="border-2 bg-gray-100"
                        />
                      </div>
                    </div>

                    {/* Total Incl VAT */}
                    <div className="space-y-2 mt-4">
                      <Label>Total Incl. VAT</Label>
                      <Input
                        value={totalInclVAT}
                        readOnly
                        className="border-2 bg-gray-100"
                      />
                    </div>

                    {/* Add Item */}
                    {/* Add Item Button */}
                    <Button
                      onClick={handleAddItem}
                      className="mt-4 w-full bg-primary text-white"
                    >
                      {getAddButtonText()}
                    </Button>

                    {/* ITEMS LIST */}
                    {invoiceItems.length > 0 && (
                      <div className="mt-4 border rounded-lg p-3 bg-white">
                        <h4 className="font-semibold mb-3">Added Items</h4>
                        <table className="w-full border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-left">Item</th>
                              {/* 🔥 Auto-hide Size column */}
                              {invoiceItems.some((it) => it.size) && (
                                <th className="p-2 text-left">Size</th>
                              )}
                              <th className="p-2 text-left">Qty</th>
                              <th className="p-2 text-left">Price</th>
                              <th className="p-2 text-left">VAT Rate</th>
                              <th className="p-2 text-left">Total</th>

                              <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoiceItems.map((it, i) => {
                              const itemName =
                                itemsList.find((item) => item._id === it.itemId)
                                  ?.itemName || it.itemId;
                              return (
                                <tr key={i} className="border-t">
                                  <td className="p-2">{itemName}</td>
                                  {/* 🔥 Auto-hide Size column */}
                                  {invoiceItems.some((x) => x.size) && (
                                    <td className="p-2">{it.size || "-"}</td>
                                  )}
                                  <td className="p-2">{it.quantity}</td>
                                  <td className="p-2">€{it.unitPrice}</td>
                                  <td className="p-2">{it.vatRate}%</td>
                                  <td className="p-2 font-semibold">
                                    €{it.totalInclVAT?.toFixed(2)}
                                  </td>
                                  <td className="p-2">
                                    <div className="flex gap-1">
                                      {/* Edit Button */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditItem(i, it)}
                                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                        title="Edit Item"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>

                                      {/* Delete Button */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveItem(i)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                        title="Delete Item"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Total Summary */}
                            <tr className="border-t bg-gray-50 font-semibold">
                              <td colSpan="4" className="p-2 text-right">
                                Grand Total:
                              </td>
                              <td className="p-2">
                                €
                                {invoiceItems
                                  .reduce(
                                    (sum, item) => sum + item.totalInclVAT,
                                    0
                                  )
                                  .toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* SAVE BUTTON */}
                  <Button
                    disabled={saving}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium mt-4 flex items-center justify-center"
                    onClick={handleSaveInvoice}
                  >
                    {saving ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {isEditMode ? "Updating..." : "Saving..."}
                      </div>
                    ) : isEditMode ? (
                      "Update Invoice"
                    ) : (
                      "Save Invoice"
                    )}
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
              <div className="flex items-center gap-4">
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
                    variant={activeTab === "draft" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTab("draft");
                      setCurrentPage(1);
                    }}
                  >
                    Draft
                  </Button>
                  <Button
                    variant={activeTab === "final" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTab("final");
                      setCurrentPage(1);
                    }}
                  >
                    Final
                  </Button>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {getTotalItems()} items
                </Badge>
              </div>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Status
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
                  ) : currentInvoices.length > 0 ? (
                    currentInvoices.map((item, i) => (
                      <tr
                        key={item._id || i}
                        className="group whitespace-nowrap hover:bg-primary/5 transition-all duration-300"
                      >
                        <td className="px-6 py-4 font-semibold">
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                            {item.invoiceNo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                          {item.size}
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
                        <td className="px-6 py-4 font-normal text-sm text-center">
                          <div
                            className={`px-2 py-1 rounded-full ${
                              item.status === "Final"
                                ? "bg-green-200 text-green-700"
                                : "bg-orange-300 text-white"
                            }`}
                          >
                            {item?.status}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                          <div className="flex items-center justify-center gap-1">
                            {/* 👁 View - Show for all */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="View"
                              onClick={() => handleView(item.invoiceNo)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            {/* Show different actions based on tab */}
                            {activeTab === "draft" && (
                              <>
                                {/* ✏️ Edit - Only for drafts */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </>
                            )}

                            {activeTab === "final" && (
                              <>
                                {/* ✉️ Share Dropdown - Only for finals */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                      title="Share"
                                    >
                                      {sendingEmail ? (
                                        <Loader className="w-4 h-4 text-primary animate-spin" />
                                      ) : (
                                        <Send className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                  >
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

                                {/* 📥 Download - Only for finals */}
                                <Button
                                  onClick={() => handleDownload(item)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  title="Download"
                                >
                                  <DownloadIcon className="w-4 h-4" />
                                </Button>
                              </>
                            )}

                            {activeTab === "all" && (
                              <>
                                {/* Conditional actions based on status for "all" tab */}
                                {item.status === "Draft" && (
                                  <>
                                    {/* ✏️ Edit - Only for drafts */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                      title="Edit"
                                      onClick={() => handleEdit(item)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}

                                {item.status === "Final" && (
                                  <>
                                    {/* ✉️ Share Dropdown - Only for finals */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                          title="Share"
                                        >
                                          {sendingEmail ? (
                                            <Loader className="w-4 h-4 text-primary animate-spin" />
                                          ) : (
                                            <Send className="w-4 h-4" />
                                          )}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-40"
                                      >
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

                                    {/* 📥 Download - Only for finals */}
                                    <Button
                                      onClick={() => handleDownload(item)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                      title="Download"
                                    >
                                      <DownloadIcon className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </>
                            )}

                            {/* 🗑 Delete - Show for BOTH drafts and finals */}
                            {item.status !== "Final" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                title="Delete"
                                onClick={() => handleDeleteInvoice(item._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
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
                            No {activeTab} invoice items found
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
                totalItems={getTotalItems()}
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
