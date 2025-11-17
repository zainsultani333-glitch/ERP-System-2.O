import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Image } from "lucide-react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Building2,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Calendar,
  Briefcase,
  Hash,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "../../Api/AxiosInstance";
import Pagination from "../../components/Pagination";

const ManageCompanies = () => {
  // ----- State Hooks -----
  const [companies, setCompanies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState(null);

  // Define mapping of countries to VAT numbers

  const countries = [
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
    "Czech Republic",
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
    "Kazakhstan (partial)",
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
    "San Marino",
    "Serbia",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Switzerland",
    "Türkiye (formerly Turkey, partial)",
    "Ukraine",
    "United Kingdom",
    "Vatican City",
  ];

  const countryVatMap = {
    Pakistan: "PK123456789",
    USA: "US987654321",
    UK: "UK567890123",
    Canada: "CA345678901",
    // add more countries as needed
  };

  const [newCompany, setNewCompany] = useState({
    name: "",
    logo: null,
    email: "",
    contact: "",
    address: "",
    industry: "",
    vatPrefix: "",
    vatNumber: "",
    country: "",
    status: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ----- Filtered and Paginated Companies -----
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.toLowerCase().includes(searchTerm.toLowerCase());

    // const matchesRole = filterRole === "All" || c.role === filterRole;
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;

    return matchesSearch && matchesStatus;

  });

  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");

      if (res.data.success) {
        const formatted = res.data.data.map((item, index) => ({
          id: item._id,
          logo:
            item.companyLogo?.url || "https://ui-avatars.com/api/?name=Company",
          name: item.companyName,
          email: item.email,
          contact: item.contact,
          status: item.status,
          createdAt: item.createdAt.split("T")[0],
        }));

        setCompanies(formatted);
      } else {
        toast.error("Failed to fetch companies");
      }
    } catch (error) {
      toast.error("Error fetching companies");
    }
  };

  const handleAddClick = () => {
    setNewCompany({
      name: "",
      logo: null,
      email: "",
      contact: "",
      address: "",
      vatPrefix: "",
      vatNumber: "",
      country: "",
      status: "",
    });
    setIsEditMode(false); // 👈 Add this
    setIsAddOpen(true);
  };

  // ----- Handlers -----
  const handleAddCompany = async () => {
    setSaving(true);
    try {
      if (!newCompany.name) return toast.error("Company name is required!");
      if (!newCompany.address) return toast.error("Address is required!");
      if (!newCompany.country) return toast.error("Country is required!");
         // ✅ Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newCompany.email && !emailRegex.test(newCompany.email)) {
      return toast.error("Please enter a valid email address!");
    }
      const formData = new FormData();
      formData.append("companyName", newCompany.name);
      formData.append("email", newCompany.email);
      formData.append("contact", newCompany.contact);
      formData.append("address", newCompany.address);
      formData.append("country", newCompany.country);
      formData.append("vatCode", newCompany.vatPrefix || "");

      formData.append(
        "vatNumber",
        newCompany.vatPrefix
          ? `${newCompany.vatPrefix}${newCompany.vatNumber}`
          : newCompany.vatNumber || ""
      );

      formData.append("status", newCompany.status || "Active");

      // Only send file when user selects new one
      if (newCompany.logo && typeof newCompany.logo !== "string") {
        formData.append("companyLogo", newCompany.logo);
      }

      let res;

      // ⭐ UPDATE MODE
      if (isEditMode && editCompanyId) {
        res = await api.put(`/companies/${editCompanyId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      // ⭐ ADD MODE
      else {
        res = await api.post("/companies", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.success) {
        toast.success(isEditMode ? "Company updated!" : "Company added!");

        fetchCompanies();
        setIsAddOpen(false);

        setNewCompany({
          name: "",
          logo: null,
          email: "",
          contact: "",
          address: "",
          vatPrefix: "",
          vatNumber: "",
          country: "",
          status: "",
        });
      } else {
        toast.error(res.data.message || "Operation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Server Error");
    } finally {
      setSaving(false);
    }
  };

  const EU_VAT_RATES = {
    France: 20,
    Germany: 19,
    Belgium: 21,
  };

  const vatRate = EU_VAT_RATES[newCompany.country] || 0;
  const handleEdit = async (id) => {
    try {
      // Find selected company from table list
      const company = companies.find((c) => c.id === id);
      if (!company) {
        toast.error("Company not found!");
        return;
      }

      const res = await api.get(`/companies/${company._id || company.id}`);

      if (!res.data.success) {
        toast.error("Failed to load company details");
        return;
      }

      const data = res.data.data;
      console.log(data);

      // Split VAT Prefix + Number
      const vat = data.vatNumber || "";
      const vatPrefix = vat.substring(0, 2);
      const vatNumber = vat.substring(2);

      // Prefill form
      setNewCompany({
        name: data.companyName || "",
        logo: data.companyLogo?.url || null,
        email: data.email || "",
        contact: data.contact || "",
        address: data.address || "",
        country: data.country || "",
        vatPrefix,
        vatNumber,
        status: data.status || "Active",
      });

      setEditCompanyId(data._id);
      setIsEditMode(true);
      setIsAddOpen(true);
    } catch (err) {
      console.log(err);
      toast.error("Error loading company");
    }
  };

  const handleDelete = async (id) => {
    try {
      setSaving(true);
      toast.loading("Deleting company...");

      const res = await api.delete(`/companies/${id}`);

      toast.dismiss();

      if (res.data?.success) {
        toast.success("Company deleted successfully!");
        fetchCompanies(); // refresh list
      } else {
        toast.error(res.data?.message || "Failed to delete");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  console.log({ paginatedCompanies });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Manage Companies
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Manage all linked companies, their roles, and access status
            </p>
          </div>

          {/* Add Company Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAddClick}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-full overflow-y-scroll bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
              <DialogHeader className="border-b border-border/50 pb-4">
                <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <Plus className="w-5 h-5 text-primary" />
                  {isEditMode ? "Update Company" : " Add New Company"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Company Name & Logo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="w-4 h-4" /> Company Name{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter company name"
                      value={newCompany.name}
                      onChange={(e) =>
                        setNewCompany((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>

                  {/* Company Logo */}
                  <div className="space-y-2">
                    {/* Label + Image Side by Side */}
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Image className="w-4 h-4" /> Company Logo
                      </Label>

                      {newCompany.logo && (
                        <img
                          src={
                            typeof newCompany.logo === "string"
                              ? newCompany.logo
                              : URL.createObjectURL(newCompany.logo)
                          }
                          alt="Company Logo"
                          className="w-12 h-12 rounded-lg border object-cover shadow-sm"
                        />
                      )}
                    </div>

                    {/* File Input */}
                    <Input
                      type="file"
                      accept=".jpg,.png,.svg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewCompany((prev) => ({
                            ...prev,
                            logo: e.target.files[0],
                          }));
                        }
                      }}
                      className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Email & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="w-4 h-4" /> Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="company@email.com"
                      value={newCompany.email}
                      onChange={(e) =>
                        setNewCompany((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="w-4 h-4" /> Contact
                    </Label>

                    <Input
                      placeholder="Enter number"
                      value={newCompany.contact}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(
                          /[^0-9]/g,
                          ""
                        ); // REMOVE everything except digits
                        setNewCompany((prev) => ({
                          ...prev,
                          contact: onlyNumbers,
                        }));
                      }}
                      className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    Address<span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter company address"
                    value={newCompany.address}
                    onChange={(e) =>
                      setNewCompany((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Country */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4" /> Country
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newCompany.country}
                      onValueChange={(val) =>
                        setNewCompany((prev) => ({
                          ...prev,
                          country: val,
                          // vatNumber: countryVatMap[val] || "", // auto-fill VAT
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* VAT Number (Prefix + Number) */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      VAT Number
                    </Label>

                    <div className="flex items-center border-2 rounded-lg overflow-hidden bg-white">
                      {/* VAT Country Code Dropdown */}
                      <Select
                        value={newCompany.vatPrefix}
                        onValueChange={(value) =>
                          setNewCompany((prev) => ({
                            ...prev,
                            vatPrefix: value,
                          }))
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
                        placeholder="Enter VAT Number"
                        value={newCompany.vatNumber}
                        onChange={(e) =>
                          setNewCompany((prev) => ({
                            ...prev,
                            vatNumber: e.target.value,
                          }))
                        }
                        className="border-0 rounded-none h-[42px] flex-1"
                      />
                    </div>
                  </div>
                </div>
                {/* Role & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Status
                    </Label>
                    <Select
                      value={newCompany.status}
                      onValueChange={(val) =>
                        setNewCompany((prev) => ({ ...prev, status: val }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                  onClick={handleAddCompany}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      {isEditMode ? "Updating..." : "Saving..."}
                    </>
                  ) : isEditMode ? (
                    "Update Company"
                  ) : (
                    "Save Company"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                placeholder="Search by name, email, or contact..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // ⭐ RESET PAGE FOR BETTER UX
                }}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Companies Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                    Sr
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">
                    Logo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">
                    Company Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {paginatedCompanies?.map((company, index) => (
                  <tr
                    key={company.id}
                    className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                  >
                    <td className="px-6 py-4 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4">
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-10 h-10 rounded-full border"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">{company?.name || "-"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <span>{company?.contact || "-"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <span>{company?.email || "-"}</span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={`${
                          company.status === "Active"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        {company?.status || "-"}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-lg"
                          onClick={() => handleEdit(company.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCompanies.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      No companies found. Try adjusting your filters or add a
                      new company.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredCompanies.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageCompanies;
