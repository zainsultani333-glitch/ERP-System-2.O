import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "../../Api/AxiosInstance";
import { Package } from "lucide-react";

const StockPosition = () => {
  const [loading, setLoading] = useState(false);
  const [stockPositionData, setStockPositionData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Normalize size
  const normalizeSize = (size) => {
    if (!size) return "";
    const s = size.toUpperCase();
    if (s === "SM") return "S";
    if (s === "MD") return "M";
    return s;
  };

  // Fetch data
  const fetchStockPosition = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setStockPositionData(res.data.data);
    } catch (error) {
      toast.error("Error fetching stock data");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchStockPosition();
  }, []);

  // ====================================================
  // SIZE SORTING (small → large)
  // ====================================================
  const sizePriority = [
    "S", "M", "L", "XL",
    "2XL", "3XL", "4XL", "5XL", "6XL"
  ];

  const parseXL = (size) => {
    if (/^\d+XL$/.test(size)) return parseInt(size);
    return null;
  };

  const sortedSizes = (sizes) =>
    sizes.sort((a, b) => {
      const aXL = parseXL(a);
      const bXL = parseXL(b);

      if (aXL !== null && bXL !== null) return aXL - bXL;
      if (aXL !== null) return 1;
      if (bXL !== null) return -1;

      return sizePriority.indexOf(a) - sizePriority.indexOf(b);
    });

  // ====================================================
  // 1️⃣ Get ALL unique sizes across categories (XS removed)
  // ====================================================
  const allSizes = sortedSizes(
    Array.from(
      new Set(
        stockPositionData.flatMap((cat) =>
          cat.sizes.map((s) => normalizeSize(s.size))
        )
      )
    ).filter((sz) => sz !== "XS")   // ❌ remove XS
  );

  // ====================================================
  // 2️⃣ Build consolidated rows
  // ====================================================
  const tableRows = stockPositionData.map((cat) => {
    const sizeMap = {};
    let totalQty = 0;
    let lastPurchase = null;
    let lastSale = null;

    cat.sizes.forEach((s) => {
      const name = normalizeSize(s.size);

      if (name === "XS") return; // ❌ remove XS completely

      const x = {
        stock: s.stock || 0,
        lastPurchaseDate: s.lastPurchaseDate,
        lastSaleDate: s.lastSaleDate,
      };

      sizeMap[name] = x;
      totalQty += x.stock;

      if (x.lastPurchaseDate && (!lastPurchase || new Date(x.lastPurchaseDate) > new Date(lastPurchase)))
        lastPurchase = x.lastPurchaseDate;

      if (x.lastSaleDate && (!lastSale || new Date(x.lastSaleDate) > new Date(lastSale)))
        lastSale = x.lastSaleDate;
    });

    return {
      id: cat._id,
      category: cat.categoryName,
      sizeMap,
      totalQty,
      lastPurchase,
      lastSale,
    };
  });

  // ====================================================
  // 3️⃣ Apply filters (Category + Size + Search)
  // ====================================================
  const filteredRows = tableRows
    .filter((row) =>
      searchTerm ? row.category.toLowerCase().includes(searchTerm.toLowerCase()) : true
    )
    .filter((row) =>
      selectedCategory ? row.category === selectedCategory : true
    )
    // .filter((row) =>
    //   selectedSizeFilter
    //     ? Object.keys(row.sizeMap).includes(selectedSizeFilter)
    //     : true
    // );

  // ====================================================
  // 4️⃣ UI Rendering (styling untouched)
  // ====================================================
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="w-8 h-8 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Stock Position
          </span>
        </h1>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-4">
            {/* Category Select */}
            <div className="w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSizeFilter("");
                }}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                {stockPositionData.map((cat) => (
                  <option key={cat._id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Select */}
            {/* <div className="w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Size
              </label>
              <select
                value={selectedSizeFilter}
                disabled={!selectedCategory}
                onChange={(e) => setSelectedSizeFilter(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All Sizes</option>
                {selectedCategory &&
                  stockPositionData
                    .find((c) => c.categoryName === selectedCategory)
                    ?.sizes
                    .filter((s) => normalizeSize(s.size) !== "XS") // ❌ remove XS
                    .map((s) => (
                      <option key={s._id} value={normalizeSize(s.size)}>
                        {normalizeSize(s.size)}
                      </option>
                    ))}
              </select>
            </div> */}
          </div>

          {/* Search */}
          <div className="w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Category
            </label>
            <input
              className="w-full p-2 border rounded-lg"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Consolidated Table */}
        <Card className="border rounded-2xl shadow-xl">
          <CardContent className="p-4 overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-50 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="p-3 text-left">Sr</th>
                  <th className="p-3 text-left">Category</th>

                  {allSizes.map((s) => (
                    <th key={s} className="p-3 text-center">{s}</th>
                  ))}

                  <th className="p-3 text-center">Total Qty</th>
                  <th className="p-3 text-center">Last Purchase</th>
                  <th className="p-3 text-center">Last Sale</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row, i) => (
                  <tr key={row.id} className="border-b hover:bg-primary/5">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-semibold">{row.category}</td>

                    {allSizes.map((s) => (
                      <td key={s} className="p-3 text-center">
                        {row.sizeMap[s]?.stock || 0}
                      </td>
                    ))}

                    <td className="p-3 text-center font-bold">{row.totalQty}</td>
                    <td className="p-3 text-center">
                      {row.lastPurchase ? new Date(row.lastPurchase).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-3 text-center">
                      {row.lastSale ? new Date(row.lastSale).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default StockPosition;
