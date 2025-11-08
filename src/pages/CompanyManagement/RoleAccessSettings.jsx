import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, Plus } from "lucide-react";
import { toast } from "sonner";

const companiesData = [
    {
        id: 1,
        name: "Tech Corp Solutions",
        logo: "https://ui-avatars.com/api/?name=Tech+Corp",
        address: "123 Tech Street, City",
        country: "Pakistan",
        users: [
            { id: 1, name: "Ali Khan", role: "Admin" },
            { id: 2, name: "Sara Ahmed", role: "Salesman" },
        ],
    },
    {
        id: 2,
        name: "Bright Retail Pvt Ltd",
        logo: "https://ui-avatars.com/api/?name=Bright+Retail",
        address: "456 Retail Ave, City",
        country: "USA",
        users: [
            { id: 3, name: "John Doe", role: "Manager" },
            { id: 4, name: "Jane Smith", role: "Salesman" },
        ],
    },
];

const CompanyUserRoles = () => {
    const [companies, setCompanies] = useState(companiesData);
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [newRole, setNewRole] = useState({
        companyId: null,
        name: "",
        role: "",
        logo: "",
        address: "",
        country: "",
    });

    const handleEditRole = (companyId, userId) => {
        const company = companies.find((c) => c.id === companyId);
        const user = company.users.find((u) => u.id === userId);
        toast.info(`Editing role for ${user.name} in ${company.name}`);
    };

    const handleRemoveUser = (companyId, userId) => {
        setCompanies((prev) =>
            prev.map((c) =>
                c.id === companyId
                    ? { ...c, users: c.users.filter((u) => u.id !== userId) }
                    : c
            )
        );
        toast.success("User removed successfully");
    };

    const handleAddRole = () => {
        if (!newRole.name || !newRole.role || !newRole.companyId) {
            toast.error("Please fill all fields");
            return;
        }

        setCompanies((prev) =>
            prev.map((c) =>
                c.id === newRole.companyId
                    ? {
                        ...c,
                        users: [
                            ...c.users,
                            { id: Date.now(), name: newRole.name, role: newRole.role },
                        ],
                    }
                    : c
            )
        );

        toast.success("New role added successfully");
        setIsAddRoleOpen(false);
        setNewRole({
            companyId: null,
            name: "",
            role: "",
            logo: "",
            address: "",
            country: "",
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 py-10">
                <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    <Users className="w-6 h-6 text-primary" /> <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Companies & Users</h1>
                </h1>

                <Card className="shadow-lg border border-border/50">
                    <CardHeader>
                        <div className="flex items-center justify-between w-full">
                            <CardTitle className="text-xl font-semibold">
                                Company User Roles
                            </CardTitle>

                            {/* Add Role Dialog */}
                            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="flex items-center gap-1 bg-gradient-to-r from-primary to-primary/80 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        <Plus className="w-4 h-4" /> Add Role
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                                    <DialogHeader className="border-b border-border/50 pb-4">
                                        <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                                            <Plus className="w-5 h-5 text-primary" />
                                            Add New Role
                                        </DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-6 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Company ID */}
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    Company ID
                                                </Label>
                                                <Input
                                                    value={newRole.companyId || ""}
                                                    onChange={(e) =>
                                                        setNewRole({ ...newRole, companyId: Number(e.target.value) })
                                                    }
                                                    placeholder="Enter company ID (1 or 2)"
                                                    className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                                />
                                            </div>

                                            {/* Company Name - Dropdown */}
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    Company Name
                                                </Label>
                                                <select
                                                    className="w-full border-2 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                                    value={newRole.companyName}
                                                    onChange={(e) =>
                                                        setNewRole({ ...newRole, companyName: e.target.value })
                                                    }
                                                >
                                                    <option value="">Select Company</option>
                                                    <option value="ABC Corporation">ABC Corporation</option>
                                                    <option value="XYZ Industries">XYZ Industries</option>
                                                    <option value="Global Tech">Global Tech</option>
                                                </select>
                                            </div>
                                        </div>
                                        {/* Logo Upload */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm font-medium">
                                                Logo
                                            </Label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="w-full text-sm border-2 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setNewRole({ ...newRole, logo: reader.result });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            {newRole.logo && (
                                                <div className="mt-2">
                                                    <img
                                                        src={newRole.logo}
                                                        alt="Logo Preview"
                                                        className="w-16 h-16 rounded-full border"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Address */}
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    Address
                                                </Label>
                                                <Input
                                                    value={newRole.address}
                                                    onChange={(e) =>
                                                        setNewRole({ ...newRole, address: e.target.value })
                                                    }
                                                    placeholder="Enter address"
                                                    className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                                />
                                            </div>

                                            {/* Country - Dropdown */}
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    Country
                                                </Label>
                                                <select
                                                    className="border-2 rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                                    value={newRole.country}
                                                    onChange={(e) =>
                                                        setNewRole({ ...newRole, country: e.target.value })
                                                    }
                                                >
                                                    <option value="">Select Country</option>
                                                    <option value="Pakistan">Pakistan</option>
                                                    <option value="USA">USA</option>
                                                    <option value="UK">UK</option>
                                                    <option value="Canada">Canada</option>
                                                    {/* Add more countries */}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* User Name */}
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    User Name
                                                </Label>
                                                <Input
                                                    value={newRole.name}
                                                    onChange={(e) =>
                                                        setNewRole({ ...newRole, name: e.target.value })
                                                    }
                                                    placeholder="Enter user name"
                                                    className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                                />
                                            </div>

                                            {/* Role - Dropdown */}
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2 text-sm font-medium">
                                                    Role
                                                </Label>
                                                <select
                                                    className="w-full border-2 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                                                    value={newRole.role}
                                                    onChange={(e) =>
                                                        setNewRole({ ...newRole, role: e.target.value })
                                                    }
                                                >
                                                    <option value="">Select Role</option>
                                                    <option value="Admin">Admin</option>
                                                    <option value="Manager">Manager</option>
                                                    <option value="Sales">Sales</option>
                                                    <option value="Accountant">Accountant</option>
                                                </select>
                                            </div>
                                        </div>
                                        {/* Submit */}
                                        <Button
                                            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                                            onClick={handleAddRole}
                                        >
                                            Add Role
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>


                        </div>
                    </CardHeader>


                    {/* Table */}
                    <CardContent>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-muted/40 border-b border-border/50">
                                    <th className="px-6 py-3 text-left font-medium">Logo</th>
                                    <th className="px-6 py-3 text-left font-medium">
                                        Company Name
                                    </th>
                                    <th className="px-6 py-3 text-left font-medium">Address</th>
                                    <th className="px-6 py-3 text-left font-medium">Country</th>
                                    <th className="px-6 py-3 text-center font-medium">Users</th>
                                    <th className="px-6 py-3 text-center font-medium">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border/40">
                                {companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-muted/30 transition">
                                        <td className="px-6 py-3">
                                            <img
                                                src={company.logo}
                                                alt={company.name}
                                                className="w-10 h-10 rounded-full border"
                                            />
                                        </td>
                                        <td className="px-6 py-3 font-medium">{company.name}</td>
                                        <td className="px-6 py-3">{company.address}</td>
                                        <td className="px-6 py-3">{company.country}</td>
                                        <td className="px-6 py-3 text-center">
                                            <Badge className="bg-primary/10 text-primary">
                                                {company.users.length}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3 text-center flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCompany(company);
                                                    setIsViewDialogOpen(true);
                                                }}
                                            >
                                                View Users
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCompany(company);
                                                    setIsEditDialogOpen(true);
                                                }}
                                            >
                                                Edit Roles
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* View Users Dialog */}
                <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Users in {selectedCompany?.name || "Company"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 mt-2">
                            {selectedCompany?.users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex justify-between items-center p-2 border rounded-md"
                                >
                                    <span>{user.name}</span>
                                    <Badge>{user.role}</Badge>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Roles Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Edit Roles - {selectedCompany?.name || "Company"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 mt-2">
                            {selectedCompany?.users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex justify-between items-center p-2 border rounded-md"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{user.name}</span>
                                        <Badge>{user.role}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleEditRole(selectedCompany.id, user.id)
                                            }
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleRemoveUser(selectedCompany.id, user.id)
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default CompanyUserRoles;
