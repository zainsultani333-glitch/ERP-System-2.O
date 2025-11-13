import { useState, useCallback, useEffect } from "react";
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
  User,
  Mail,
  MapPin,
  Globe,
  Users,
  AlertCircle,
  List,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import CustomerViewModal from "./Models/CustomerDefinationModal";
import { Loader } from "lucide-react";
import Pagination from "../../components/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "../../Api/AxiosInstance";

const CustomerDefinition = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 8;
  const filteredCustomers = customerList.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
    customerLocations: 0,
  });

  const handleDownload = () => toast.success("Customer report downloaded!");

  // Loader
  const TableLoader = ({ message = "Loading...", colSpan = 6 }) => {
    return (
      <tr>
        <td colSpan={colSpan} className="py-20 text-center">
          <div className="flex flex-col items-center justify-center">
            <Loader className="w-10 h-10 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              {message}
            </p>
          </div>
        </td>
      </tr>
    );
  };

  // For Customize Popup
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "customerName",
    "contactPerson",
    "email",
    "country",
    "customerType",
    "category",
  ]);
  const [tempVisibleFields, setTempVisibleFields] = useState([]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [fieldLimitAlert, setFieldLimitAlert] = useState(false);


  // 🟢 Fetch Customer Data
  const fetchCustomerList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers");
      console.log("Res", response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map((item) => ({
          id: item._id,
          customerCode: item.customerCode || "-",
          customerName: item.customerName || "-",
          contactPerson: item.contactPerson || "-",
          email: item.email || "-",
          billingAddress: item.billingAddress || "-",
          country: item.country || "-",
          vatNumber: item.vatNumber || "-",
          customerType: item.customerType || "-",
          vatRegime: item.vatRegime || "-",
          defaultVatRate: item.defaultVatRate || "-",
          paymentTerms: item.paymentTerms || "-",
          categoryId: item.categoryId || item.category || null, // 👈 capture the category id
          createdAt: new Date(item.createdAt).toLocaleDateString(),
        }));

        setCustomerList(formattedData);

        // ✅ Set summary values
        setSummary({
          totalCustomers: response.data.summary?.totalCustomers || 0,
          newCustomers: response.data.summary?.newCustomers || 0,
          activeCustomers: response.data.summary?.activeCustomers || 0,
          customerLocations: response.data.summary?.customerLocations || 0,
        });
      } else {
        console.warn("⚠️ Unexpected API response structure:", response.data);
        setCustomerList([]);
        setSummary({
          totalCustomers: 0,
          newCustomers: 0,
          activeCustomers: 0,
          customerLocations: 0,
        });
      }
    } catch (error) {
      console.error("❌ Failed to fetch Customers:", error);
      setSummary({
        totalCustomers: 0,
        newCustomers: 0,
        activeCustomers: 0,
        customerLocations: 0,
      });
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  }, []);

  useEffect(() => {
    fetchCustomerList();
  }, [fetchCustomerList]);
  0;

  // Customer Code Increment
  useEffect(() => {
    if (customerList.length > 0) {
      // Extract numbers from codes like "CUST001"
      const codes = customerList
        .map((c) => parseInt(c.customerCode?.replace(/\D/g, ""), 10))
        .filter((n) => !isNaN(n));

      const maxCode = Math.max(...codes, 0); // find the largest numeric part
      const nextCode = `CUST${String(maxCode + 1).padStart(3, "0")}`;

      setNewCustomer((prev) => ({
        ...prev,
        customerCode: nextCode,
      }));
    } else {
      // No customers yet → start with first code
      setNewCustomer((prev) => ({
        ...prev,
        customerCode: "CUST001",
      }));
    }
  }, [customerList]);

  // Customer From States
  const [newCustomer, setNewCustomer] = useState({
    customerCode: "",
    customerName: "",
    contactPerson: "",
    email: "",
    billingAddress: "",
    country: "",
    vatNumber: "",
    customerType: "",
    vatRegime: "",
    defaultVatRate: "",
    paymentTerms: "",
    categoryId: "", // ✅ Add this
  });

  // Clear From
  const clearForm = () => {
    setNewCustomer({
      customerCode: "",
      customerName: "",
      contactPerson: "",
      email: "",
      billingAddress: "",
      country: "",
      vatNumber: "",
      customerType: "",
      vatRegime: "",
      defaultVatRate: "",
      paymentTerms: "",
      categoryId: "", // reset
    });
    setEditingCustomer(null);
  };

  // Handle Add Button
  const handleSaveCustomer = async () => {
    try {
      setSaving(true); // start loader
      const payload = {
        customerCode: newCustomer.customerCode,
        customerName: newCustomer.customerName,
        contactPerson: newCustomer.contactPerson,
        email: newCustomer.email,
        billingAddress: newCustomer.billingAddress,
        country: newCustomer.country,
        vatNumber: newCustomer.vatNumber,
        customerType: newCustomer.customerType,
        vatRegime: newCustomer.vatRegime,
        defaultVatRate: newCustomer.defaultVatRate,
        paymentTerms: newCustomer.paymentTerms,
        categoryId: newCustomer.categoryId || "", // include category
      };

      console.log(
        "Saving customer payload (JSON):",
        JSON.stringify(payload, null, 2)
      );

      if (editingCustomer) {
        // ✏️ Update existing customer
        await api.put(`/customers/${editingCustomer.id}`, payload);
        toast.success("Customer updated successfully!");
      } else {
        // ➕ Add new customer
        await api.post("/customers", payload);
        toast.success("Customer added successfully!");
      }

      // Close modal, reset form and refresh list
      setIsAddOpen(false);
      clearForm();
      setEditingCustomer(null);
      fetchCustomerList();
    } catch (error) {
      console.error("❌ Failed to save customer:", error);
      toast.error("Failed to save customer");
    } finally {
      setSaving(false); // stop loader
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      console.log("Delete response:", response.data);
      toast.success("Customer deleted successfully!");
      // Remove deleted customer from list
      setCustomerList((prev) => prev.filter((c) => c.id !== id));
      fetchCustomerList();
    } catch (error) {
      console.error("❌ Failed to delete customer:", error.response || error);
      toast.error("Failed to delete customer");
    }
  };

  // Handle Edit
  const handleEdit = (id) => {
    const customer = customerList.find((c) => c.id === id);
    if (!customer) return toast.error("Customer not found!");

    setNewCustomer({
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      contactPerson: customer.contactPerson,
      email: customer.email,
      billingAddress: customer.billingAddress,
      country: customer.country,
      vatNumber: customer.vatNumber,
      customerType: customer.customerType,
      vatRegime: customer.vatRegime,
      defaultVatRate: customer.defaultVatRate,
      paymentTerms: customer.paymentTerms,
      categoryId: customer.categoryId || "",
    });

    setEditingCustomer(customer); // mark as editing
    setIsAddOpen(true); // open the modal
  };

  // Handle View
  const handleView = (customerId) => {
    const customer = customerList.find((c) => c.id === customerId);
    setViewCustomer(customer);
    setIsViewOpen(true);
  };

  const handleCustomizeOpen = (open) => {
    setIsCustomizeOpen(open);
    if (open) {
      // Show the currently visible 6 fields as checked
      setTempVisibleFields([...visibleFields]);
    } else {
      // Reset temporary state when dialog closes without applying
      setTempVisibleFields([]);
    }
  };

  const handleApplyChanges = () => {
    setVisibleFields(tempVisibleFields);
    setIsCustomizeOpen(false);
    toast.success("Display settings updated!");
  };


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Search Bar
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to page 1 on every new search
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Customer Definition
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Manage customer records, billing, and VAT details
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
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    Add New Customer
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Customer Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Code */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Customer Code
                      </Label>
                      <Input
                        placeholder="CUST001"
                        value={newCustomer.customerCode}
                        readOnly
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200x"
                      />
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Customer Name
                      </Label>
                      <Input
                        placeholder="Ali Traders"
                        value={newCustomer.customerName}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            customerName: e.target.value,
                          })
                        }
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Contact Person
                      </Label>
                      <Input
                        placeholder="Enter number"
                        value={newCustomer.contactPerson}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value)) { // only digits allowed
                            setNewCustomer({
                              ...newCustomer,
                              contactPerson: value,
                            });
                          }
                        }}
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        placeholder="contact@customer.com"
                        value={newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            email: e.target.value,
                          })
                        }
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Billing Address
                      </Label>
                      <Input
                        placeholder="Street 12, Karachi"
                        value={newCustomer.billingAddress}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            billingAddress: e.target.value,
                          })
                        }
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Country
                      </Label>
                      <Input
                        placeholder="Pakistan"
                        value={newCustomer.country}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            country: e.target.value,
                          })
                        }
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* VAT Number */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        VAT Number
                      </Label>
                      <Input
                        placeholder="VAT12345"
                        value={newCustomer.vatNumber}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            vatNumber: e.target.value,
                          })
                        }
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Customer Type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Customer Type
                      </Label>
                      <Select
                        value={newCustomer.customerType}
                        onValueChange={(value) =>
                          setNewCustomer({
                            ...newCustomer,
                            customerType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* VAT Regime */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        VAT Regime
                      </Label>
                      <Select
                        value={newCustomer.vatRegime}
                        onValueChange={(value) =>
                          setNewCustomer({ ...newCustomer, vatRegime: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select regime" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0%">0%</SelectItem>
                          <SelectItem value="Local VAT">Local VAT</SelectItem>
                          <SelectItem value="VAT Margin">VAT Margin</SelectItem>
                          <SelectItem value="Customer Local Rate">
                            Customer Local Rate
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Default VAT Rate */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Default VAT Rate (%)
                      </Label>
                      <Input
                        placeholder="17"
                        value={newCustomer.defaultVatRate}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            defaultVatRate: e.target.value,
                          })
                        }
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Payment Terms */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Payment Terms
                      </Label>
                      <Select
                        value={newCustomer.paymentTerms}
                        onValueChange={(value) =>
                          setNewCustomer({
                            ...newCustomer,
                            paymentTerms: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Net 30 days">
                            Net 30 days
                          </SelectItem>
                          <SelectItem value="Due on receipt">
                            Due on receipt
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium flex items-center justify-center gap-2"
                    onClick={handleSaveCustomer}
                    disabled={saving} // prevent double click
                  >
                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                    {saving
                      ? editingCustomer
                        ? "Updating..."
                        : "Saving..."
                      : editingCustomer
                        ? "Update Customer"
                        : "Save Customer"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-6">
          {/* Total Customers */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-blue-900">{summary.totalCustomers}</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Customers This Month */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    New Customers (This Month)
                  </p>
                  <p className="text-2xl font-bold text-green-900">{summary.newCustomers}</p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <UserPlus className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Customers */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">
                    Active Customers
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {summary.activeCustomers}
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Locations */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Customer Locations
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {summary.customerLocations}
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
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
                placeholder="Search by customer name, contact, email, country..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                value={searchTerm}
                onChange={handleSearch} // ✅ use the handler
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5 text-primary" />
                Customer Directory
              </CardTitle>
              <div className="flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium"
                >
                  {filteredCustomers.length} customers
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCustomizeOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl text-white transition-all duration-200"
                >
                  Customize
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                <tr>
                  {visibleFields.includes("sr") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Sr
                    </th>
                  )}
                  {visibleFields.includes("customerName") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Customer Name
                    </th>
                  )}
                  {visibleFields.includes("contactPerson") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Contact Person
                    </th>
                  )}
                  {visibleFields.includes("email") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Email
                    </th>
                  )}
                  {visibleFields.includes("country") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Country
                    </th>
                  )}
                  {visibleFields.includes("customerType") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Customer Type
                    </th>
                  )}
                  {visibleFields.includes("vatNumber") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      VAT Number
                    </th>
                  )}
                  {visibleFields.includes("vatRegime") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      VAT Regime
                    </th>
                  )}
                  {visibleFields.includes("vatRate") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      VAT Rate (%)
                    </th>
                  )}
                  {visibleFields.includes("paymentTerms") && (
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      Payment Terms
                    </th>
                  )}
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              {loading ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={visibleFields.length + 1}
                      className="py-20 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Loader className="w-10 h-10 text-primary animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">
                          Fetching customers...
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-border/30">
                  {currentCustomers.map((c, index) => (
                    <tr
                      key={c.id}
                      className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                    >
                      {visibleFields.includes("sr") && (
                        <td className="px-6 py-4 font-semibold">
                          {indexOfFirstItem + index + 1}
                        </td>
                      )}
                      {visibleFields.includes("customerName") && (
                        <td className="px-6 py-4">{c.customerName}</td>
                      )}
                      {visibleFields.includes("contactPerson") && (
                        <td className="px-6 py-4">{c.contactPerson}</td>
                      )}
                      {visibleFields.includes("email") && (
                        <td className="px-6 py-4">{c.email}</td>
                      )}
                      {visibleFields.includes("country") && (
                        <td className="px-6 py-4">{c.country}</td>
                      )}
                      {visibleFields.includes("customerType") && (
                        <td className="px-6 py-4">{c.customerType}</td>
                      )}
                      {visibleFields.includes("vatNumber") && (
                        <td className="px-6 py-4">{c.vatNumber}</td>
                      )}
                      {visibleFields.includes("vatRegime") && (
                        <td className="px-6 py-4">{c.vatRegime}</td>
                      )}
                      {visibleFields.includes("vatRate") && (
                        <td className="px-6 py-4">{c.defaultVatRate}%</td>
                      )}
                      {visibleFields.includes("paymentTerms") && (
                        <td className="px-6 py-4">{c.paymentTerms}</td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(c.id)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-all duration-200 rounded-lg"
                            title="View Customer"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(c.id)}
                            className="h-8 w-8 p-0 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-all duration-200 rounded-lg"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(c.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 text-gray-600 hover:text-red-700 transition-all duration-200 rounded-lg"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
            {/* Pagination Component */}
            {filteredCustomers.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredCustomers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCustomizeOpen} onOpenChange={handleCustomizeOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-900/80 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl transition-all duration-500 ease-in-out">
          <DialogHeader className="pb-3 border-b border-border/30">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                ⚙️
              </span>
              Customize Display
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 pl-10">
              Choose which columns to display in your customer directory.
            </p>
          </DialogHeader>

          {fieldLimitAlert && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 font-medium text-center animate-fadeIn">
              You can select a maximum of 7 fields only!
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 py-6 px-1">
            {[
              { key: "sr", label: "Sr" },
              { key: "customerName", label: "Customer Name" },
              { key: "contactPerson", label: "Contact Person" },
              { key: "email", label: "Email" },
              { key: "country", label: "Country" },
              { key: "customerType", label: "Customer Type" },
              { key: "vatNumber", label: "VAT Number" },
              { key: "vatRegime", label: "VAT Regime" },
              { key: "vatRate", label: "VAT Rate (%)" },
              { key: "paymentTerms", label: "Payment Terms" },
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
                      } else if (prev.length >= 7) {
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

          <Button
            className="w-full mt-2 py-3 bg-gradient-to-r from-primary via-primary/80 to-primary/70 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/40 hover:-translate-y-[1px] transition-all duration-300"
            onClick={handleApplyChanges}
          >
            ✨ Apply Changes
          </Button>
        </DialogContent>
      </Dialog>

      <CustomerViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        customer={viewCustomer}
      />
    </DashboardLayout>
  );
};

export default CustomerDefinition;
