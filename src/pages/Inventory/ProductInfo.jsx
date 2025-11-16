import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Upload,
  X,
  Package,
  ImageIcon,
  Barcode,
  Edit,
  Trash2,
  Eye,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../Api/AxiosInstance";
import { useAuth } from "../../context/AuthContext";
import ProductViewModal from "./Models/ProductViewModal";
import Pagination from "../../components/Pagination";

const ProductInfo = () => {
  // NEW STATES NEEDED
  const [itemName, setItemName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const { token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch product table list
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/inventory/items", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        const formatted = res.data.data.map((item, i) => ({
          id: item._id,
          itemCode: item.itemCode || "-",
          itemName: item.itemName || "-",
          description: item.description || "-",
          category: item.category || "-",
          unit: item.unitOfMeasure || "-",
          barcode: item.barcode || "-", // ✅ fallback
          image: item.itemImage?.url || null,
        }));

        setProducts(formatted);
      } else {
        toast.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching items from server");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  // category list
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const res = await api.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          setCategories(res.data.data);
        } else {
          toast.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error fetching categories");
      } finally {
        setTimeout(() => setCategoryLoading(false), 500);
      }
    };

    if (isAddOpen) {
      fetchCategories();
    }
  }, [isAddOpen]);

  // Auto-generate item code based on highest existing number
  useEffect(() => {
    // 🧠 Only generate new code in Add mode
    if (!isEditMode) {
      if (products.length > 0) {
        const maxNo = Math.max(
          ...products.map((p) => {
            const match = p.itemCode?.match(/ITM-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
        );
        setItemCode(`ITM-${(maxNo + 1).toString().padStart(3, "0")}`);
      } else {
        setItemCode("ITM-001");
      }
    }
  }, [products, isAddOpen, isEditMode]);

  useEffect(() => {
    if (!selectedCategory) return;

    const cat = categories.find((c) => c.categoryName === selectedCategory);
    if (cat && cat.sizes) {
      setSizes(cat.sizes); // expects array like ["XL", "L", "M"]
    }
  }, [selectedCategory, categories]);
// console.log({categories});

  const filteredProducts = products.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Customize popup
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [tempVisibleFields, setTempVisibleFields] = useState([]);
  const [fieldLimitAlert, setFieldLimitAlert] = useState(false);

  // Default visible columns
  const [visibleFields, setVisibleFields] = useState([
    "sr",
    "image",
    "itemCode",
    "itemName",
    "description",
    "category",
    "unit",
    "barcode",
  ]);

  const handleCustomizeOpen = (open) => {
    setIsCustomizeOpen(open);
    if (open) {
      setTempVisibleFields([...visibleFields]); // copy current visible fields
    }
  };

  const handleApplyChanges = () => {
    setVisibleFields(tempVisibleFields);
    setIsCustomizeOpen(false);
    toast.success("Display settings updated!");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);

    // 🔥 Reset file input so re-upload works
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleDownload = () => {
    toast.success("Product catalog downloaded!");
  };

  const handleAddProduct = async () => {
    const nameInput = document.querySelector(
      'input[placeholder="Product title"]'
    );
    if (!nameInput.value.trim()) {
      toast.error("Item Name is required!");
      return;
    }

    if (!selectedCategory || selectedCategory.trim() === "") {
      toast.error("Category is required!");
      return;
    }
    try {
      setLoading(true);

      const formData = new FormData();
      if (selectedFile) formData.append("itemImage", selectedFile);
      formData.append("itemCode", itemCode);
      formData.append(
        "itemName",
        document.querySelector('input[placeholder="Product title"]').value
      );
      formData.append("category", selectedCategory);
      formData.append(
        "unitOfMeasure",
        document.querySelector('input[placeholder="PCS, KG, Liter, etc."]')
          .value
      );
      formData.append("description", document.querySelector("textarea").value);

      let res;

      if (isEditMode && editProductId) {
        // ✏️ EDIT MODE
        res = await api.put(`/inventory/items/${editProductId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // 🆕 ADD MODE
        res = await api.post("/inventory/items", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }
      fetchProducts();
      if (res.data?.success) {
        toast.success(
          isEditMode
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        setIsAddOpen(false);
        setImagePreview(null);
        setSelectedFile(null);
        setIsEditMode(false);
        setEditProductId(null);
      } else {
        toast.error(res.data?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleEdit = (productId) => {
    // find product to edit
    const productToEdit = products.find((p) => p.id === productId);
    // console.log(productToEdit);
    if (!productToEdit) {
      toast.error("Product not found");
      return;
    }

    // enable edit mode + open modal
    setIsEditMode(true);
    setEditProductId(productId);
    setIsAddOpen(true);

    // pre-fill all fields
    setSelectedCategory(productToEdit.category || "");
    setImagePreview(productToEdit.image || null);
    setItemCode(productToEdit.itemCode || "");

    // update form inputs manually
    setTimeout(() => {
      const nameInput = document.querySelector(
        'input[placeholder="Product title"]'
      );
      const descTextarea = document.querySelector("textarea");
      const unitInput = document.querySelector(
        'input[placeholder="PCS, KG, Liter, etc."]'
      );

      if (nameInput) nameInput.value = productToEdit.itemName || "";
      if (descTextarea) descTextarea.value = productToEdit.description || "";
      if (unitInput) unitInput.value = productToEdit.unit || "";
    }, 50);
  };

  const handleDelete = async (productId) => {
    // console.log(productId);

    try {
      setLoading(true);
      toast.loading("Deleting product...");
      const res = await api.delete(`/inventory/items/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss(); // remove loader

      if (res.data?.success) {
        toast.success("Product deleted successfully!");
        fetchProducts(); // refresh table
      } else {
        toast.error(res.data?.message || "Failed to delete product");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error deleting product:", error);
      toast.error(
        error.response?.data?.message || "Server error while deleting"
      );
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleView = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error("Product not found!");
      return;
    }
    setSelectedProduct(product);
    setIsViewOpen(true);
  };

  const getCategoryColor = (category) => {
    const categoryMap = {
      "Electronics/Peripherals": "bg-blue-50 text-blue-700 border-blue-200",
      "Clothing/Men": "bg-purple-50 text-purple-700 border-purple-200",
      "Food/Grains": "bg-amber-50 text-amber-700 border-amber-200",
    };
    return categoryMap[category] || "bg-gray-50 text-gray-700 border-gray-200";
  };
  // console.log({filteredProducts});
  // --- Calculate paginated data ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Product Information
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manage your product master data
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger
                asChild
                onClick={() => {
                  // 🧠 Reset previous edit mode when adding new product
                  setIsEditMode(false);
                  setEditProductId(null);
                  setImagePreview(null);
                  setSelectedFile(null);
                  setSelectedCategory("");
                }}
              >
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl max-h-full overflow-y-scroll bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    {isEditMode ? "Update Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Item Code & Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Item Code
                      </Label>
                      <Input
                        value={itemCode}
                        readOnly
                        className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200 bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Item Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Product title"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Category + Size (Same Line) */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Category <span className="text-red-500">*</span>
                      </Label>

                      {categoryLoading ? (
                        <div className="flex justify-center items-center h-12 border rounded-lg bg-muted/30">
                          <Loader className="w-5 h-5 text-primary animate-spin mr-2" />
                        </div>
                      ) : (
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className="bg-muted/50 border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>

                          <SelectContent>
                            {categories.length > 0 ? (
                              categories.map((cat) => (
                                <SelectItem
                                  key={cat._id}
                                  value={cat.categoryName}
                                  className="hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    {cat.logo?.url && (
                                      <img
                                        src={cat.logo.url}
                                        alt={cat.categoryName}
                                        className="w-5 h-5 rounded-md object-cover"
                                      />
                                    )}
                                    <span>{cat.categoryName}</span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No categories found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Size Dropdown */}
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">
                      Size
                      </Label>
                      <Select
                        value={selectedSize}
                        onValueChange={setSelectedSize}
                      >
                        <SelectTrigger className="border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>

                        <SelectContent>
                          {sizes?.length > 0 ? (
                            sizes.map((sz, idx) => (
                              <SelectItem key={idx} value={sz}>
                                {sz}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-size" disabled>
                              No size found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* SKU + Barcode (Same Line) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">
                        SKU
                      </Label>
                      <Input
                        placeholder="Stock Keeping Unit"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Barcode className="w-4 h-4" />
                        Barcode (Optional)
                      </Label>
                      <Input
                        placeholder="Scan or enter barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Item Image
                    </Label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 bg-gradient-to-br from-muted/20 to-muted/10">
                          {imagePreview ? (
                            <div className="relative group">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-28 w-auto max-w-full rounded-lg shadow-md object-cover"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage();
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center p-4">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm font-medium text-muted-foreground">
                                Click to upload
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, WEBP up to 5MB
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                  <Button
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium mt-4 flex items-center justify-center"
                    onClick={handleAddProduct}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        {isEditMode ? "Updating..." : "Saving..."}
                      </div>
                    ) : isEditMode ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
              <Input
                placeholder="Search by item code or name..."
                className="pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary/50 bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-foreground"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // ✅ Reset page to first when searching
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Table - Image first and Actions field added */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-muted/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Product Catalog
              </CardTitle>
              <div className="flex items-center justify-end gap-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {filteredProducts.length} products
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCustomizeOpen(true);
                  }}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl text-white transition-all duration-200"
                >
                  Customize
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/50">
                  <tr>
                    {visibleFields.includes("sr") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Sr
                      </th>
                    )}
                    {visibleFields.includes("image") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Image
                      </th>
                    )}
                    {visibleFields.includes("itemCode") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Item Code
                      </th>
                    )}
                    {visibleFields.includes("itemName") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Item Name
                      </th>
                    )}
                    {visibleFields.includes("description") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Description
                      </th>
                    )}
                    {visibleFields.includes("category") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Category
                      </th>
                    )}
                    {visibleFields.includes("unit") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Unit
                      </th>
                    )}
                    {visibleFields.includes("barcode") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                        Barcode
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Loader className="w-10 h-10 text-primary animate-spin mb-2" />
                          <p className="text-sm text-muted-foreground font-medium"></p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    currentProducts.map((item, index) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {visibleFields.includes("sr") && (
                          <td className="px-6 py-4 font-semibold">
                            {startIndex + index + 1}
                          </td>
                        )}

                        {visibleFields.includes("image") && (
                          <td className="px-6 py-4">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.itemName}
                                className="w-12 h-12 object-cover rounded-xl border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/70 border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center group-hover:border-primary/30 transition-all duration-300">
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                        )}

                        {visibleFields.includes("itemCode") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                            <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                              {item.itemCode || "-"}
                            </div>
                          </td>
                        )}

                        {visibleFields.includes("itemName") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                              {item.itemName || "-"}
                            </div>
                          </td>
                        )}

                        {visibleFields.includes("description") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                            <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                              {item.description || "-"}
                            </p>
                          </td>
                        )}

                        {visibleFields.includes("category") && (
                          <td className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className={`${getCategoryColor(
                                item.category
                              )} border-2 font-medium text-xs px-2 py-1 rounded-full`}
                            >
                              {item.category || "-"}
                            </Badge>
                          </td>
                        )}

                        {visibleFields.includes("unit") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                            <div className="font-medium bg-muted/30 text-foreground px-3 py-1 rounded-full text-sm border border-border inline-block">
                              {item.unit || "-"}
                            </div>
                          </td>
                        )}

                        {visibleFields.includes("barcode") && (
                          <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                            {item.barcode ? (
                              <div className="flex items-center gap-2">
                                <Barcode className="w-4 h-4 text-green-600" />
                                <span className="font-mono text-sm text-foreground bg-green-50 px-2 py-1 rounded border border-green-200">
                                  {item.barcode || "-"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-sm bg-muted/30 px-3 py-1 rounded-full border border-dashed border-muted-foreground/30">
                                No barcode
                              </span>
                            )}
                          </td>
                        )}

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(item.id)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item.id)}
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">
                        <div className="text-center py-12 text-muted-foreground">
                          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="font-medium text-lg">
                            No products found
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Try adjusting your search terms or add a new product
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
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
              Choose which columns to display in your product table.
            </p>
          </DialogHeader>

          {fieldLimitAlert && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 font-medium text-center animate-fadeIn">
              You can select a maximum of 6 fields only!
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 py-6 px-1">
            {[
              { key: "sr", label: "Sr" },
              { key: "image", label: "Image" },
              { key: "itemCode", label: "Item Code" },
              { key: "itemName", label: "Item Name" },
              { key: "description", label: "Description" },
              { key: "category", label: "Category" },
              { key: "unit", label: "Unit" },
              { key: "barcode", label: "Barcode" },
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
                      } else if (prev.length >= 6) {
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
      {/* view model */}
      <ProductViewModal
        isOpen={isViewOpen}
        onClose={setIsViewOpen}
        product={selectedProduct}
      />
    </DashboardLayout>
  );
};

export default ProductInfo;
