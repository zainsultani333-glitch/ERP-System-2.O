import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Upload, X, Package, ImageIcon, Barcode, Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import { toast } from "sonner";

const mockProducts = [
  {
    id: 1,
    itemCode: "ITM001",
    itemName: "Wireless Mouse",
    description: "Ergonomic wireless mouse with 1600 DPI",
    category: "Electronics/Peripherals",
    unit: "PCS",
    barcode: "8901234567890",
    image: null,
  },
  {
    id: 2,
    itemCode: "ITM002",
    itemName: "Cotton T-Shirt",
    description: "100% cotton, medium size, black color",
    category: "Clothing/Men",
    unit: "PCS",
    barcode: "8900987654321",
    image: null,
  },
  {
    id: 3,
    itemCode: "ITM003",
    itemName: "Basmati Rice",
    description: "Premium long-grain basmati rice, 5kg pack",
    category: "Food/Grains",
    unit: "KG",
    barcode: null,
    image: null,
  },
];

const ProductInfo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const filteredProducts = mockProducts.filter((item) =>
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
  };

  const handleDownload = () => {
    toast.success("Product catalog downloaded!");
  };

  const handleAddProduct = () => {
    toast.success("Product added successfully!");
    setIsAddOpen(false);
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleEdit = (productId) => {
    toast.success(`Editing product ${productId}`);
  };

  const handleDelete = (productId) => {
    toast.error(`Deleting product ${productId}`);
  };

  const handleView = (productId) => {
    toast.info(`Viewing product ${productId}`);
  };

  const getCategoryColor = (category) => {
    const categoryMap = {
      "Electronics/Peripherals": "bg-blue-50 text-blue-700 border-blue-200",
      "Clothing/Men": "bg-purple-50 text-purple-700 border-purple-200",
      "Food/Grains": "bg-amber-50 text-amber-700 border-amber-200",
    };
    return categoryMap[category] || "bg-gray-50 text-gray-700 border-gray-200";
  };

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
            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader className="border-b border-border/50 pb-4">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <Plus className="w-5 h-5 text-primary" />
                    Add New Product
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Item Code & Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Item Code *</Label>
                      <Input
                        placeholder="e.g., ITM001"
                        className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Item Name *</Label>
                      <Input
                        placeholder="Product title"
                        className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Description</Label>
                    <textarea
                      className="w-full min-h-24 px-3 py-3 text-sm rounded-lg border-2 border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 resize-none"
                      placeholder="Full product description..."
                    />
                  </div>

                  {/* Category & Unit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Category</Label>
                      <Input
                        placeholder="e.g., Electronics/Peripherals"
                        className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Unit of Measure</Label>
                      <Input
                        placeholder="PCS, KG, Liter, etc."
                        className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Barcode className="w-4 h-4" />
                      Barcode (Optional)
                    </Label>
                    <Input
                      placeholder="Scan or enter barcode"
                      className="focus:ring-2 focus:ring-primary/20 border-2 transition-all duration-200"
                    />
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
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 py-3 text-base font-medium mt-4"
                    onClick={handleAddProduct}
                  >
                    Add Product
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Sr</th>
                    )}
                    {visibleFields.includes("image") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Image</th>
                    )}
                    {visibleFields.includes("itemCode") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Item Code</th>
                    )}
                    {visibleFields.includes("itemName") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Item Name</th>
                    )}
                    {visibleFields.includes("description") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Description</th>
                    )}
                    {visibleFields.includes("category") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Category</th>
                    )}
                    {visibleFields.includes("unit") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Unit</th>
                    )}
                    {visibleFields.includes("barcode") && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Barcode</th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {filteredProducts.map((item, index) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-primary/5 transition-all duration-300 ease-in-out transform hover:scale-[1.002]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {visibleFields.includes("sr") && (
                        <td className="px-6 py-4 font-semibold">{index + 1}</td>
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
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 inline-block">
                            {item.itemCode}
                          </div>
                        </td>
                      )}

                      {visibleFields.includes("itemName") && (
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                            {item.itemName}
                          </div>
                        </td>
                      )}

                      {visibleFields.includes("description") && (
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                            {item.description}
                          </p>
                        </td>
                      )}

                      {visibleFields.includes("category") && (
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`${getCategoryColor(item.category)} border-2 font-medium text-xs px-2 py-1 rounded-full`}
                          >
                            {item.category}
                          </Badge>
                        </td>
                      )}

                      {visibleFields.includes("unit") && (
                        <td className="px-6 py-4">
                          <div className="font-medium bg-muted/30 text-foreground px-3 py-1 rounded-full text-sm border border-border inline-block">
                            {item.unit}
                          </div>
                        </td>
                      )}

                      {visibleFields.includes("barcode") && (
                        <td className="px-6 py-4">
                          {item.barcode ? (
                            <div className="flex items-center gap-2">
                              <Barcode className="w-4 h-4 text-green-600" />
                              <span className="font-mono text-sm text-foreground bg-green-50 px-2 py-1 rounded border border-green-200">
                                {item.barcode}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-sm bg-muted/30 px-3 py-1 rounded-full border border-dashed border-muted-foreground/30">
                              No barcode
                            </span>
                          )}
                        </td>
                      )}

                      {/* Actions always visible */}
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
                  ))}
                </tbody>

              </table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium text-lg">No products found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or add a new product
                  </p>
                </div>
              )}
            </div>
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


    </DashboardLayout>
  );
};

export default ProductInfo;