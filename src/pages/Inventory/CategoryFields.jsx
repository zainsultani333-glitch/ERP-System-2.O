import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Edit, Trash2, Eye, AlertCircle, List } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock category data
const mockCategoryData = [
    { id: 1, name: "Electronics", logo: "/images/electronics.png", description: "Gadgets, devices, and electronics items.", status: "Active" },
    { id: 2, name: "Furniture", logo: "/images/furniture.png", description: "Home and office furniture.", status: "Active" },
    { id: 3, name: "Clothing", logo: "/images/clothing.png", description: "Apparel and garments.", status: "Inactive" },
];

const CategoryPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);

    const filteredCategories = mockCategoryData.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = () => toast.success("Category report downloaded!");
    const handleSaveCategory = () => { toast.success("Category added successfully!"); setIsAddOpen(false); };
    const handleEdit = (id) => toast.success(`Editing category #${id}`);
    const handleDelete = (id) => toast.error(`Deleting category #${id}`);
    const handleView = (id) => toast.info(`Viewing category details #${id}`);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            Category Management
                        </h1>
                        <p className="text-muted-foreground mt-2 flex items-center gap-2">
                            <List className="w-4 h-4" />
                            Manage product categories and their visibility
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
                                    Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                                <DialogHeader className="border-b border-border/50 pb-4">
                                    <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                                        <Plus className="w-5 h-5 text-primary" />
                                        Add New Category
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 pt-4">
                                    {/* Logo / Image */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground flex items-center gap-2">Logo / Image</Label>
                                        <Input type="file" className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200" />
                                    </div>

                                    {/* Category Name */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground flex items-center gap-2">Category Name</Label>
                                        <Input placeholder="e.g., Electronics" className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200" />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground flex items-center gap-2">Description</Label>
                                        <Input placeholder="Category description" className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200" />
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-foreground flex items-center gap-2">Status</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium"
                                        onClick={handleSaveCategory}
                                    >
                                        Save Category
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
                                    <p className="text-sm font-medium text-blue-700">Total Categories</p>
                                    <p className="text-2xl font-bold text-blue-900">{mockCategoryData.length}</p>
                                </div>
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <List className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-700">Active Categories</p>
                                    <p className="text-2xl font-bold text-emerald-900">
                                        {mockCategoryData.filter((c) => c.status === "Active").length}
                                    </p>
                                </div>
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-emerald-600" />
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
                                placeholder="Search categories by name, description, or status..."
                                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Category Table */}
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4 flex">
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                            <List className="w-5 h-5 text-primary" />
                            Category Directory
                        </CardTitle>
                    </CardHeader>


                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Sr</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Logo</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredCategories.map((category, index) => (
                                        <tr key={category.id} className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]">
                                            <td className="px-6 py-4 font-semibold">{index + 1}</td>
                                            <td className="px-6 py-4"><img src={category.logo} alt={category.name} className="w-8 h-8 rounded-lg object-cover" /></td>
                                            <td className="px-6 py-4 font-semibold">{category.name}</td>
                                            <td className="px-6 py-4">{category.description}</td>
                                            <td className="px-6 py-4"><Badge variant={category.status === "Active" ? "default" : "secondary"}>{category.status}</Badge></td>
                                            <td className="px-6 py-4 text-center flex justify-center gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleView(category.id)} className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"><Eye className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(category.id)} className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredCategories.length === 0 && (
                                <div className="text-center py-12">
                                    <List className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground font-medium text-lg">No categories found</p>
                                    <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or add a new category</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CategoryPage;
