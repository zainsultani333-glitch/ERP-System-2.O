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

import CustomerViewModal from "../Inventory/Models/CustomerDefinationModal";
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
import { toast } from "sonner";

const europeanCountries = [
  "Albania",
  "Andorra",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Belarus",
  "Belgium",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic (Czechia)",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Kazakhstan (partly in Europe)",
  "Kosovo",
  "Latvia",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Moldova",
  "Monaco",
  "Montenegro",
  "Netherlands",
  "North Macedonia",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Russia (partly in Europe)",
  "San Marino",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Turkey (partly in Europe)",
  "Ukraine",
  "United Kingdom",
  "Vatican City",
];

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
      customer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // For Customize Popup
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "customerName",
    "phoneNumber",
    "email",
    "city",
    "postalCode",
    "country",
    "customerType",
    "category",
  ]);
  const [tempVisibleFields, setTempVisibleFields] = useState([]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [fieldLimitAlert, setFieldLimitAlert] = useState(false);

  // Fetch Customer Data
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
          phoneNumber: item.phoneNumber || "-",
          email: item.email || "-",
          billingAddress: item.billingAddress || "-",
          country: item.country || "-",
          city: item.city || "",
          postalCode: item.postalCode || "",
          vatNumber: item.vatNumber || "-",
          customerType: item.customerType || "-",
          vatRegime: item.vatRegime || "-",
          defaultVatRate: item.defaultVatRate || "-",
          paymentTerms: item.paymentTerms || "-",
          categoryId: item.categoryId || item.category || null,
          createdAt: new Date(item.createdAt).toLocaleDateString(),
        }));

        setCustomerList(formattedData);

        setSummary({
          totalCustomers: response.data.summary?.totalCustomers || 0,
          newCustomers: response.data.summary?.newCustomers || 0,
          activeCustomers: response.data.summary?.activeCustomers || 0,
          customerLocations: response.data.summary?.customerLocations || 0,
        });
      } else {
        console.warn(
          "Warning: Unexpected API response structure:",
          response.data
        );
        setCustomerList([]);
        setSummary({
          totalCustomers: 0,
          newCustomers: 0,
          activeCustomers: 0,
          customerLocations: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch Customers:", error);
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
  console.log("Res", customerList);
  useEffect(() => {
    fetchCustomerList();
  }, [fetchCustomerList]);

  // Customer Code Increment
  useEffect(() => {
    if (customerList.length > 0) {
      const codes = customerList
        .map((c) => parseInt(c.customerCode?.replace(/\D/g, ""), 10))
        .filter((n) => !isNaN(n));

      const maxCode = Math.max(...codes, 0);
      const nextCode = `CUST${String(maxCode + 1).padStart(3, "0")}`;

      setNewCustomer((prev) => ({
        ...prev,
        customerCode: nextCode,
      }));
    } else {
      setNewCustomer((prev) => ({
        ...prev,
        customerCode: "CUST001",
      }));
    }
  }, [customerList]);

  // Customer Form States
  const [newCustomer, setNewCustomer] = useState({
    customerCode: "",
    customerName: "",
    phoneNumber: "",
    email: "",
    billingAddress: "",
    city: "",
    postalCode: "",
    country: "",
    vatPrefix: "",
    vatNumber: "",
    customerType: "",
    vatRegime: "",
    defaultVatRate: "",
    paymentTerms: "",
    categoryId: "",
  });

  // Clear Form
  const clearForm = () => {
    setNewCustomer({
      customerCode: "",
      customerName: "",
      phoneNumber: "",
      email: "",
      billingAddress: "",
      city: "",
      postalCode: "",
      country: "",
      vatNumber: "",
      customerType: "",
      vatRegime: "",
      defaultVatRate: "",
      paymentTerms: "",
      categoryId: "",
    });
    setEditingCustomer(null);
  };

  // Handle Add Button
  const handleSaveCustomer = async () => {
    try {
      setSaving(true);
      const payload = {
     
        customerName: newCustomer.customerName,
        phoneNumber: newCustomer.phoneNumber,
        email: newCustomer.email,
        billingAddress: newCustomer.billingAddress,
        city: newCustomer.city,
        postalCode: newCustomer.postalCode,
        country: newCustomer.country,
        vatNumber: `${newCustomer.vatPrefix || ""}${
          newCustomer.vatNumber || ""
        }`,
        customerType: newCustomer.customerType,
        defaultVatRate: newCustomer.defaultVatRate,
      
      };

      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, payload);
        toast.success("Customer updated successfully!");
      } else {
        await api.post("/customers", payload);
        toast.success("Customer added successfully!");
      }

      setIsAddOpen(false);
      clearForm();
      setEditingCustomer(null);
      fetchCustomerList();
    } catch (error) {
      console.error("Failed to save customer:", error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      console.log("Delete response:", response.data);
      toast.success("Customer deleted successfully!");
      setCustomerList((prev) => prev.filter((c) => c.id !== id));
      fetchCustomerList();
    } catch (error) {
      console.error("Failed to delete customer:", error.response || error);
      toast.error("Failed to delete customer");
    }
  };

  // Handle Edit
  const handleEdit = (id) => {
    const customer = customerList.find((c) => c.id === id);
    if (!customer) return toast.error("Customer not found!");

    // --- SPLIT VAT NUMBER (IF EXISTS) ---
    let vatPrefix = "";
    let vatNumeric = "";

    if (customer.vatNumber && customer.vatNumber.length > 2) {
      vatPrefix = customer.vatNumber.substring(0, 2); // first 2 chars (letters)
      vatNumeric = customer.vatNumber.substring(2); // remaining digits
    }

    setNewCustomer({
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      billingAddress: customer.billingAddress,
      city: customer.city || "",
      postalCode: customer.postalCode || "",
      country: customer.country,
      vatPrefix: vatPrefix, // <-- ADD THIS
      vatNumber: vatNumeric, // <-- ADD THIS
      customerType: customer.customerType,
      vatRegime: customer.vatRegime,
      defaultVatRate: customer.defaultVatRate,
      paymentTerms: customer.paymentTerms,
      categoryId: customer.categoryId || "",
    });

    setEditingCustomer(customer);
    setIsAddOpen(true);
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
      setTempVisibleFields([...visibleFields]);
    } else {
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
                <Button
                  onClick={() => {
                    clearForm(); // RESET ALL FIELDS
                    setEditingCustomer(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-full overflow-y-scroll bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
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
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Customer Name<span className="text-red-500">*</span>
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

                    {/* Phone Number */}
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Phone Number (Without Country code)
                      </Label>
                      <Input
                        placeholder="Enter phone number"
                        value={newCustomer.phoneNumber || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const cleaned = value.replace(/[^0-9]/g, ""); // ❗ only numbers
                          setNewCustomer({
                            ...newCustomer,
                            phoneNumber: cleaned,
                          });
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
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Billing Address<span className="text-red-500">*</span>
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

                    {/* Country - NOW A DROPDOWN WITH 44 EUROPEAN COUNTRIES */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Country<span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newCustomer.country}
                        onValueChange={(value) =>
                          setNewCustomer({ ...newCustomer, country: value })
                        }
                      >
                        <SelectTrigger className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {europeanCountries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        City<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Paris, Berlin, Rome..."
                        value={newCustomer.city}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            city: e.target.value,
                          })
                        }
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Postal Code<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="75000"
                        value={newCustomer.postalCode}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            postalCode: e.target.value,
                          })
                        }
                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </div>

                    {/* Customer Type FIRST */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Customer Type<span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newCustomer.customerType}
                        onValueChange={(value) =>
                          setNewCustomer({
                            ...newCustomer,
                            customerType: value,
                            vatNumber: "",
                            vatPrefix: "FR", // reset when switching to Individual
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

                    {/* VAT Number — SHOW ONLY IF COMPANY */}
                    {newCustomer.customerType === "Company" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          VAT Number <span className="text-red-500">*</span>
                        </Label>

                        <div className="flex items-center border-2 rounded-lg overflow-hidden bg-white">
                          {/* VAT Prefix Dropdown */}
                          <Select
                            value={newCustomer.vatPrefix}
                            onValueChange={(value) =>
                              setNewCustomer({
                                ...newCustomer,
                                vatPrefix: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-24 border-0 rounded-none bg-muted/30 h-[42px]">
                              <SelectValue placeholder="FR" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {[
                                "AT",
                                "BE",
                                "BG",
                                "CY",
                                "CZ",
                                "DE",
                                "DK",
                                "EE",
                                "EL",
                                "ES",
                                "FI",
                                "FR",
                                "HR",
                                "HU",
                                "IE",
                                "IT",
                                "LT",
                                "LU",
                                "LV",
                                "MT",
                                "NL",
                                "PL",
                                "PT",
                                "RO",
                                "SE",
                                "SI",
                                "SK",
                              ].map((prefix) => (
                                <SelectItem key={prefix} value={prefix}>
                                  {prefix}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* VAT Number Input */}
                          <Input
                            value={newCustomer.vatNumber}
                            className="border-0 rounded-none h-[42px] flex-1"
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              setNewCustomer({
                                ...newCustomer,
                                vatNumber: onlyNumbers,
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}

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
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium flex items-center justify-center gap-2"
                    onClick={handleSaveCustomer}
                    disabled={saving}
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
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.totalCustomers}
                  </p>
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
                  <p className="text-2xl font-bold text-green-900">
                    {summary.newCustomers}
                  </p>
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
                onChange={handleSearch}
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
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      Sr
                    </th>
                  )}
                  {visibleFields.includes("customerName") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      Customer Name
                    </th>
                  )}
                  {visibleFields.includes("phoneNumber") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      Phone Number
                    </th>
                  )}
                  {visibleFields.includes("email") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      Email
                    </th>
                  )}
                  {visibleFields.includes("country") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      Country
                    </th>
                  )}
                  {visibleFields.includes("customerType") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      Customer Type
                    </th>
                  )}
                  {visibleFields.includes("vatNumber") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      VAT Number
                    </th>
                  )}
                  {visibleFields.includes("vatRegime") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      VAT Regime
                    </th>
                  )}
                  {visibleFields.includes("vatRate") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      VAT Rate (%)
                    </th>
                  )}
                  {visibleFields.includes("paymentTerms") && (
                    <th className="px-6 py-4 text-left whitespace-nowrap text-sm font-semibold uppercase tracking-wider">
                      Payment Terms
                    </th>
                  )}
                  <th className="px-6 py-4 text-center whitespace-nowrap text-sm font-semibold uppercase tracking-wider w-[120px]">
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
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          {indexOfFirstItem + index + 1}
                        </td>
                      )}

                      {visibleFields.includes("customerName") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.customerName}
                        </td>
                      )}

                      {/* FIXED — replaced contactPerson with phoneNumber */}
                      {visibleFields.includes("phoneNumber") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.phoneNumber}
                        </td>
                      )}

                      {visibleFields.includes("email") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.email}
                        </td>
                      )}

                      {visibleFields.includes("country") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.country}
                        </td>
                      )}

                      {visibleFields.includes("customerType") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.customerType}
                        </td>
                      )}

                      {visibleFields.includes("vatNumber") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.vatNumber}
                        </td>
                      )}

                      {visibleFields.includes("vatRegime") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.vatRegime}
                        </td>
                      )}

                      {visibleFields.includes("vatRate") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.defaultVatRate}%
                        </td>
                      )}

                      {visibleFields.includes("paymentTerms") && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.paymentTerms}
                        </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(c.id)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-all duration-200 rounded-lg"
                            title="View Customer"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(c.id)}
                            className="h-8 w-8 p-0 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-all duration-200 rounded-lg"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

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
                Settings
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
              { key: "phoneNumber", label: "Phone Number" },
              { key: "email", label: "Email" },
              { key: "city", label: "City" },
              { key: "postalCode", label: "Postal Code" },
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
              after:content-['Check'] after:text-white after:font-bold after:text-[11px] after:opacity-0 checked:after:opacity-100 after:transition-opacity"
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
            Apply Changes
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
