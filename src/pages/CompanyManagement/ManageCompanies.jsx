import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    MapPin
} from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ManageCompanies = () => {
    // ----- State Hooks -----
    const [companies, setCompanies] = useState([
        {
            id: 1,
            logo: "https://ui-avatars.com/api/?name=Tech+Corp",
            name: "Tech Corp Solutions",
            email: "info@techcorp.com",
            contact: "+92 321 4567890",
            role: "Admin",
            status: "Active",
            createdAt: "2024-05-16",
        },
        {
            id: 2,
            logo: "https://ui-avatars.com/api/?name=Bright+Retail",
            name: "Bright Retail Pvt Ltd",
            email: "sales@brightretail.com",
            contact: "+92 300 1234567",
            role: "Salesman",
            status: "Inactive",
            createdAt: "2024-08-10",
        },
        {
            id: 3,
            logo: "https://ui-avatars.com/api/?name=Alpha+Enterprises",
            name: "Alpha Enterprises",
            email: "support@alphaent.com",
            contact: "+92 345 9087654",
            role: "Manager",
            status: "Active",
            createdAt: "2025-01-04",
        },
    ]);

    // Define mapping of countries to VAT numbers

    const countries = [
        "Pakistan",
        "USA",
        "UK",
        "Canada"];

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
        vatNumber: "",
        country: "",
        role: "",
        status: ""
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    // ----- Filtered and Paginated Companies -----
    const filteredCompanies = companies.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.contact.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === "All" || c.role === filterRole;
        const matchesStatus = filterStatus === "All" || c.status === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
    const paginatedCompanies = filteredCompanies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ----- Handlers -----
    const handleAddCompany = () => {
        if (!newCompany.name) return toast.error("Company name is required!");

        const companyToAdd = {
            id: companies.length + 1,
            name: newCompany.name,
            email: newCompany.email,
            contact: newCompany.contact,
            role: newCompany.role,
            status: newCompany.status,
            logo: newCompany.logo || `https://ui-avatars.com/api/?name=${newCompany.name.replace(/\s/g, "+")}`,
            createdAt: new Date().toISOString().split("T")[0],
        };

        setCompanies(prev => [...prev, companyToAdd]);
        toast.success("Company added successfully!");
        setIsAddOpen(false);

        setNewCompany({
            name: "",
            email: "",
            contact: "",
            role: "",
            status: "",
            logo: "",
        });
    };

    const EU_VAT_RATES = {
        France: 20,
        Germany: 19,
        Belgium: 21
    };

    const vatRate = EU_VAT_RATES[newCompany.country] || 0;
    const handleEdit = (id) => toast.info(`Editing company #${id}`);
    const handleDelete = (id) => toast.error(`Deleting company #${id}`);

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
                            <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                                <Plus className="w-4 h-4 mr-2" /> Add Company
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                            <DialogHeader className="border-b border-border/50 pb-4">
                                <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                                    <Plus className="w-5 h-5 text-primary" />
                                    Add New Company
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 pt-4">
                                {/* Company Name & Logo */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Company Name */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <Building2 className="w-4 h-4" /> Company Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            placeholder="Enter company name"
                                            value={newCompany.name}
                                            onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                                            className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                        />
                                    </div>

                                    {/* Company Logo */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <Image className="w-4 h-4" /> Company Logo
                                        </Label>
                                        <Input
                                            type="file"
                                            accept=".jpg,.png,.svg"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    const reader = new FileReader();
                                                    reader.onload = () => setNewCompany(prev => ({ ...prev, logo: reader.result }));
                                                    reader.readAsDataURL(e.target.files[0]);
                                                }
                                            }}
                                            className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                        />
                                        {newCompany.logo && (
                                            <span className="text-sm text-muted-foreground">
                                                {typeof newCompany.logo === "string" ? "Logo selected" : newCompany.logo.name}
                                            </span>
                                        )}
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
                                            onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                                            className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <Phone className="w-4 h-4" /> Contact
                                        </Label>
                                        <Input
                                            placeholder="+92 3XX XXXXXXX"
                                            value={newCompany.contact}
                                            onChange={(e) => setNewCompany(prev => ({ ...prev, contact: e.target.value }))}
                                            className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                        Address
                                    </Label>
                                    <Textarea
                                        placeholder="Enter company address"
                                        value={newCompany.address}
                                        onChange={(e) => setNewCompany(prev => ({ ...prev, address: e.target.value }))}
                                        className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* Country */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <MapPin className="w-4 h-4" /> Country
                                        </Label>
                                        <Select
                                            value={newCompany.country}
                                            onValueChange={(val) =>
                                                setNewCompany(prev => ({
                                                    ...prev,
                                                    country: val,
                                                    vatNumber: countryVatMap[val] || "" // auto-fill VAT
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((country) => (
                                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* VAT Number */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            VAT
                                        </Label>
                                        <Input
                                            placeholder="VAT Number"
                                            value={newCompany.vatNumber}
                                            onChange={(e) => setNewCompany(prev => ({ ...prev, vatNumber: e.target.value }))}
                                            className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                        />
                                    </div>

                                </div>
                                {/* Role & Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <Shield className="w-4 h-4" /> Role
                                        </Label>
                                        <Select value={newCompany.role} onValueChange={(val) => setNewCompany(prev => ({ ...prev, role: val }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                                <SelectItem value="Manager">Manager</SelectItem>
                                                <SelectItem value="Salesman">Salesman</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-medium">
                                            <CheckCircle2 className="w-4 h-4" /> Status
                                        </Label>
                                        <Select value={newCompany.status} onValueChange={(val) => setNewCompany(prev => ({ ...prev, status: val }))}>
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
                                >
                                    Save Company
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>


                </div>

                {/* Filters */}
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/60" />
                            <Input
                                placeholder="Search by name, email, or contact..."
                                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Roles</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Salesman">Salesman</SelectItem>
                            </SelectContent>
                        </Select>

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
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Sr</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">Logo</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">Company Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">Email / Contact</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">Created Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {paginatedCompanies.map((company, index) => (
                                    <tr
                                        key={company.id}
                                        className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                                    >
                                        <td className="px-6 py-4 font-semibold">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-full border" />
                                        </td>
                                        <td className="px-6 py-4 font-medium">{company.name}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{company.email}</span>
                                                <span>{company.contact}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="secondary"
                                                className={`${company.role === "Admin"
                                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                                    : company.role === "Manager"
                                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                                        : "bg-green-100 text-green-700 border-green-200"
                                                    }`}
                                            >
                                                {company.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="secondary"
                                                className={`${company.status === "Active"
                                                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                    : "bg-red-100 text-red-700 border-red-200"
                                                    }`}
                                            >
                                                {company.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary/60" />
                                            {company.createdAt}
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
                                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            No companies found. Try adjusting your filters or add a new company.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {filteredCompanies.length > itemsPerPage && (
                            <div className="flex justify-end items-center gap-2 p-4">
                                <Button
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ManageCompanies;
