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
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  List,
  Loader,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../Api/AxiosInstance";
import CategoryViewDialog from "../Inventory/Models/CategoryViewModal";
import Pagination from "../../components//Pagination";

const CategoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false); // Controls the view dialog open/close
  const [viewCategory, setViewCategory] = useState(null); // Stores the category details to view
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [sizeInput, setSizeInput] = useState({ name: "", stock: "" });
  const filteredCategories = categoryList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [newCategory, setNewCategory] = useState({
    logo: null,
    name: "",
    description: "",
    status: "Active",
  });
  const [summary, setSummary] = useState({
    totalCategories: 0,
    activeCategories: 0,
  });
  const handleDownload = () => toast.success("Category report downloaded!");

  // Handle view
  const handleView = async (categoryId) => {
    // Open modal immediately
    setViewCategory(null); // reset previous data
    setIsViewOpen(true);

    try {
      const response = await api.get(`/categories/${categoryId}`);
      if (response.data.success && response.data.data) {
        const item = response.data.data;
        setViewCategory({
          id: item._id,
          name: item.categoryName || "-",
          description: item.description || "-",
          status: item.status || "-",
          logo: item.logo?.url || "",
          createdAt: new Date(item.createdAt).toLocaleDateString(),
        });
      } else {
        toast.error("Failed to fetch category details");
      }
    } catch (error) {
      console.error("❌ Failed to fetch category:", error);
      toast.error("Failed to fetch category details");
    }
  };

  const TableLoader = ({ message = "Loading..." }) => {
    return (
      <tr>
        <td colSpan="9" className="py-20 text-center">
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

  // 🟢 Fetch Category Data
  const fetchCategoryList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      console.log("Res", response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map((item) => ({
          id: item._id,
          name: item.categoryName || "-",
          description: item.description || "-",
          status: item.status || "-",
          sizes: item.sizes || "-",
          logo: item.logo?.url || "",
          createdAt: new Date(item.createdAt).toLocaleDateString(),
        }));

        setCategoryList(formattedData);

        // ✅ Set summary directly from API response
        if (response.data.summary) {
          setSummary({
            totalCategories: response.data.summary.totalCategories,
            activeCategories: response.data.summary.activeCategories,
          });
        } else {
          // fallback in case summary is missing
          setSummary({
            totalCategories: formattedData.length,
            activeCategories: formattedData.filter((c) => c.status === "Active")
              .length,
          });
        }
      } else {
        console.warn("⚠️ Unexpected API response structure:", response.data);
        setCategoryList([]);
        setSummary({ totalCategories: 0, activeCategories: 0 });
      }
    } catch (error) {
      console.error("❌ Failed to fetch Categories:", error);
      setSummary({ totalCategories: 0, activeCategories: 0 });
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  }, []);

  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  const clearForm = () => {
    setNewCategory({
      logo: null,
      logoFile: null,
      name: "",
      description: "",
      status: "Active",
    });
    setEditingCategory(null);
  };

  // 🟢 Save New Category
  const handleSaveCategory = async () => {
    try {
      setSaving(true); // show spinner immediately

      const formData = new FormData();
      formData.append("categoryName", newCategory.name);
      formData.append("description", newCategory.description);
      formData.append("status", newCategory.status);

      // Logo (optional)
      if (newCategory.logoFile) {
        formData.append("logo", newCategory.logoFile);
      }

      // 🟢 ADD SIZES EXACTLY LIKE POSTMAN
      if (newCategory.sizes?.length > 0) {
        const sizeString = newCategory.sizes.map((s) => s.name).join(", ");
        formData.append("sizes", sizeString); // NOW MATCHES POSTMAN
      }

      // Get token
      const token = localStorage.getItem("token");

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Category updated successfully!");
      } else {
        await api.post("/categories", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Category added successfully!");
      }

      setIsAddOpen(false);
      clearForm();
      setEditingCategory(null);
      fetchCategoryList();
    } catch (error) {
      console.error(
        "❌ Failed to save category:",
        error.response?.data || error
      );
      toast.error(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  // 🟢 Edit Category
  const handleEdit = (category) => {
    console.log({ category });

    setEditingCategory(category);

    setNewCategory({
      name: category.name,
      description: category.description,
      status: category.status,
      logo: category.logo,

      // 🟢 Convert array ["XL","LG"] → [{ name: "XL" }, { name: "LG" }]
      sizes: Array.isArray(category.sizes)
        ? category.sizes.map((size) => ({ name: size }))
        : [],
    });

    setIsAddOpen(true);
  };

  // 🟢 Delete Category
  const handleDelete = async (categoryId) => {
    try {
      
    

      setLoading(true); // show loader

      // Get token from localStorage (or wherever you store it)
      const token = localStorage.getItem("token");

      await api.delete(`/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Category deleted successfully!");

      // Remove deleted category from state
      setCategoryList((prev) => prev.filter((c) => c.id !== categoryId));
      fetchCategoryList();
      setLoading(false); // hide loader
    } catch (error) {
      console.error(
        "❌ Failed to delete category:",
        error.response?.data || error
      );
      toast.error(error.response?.data?.message || "Failed to delete category");
      setLoading(false); // hide loader if error occurs
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategorize = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Search Bar
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset pagination when searching
  };

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
            <Dialog
              open={isAddOpen}
              onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) {
                  // Reset the form when closing
                  setNewCategory({
                    logo: null,
                    logoFile: null,
                    name: "",
                    description: "",
                    status: "Active",
                    sizes: [],
                  });
                  setSizeInput({ name: "" });
                  setEditingCategory(null);
                }
              }}
            >
              <DialogTrigger
                asChild
                onClick={() => {
                  setEditingCategory(null); // not editing anymore
                  setNewCategory({
                    logo: null,
                    logoFile: null,
                    name: "",
                    description: "",
                    status: "Active",
                    sizes: [],
                  });
                  setSizeInput({ name: "" });
                }}
              >
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-full overflow-y-scroll overflow-x-hidden bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    {editingCategory ? (
                      <>
                        <Edit className="w-5 h-5 text-primary" />
                        Edit Category
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-primary" />
                        Add New Category
                      </>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Logo / Image */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium  text-foreground flex items-center gap-2">
                      Logo / Image
                    </Label>

                    {/* 🟢 Existing logo preview (Edit Mode) */}
                    {editingCategory &&
                      newCategory.logo &&
                      !newCategory.logoFile && (
                        <img
                          src={newCategory.logo}
                          alt="Existing Logo"
                          className="w-20 h-20 object-cover cursor-pointer rounded-lg mb-3 border"
                        />
                      )}

                    {/* 🟢 New logo selected preview */}
                    {newCategory.logoFile && (
                      <img
                        src={URL.createObjectURL(newCategory.logoFile)}
                        alt="New Logo Preview"
                        className="w-20 h-20  object-cover rounded-lg mb-3 border"
                      />
                    )}

                    <Input
                      type="file"
                      className="cursor-pointer"
                      accept="image/*"
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          logoFile: e.target.files[0],
                        })
                      }
                    />
                  </div>

                  {/* Category Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Category Name
                    </Label>
                    <Input
                      placeholder="e.g., Electronics"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Description
                    </Label>
                    <Input
                      placeholder="Category description"
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* SIZE CHART SECTION */}
                  <div className="mt-6 p-4 rounded-lg border bg-muted/30">
                    {/* Size + Add button in one line */}
                    <div className="flex gap-2 items-end">
                      {/* Size */}
                      <div className="flex-1">
                        <Label>Size</Label>
                        <Input
                          value={sizeInput.name}
                          onChange={(e) =>
                            setSizeInput({ ...sizeInput, name: e.target.value })
                          }
                          placeholder="e.g., XL"
                          className="border-2 w-[430px]"
                        />
                      </div>

                      {/* Add Button */}
                      <div>
                        <Button
                          onClick={() => {
                            if (!sizeInput.name) return; // Only add if size is not empty
                            setNewCategory({
                              ...newCategory,
                              sizes: [
                                ...(newCategory.sizes || []),
                                { name: sizeInput.name },
                              ],
                            });
                            setSizeInput({ name: "" });
                          }}
                          className="bg-primary text-white mt-5 w-[150px]"
                        >
                          + Add Size
                        </Button>
                      </div>
                    </div>

                    {/* Display Added Sizes */}
                    {newCategory.sizes?.length > 0 && (
                      <div className="mt-4 border rounded-lg p-3 bg-white">
                        <h4 className="font-semibold mb-3">Added Sizes</h4>
                        <table className="w-full border">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 text-left font-semibold">
                                Sr #
                              </th>
                              <th className="p-2 text-left font-semibold">
                                Size
                              </th>
                              <th className="p-2 text-right font-semibold">
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {newCategory.sizes.map((size, i) => (
                              <tr key={i} className="border-t">
                                <td className="p-2 text-left">{i + 1}.</td>{" "}
                                {/* Serial Number */}
                                <td className="p-2 text-left">{size.name}</td>
                                <td className="p-2 text-right pr-3">
                                  {/* Cross to remove */}
                                  <span
                                    className="text-red-600 cursor-pointer hover:text-red-800 font-bold text-xl pr-3"
                                    onClick={() => {
                                      const updatedSizes =
                                        newCategory.sizes.filter(
                                          (_, index) => index !== i
                                        );
                                      setNewCategory({
                                        ...newCategory,
                                        sizes: updatedSizes,
                                      });
                                    }}
                                  >
                                    ×
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Save / Update Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium flex items-center justify-center gap-2"
                    onClick={handleSaveCategory}
                    disabled={saving} // disables button while saving
                  >
                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                    {saving
                      ? editingCategory
                        ? "Updating..."
                        : "Saving..."
                      : editingCategory
                      ? "Update Category"
                      : "Save Category"}
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
                    Total Categories
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.totalCategories}
                  </p>
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
                  <p className="text-sm font-medium text-emerald-700">
                    Active Categories
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {summary.activeCategories}
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
                onChange={handleSearch}
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Sr
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Logo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Sizes
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-20">
                      <div className="flex flex-col items-center justify-center w-full">
                        <Loader className="w-10 h-10 text-primary animate-spin mb-3" />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tbody className="divide-y divide-border/30">
                    {filteredCategories.length > 0 ? (
                      currentCategorize.map((category, index) => (
                        <tr
                          key={category.id}
                          className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                        >
                          <td className="px-6 py-4 font-semibold">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <img
                              src={category.logo}
                              alt={category.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            {category.name}
                          </td>
                          <td className="px-6 py-4">{category.description}</td>
                          <td className="px-6 py-4">
                            {Array.isArray(category.sizes) &&
                            category.sizes.length > 0
                              ? category.sizes.join(", ")
                              : "-"}
                          </td>

                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                category.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {category.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(category.id)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-12 text-center text-muted-foreground"
                        >
                          <List className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="font-medium text-lg">
                            No categories found
                          </p>
                          <p className="text-sm mt-2">
                            Try adjusting your search or add a new category
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                )}
              </table>

              {/* Pagination Component */}
              {filteredCategories.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredCategories.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              )}

              {/* inside your component JSX */}
              <CategoryViewDialog
                isOpen={isViewOpen}
                onOpenChange={setIsViewOpen}
                category={viewCategory}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CategoryPage;
