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
  MoreVertical,
  RefreshCw,
  Store,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const mockStockData = [
  {
    id: 1,
    fullName: "Halia Rutab",
    email: "halia@erp.com",
    phone: "+92-300-1234567",
    company: "OmniFlow ERP",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    fullName: "Eman Khan",
    email: "eman@erp.com",
    phone: "+92-321-9876543",
    company: "Marc Distributors",
    role: "Salesman",
    status: "Pending",
  },
  {
    id: 3,
    fullName: "Zain Ahmed",
    email: "zain@erp.com",
    phone: "+92-333-5678901",
    company: "Marc Warehouse",
    role: "Warehouse Staff",
    status: "Inactive",
  },
];

const UserManegement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredStock = mockStockData.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company &&
        user.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownload = () => {
    toast.success("Stock & purchase report downloaded!");
  };

  const handleSaveStock = () => {
    toast.success("Stock details saved successfully!");
    setIsAddOpen(false);
  };

  const handleEdit = (itemId) => {
    toast.success(`Editing stock entry #${itemId}`);
  };

  const handleDelete = (itemId) => {
    toast.error(`Deleting stock entry #${itemId}`);
  };

  const handleView = (itemId) => {
    toast.info(`Viewing stock details for #${itemId}`);
  };

  const handleRestock = (itemId) => {
    toast.success(`Initiating restock for #${itemId}`);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock) return "critical";
    if (stock <= minStock * 2) return "warning";
    return "healthy";
  };

  const getLocationColor = (location) => {
    const locationMap = {
      "Main Warehouse": "bg-blue-50 text-blue-700 border-blue-200",
      "Store Room A": "bg-purple-50 text-purple-700 border-purple-200",
      "Cold Storage": "bg-cyan-50 text-cyan-700 border-cyan-200",
    };
    return locationMap[location] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              User Manegement
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manage user accounts, roles, and access permissions across the
              system.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Users */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {mockStockData.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {
                      mockStockData.filter((user) => user.status === "Active")
                        .length
                    }
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending / Inactive Users */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">
                    Pending / Inactive
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {
                      mockStockData.filter(
                        (user) =>
                          user.status === "Pending" ||
                          user.status === "Inactive"
                      ).length
                    }
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distinct Roles */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Distinct Roles
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {new Set(mockStockData.map((user) => user.role)).size}
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
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

        {/* Stock Table with Actions Field */}
        {/* User Management Table */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                User Management
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {filteredStock.length} Users
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {filteredStock.map((user, index) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="font-mono text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-md border border-primary/20">
                            USR-{String(user.id).padStart(3, "0")}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                        {user.fullName}
                      </td>

                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.email}
                      </td>

                      <td className="px-6 py-4 text-sm">{user.phone}</td>

                      <td className="px-6 py-4">
                        <Select
                          defaultValue={user.company || ""}
                          onValueChange={(value) =>
                            console.log(`Assigned ${value} to ${user.fullName}`)
                          }
                        >
                          <SelectTrigger className="w-[120px] h-6 text-sm bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                            <SelectValue placeholder="Select Company" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OmniFlow ERP">
                              OmniFlow ERP
                            </SelectItem>
                            <SelectItem value="Marc Distributors">
                              Marc Distributors
                            </SelectItem>
                            <SelectItem value="Marc Warehouse">
                              Marc Warehouse
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="px-6 py-4">
                        <Select
                          defaultValue={user.role || ""}
                          onValueChange={(value) =>
                            console.log(
                              `Role changed to ${value} for ${user.fullName}`
                            )
                          }
                        >
                          <SelectTrigger
                            className={`w-[120px] h-6 text-sm border rounded-full focus:ring-2 focus:ring-primary/20
        ${
          user.role === "Admin"
            ? "bg-red-50 text-red-700 border-red-200"
            : user.role === "Salesman"
            ? "bg-green-50 text-green-700 border-green-200"
            : user.role === "Store Owner"
            ? "bg-orange-50 text-orange-700 border-orange-200"
            : user.role === "Warehouse Staff"
            ? "bg-purple-50 text-purple-700 border-purple-200"
            : user.role === "Accounting Staff"
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "bg-gray-50 text-gray-700 border-gray-200"
        }`}
                          >
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Salesman">Salesman</SelectItem>
                            <SelectItem value="Store Owner">
                              Store Owner
                            </SelectItem>
                            <SelectItem value="Warehouse Staff">
                              Warehouse Staff
                            </SelectItem>
                            <SelectItem value="Accounting Staff">
                              Accounting Staff
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                            user.status === "Active"
                              ? "text-green-600 bg-green-50 border-green-200"
                              : user.status === "Inactive"
                              ? "text-red-600 bg-red-50 border-red-200"
                              : "text-amber-600 bg-amber-50 border-amber-200"
                          }`}
                        >
                          {user.status}
                        </Button>
                      </td>

                      <td className="px-6 py-4 flex items-center gap-1">
                       
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user.id)}
                            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-lg"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Assign */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              console.log(`Assign clicked for ${user.fullName}`)
                            }
                            className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200 rounded-lg"
                            title="Assign Role / Company"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>

                          {/* Deactivate */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              console.log(`Deactivated ${user.fullName}`)
                            }
                            className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 rounded-lg"
                            title="Deactivate User"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStock.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium text-lg">
                    No users found
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search or add a new user
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserManegement;
