import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import api from "../../Api/AxiosInstance";
import { Package, X } from "lucide-react";
import Pagination from "../../components/Pagination";

const StockPosition = () => {
  const [allItems, setAllItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true); // ⭐ NEW LOADING FOR SELECT FIELD
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // you can increase if needed

  const [loading, setLoading] = useState(false);
  const [stockPositionData, setStockPositionData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [grandTotalStockValue, setGrandTotalStockValue] = useState(0);

  // Normalize size
  const normalizeSize = (size) => {
    if (!size) return "";
    const s = size.toUpperCase();
    if (s === "SM") return "S";
    if (s === "MD") return "M";
    return s;
  };

  // ⭐ NEW: Fetch all items for dropdown
  const fetchItems = async () => {
    try {
      setItemsLoading(true);
      const res = await api.get("/inventory/items");
      setAllItems(res.data.data);
    } catch (err) {
      console.log("Error loading items");
    } finally {
      setTimeout(() => setItemsLoading(false), 500);
    }
  };

  const fetchStockPosition = async () => {
    try {
      setLoading(true);

      const res = await api.get("/inventory/items/stock-position");

      setStockPositionData(res.data.data);
      setGrandTotalStockValue(res.data.grandTotalStockValue || 0);
    } catch (error) {
      toast.error("Error fetching stock data");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchStockPosition();
    fetchItems();
  }, []);

  const sizePriority = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"];

  const sortedSizes = (sizes) =>
    sizes.sort((a, b) => sizePriority.indexOf(a) - sizePriority.indexOf(b));

  const allSizes = sortedSizes(
    Array.from(
      new Set(
        stockPositionData.flatMap((item) =>
          item.sizes.map((s) => normalizeSize(s.size))
        )
      )
    ).filter((sz) => sz !== "XS")
  );

  // ⭐ UPDATED TABLE ROWS WITH itemName ADDED
  const tableRows = stockPositionData.map((item) => {
    const sizeMap = {};
    item.sizes.forEach((s) => {
      const size = normalizeSize(s.size);
      sizeMap[size] = { stock: s.stock };
    });

    // ⭐ Calculate totalQty from sizeMap
    const totalQtyCalculated = Object.values(sizeMap).reduce(
      (acc, s) => acc + (s.stock || 0),
      0
    );

    return {
      id: item._id,
      itemName: item.itemName,
      category: item.category,
      sizeMap,
      totalQty: totalQtyCalculated, // ⭐ Fixed here
      totalSold: item.totalSold,
      totalPurchased: item.totalPurchased,
      lastPurchase: item.lastPurchase,
      lastSale: item.lastSale,
      stockValue: item.stockValue,
    };
  });

  // ⭐ FILTER BY itemName INSTEAD OF CATEGORY
  const filteredRows = tableRows
    .filter((row) =>
      selectedCategory ? row.itemName === selectedCategory : true
    )
    .filter((row) =>
      searchTerm
        ? row.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.itemName.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentRows = filteredRows.slice(startIndex, endIndex);
  console.log({ currentRows });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="w-8 h-8 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Stock Position
          </span>
        </h1>

        {/* FILTER SECTION */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-4">
            <div className="w-[250px] relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Item
              </label>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-lg pr-8"
                disabled={itemsLoading}
              >
                {itemsLoading ? (
                  <option>Loading items...</option>
                ) : (
                  <>
                    <option value="">All Items</option>
                    {allItems.map((item, i) => (
                      <option key={i} value={item.itemName}>
                        {item.itemName}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* ❌ Cancel filter button */}
              {selectedCategory && !itemsLoading && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="absolute right-7 top-[35px] text-gray-500 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              className="w-full p-2 border rounded-lg"
              placeholder="Search ItemName or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <Card className="border rounded-2xl shadow-xl">
          <CardContent className="p-4 overflow-x-auto">
            <table className="min-w-full  table-auto border-collapse">
              <thead className="bg-gray-50 text-gray-700 uppercase text-sm">
                <tr className=" ">
                  <th className="p-3 text-left">Sr</th>
                  <th className="p-3 text-left ">Item Name</th>
                  <th className="p-3 text-left">Category</th>

                  {allSizes.map((s) => (
                    <th key={s} className="p-3 text-center">
                      {s}
                    </th>
                  ))}

                  <th className="p-3 text-left">Total Qty</th>
                  <th className="p-3 text-left">Total Sold</th>
                  <th className="p-3 text-left">Total Purchased</th>
                  <th className="p-3 text-left">Stock Value</th>
                  <th className="p-3 text-center whitespace-nowrap">Last Purchase Date</th>
                <th className="p-3 text-center whitespace-nowrap ">Last Sale Date</th>

                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3 + allSizes.length + 6}
                      className="py-20 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
                        <p className="text-sm text-gray-500 font-medium">
                          Loading stock data...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : currentRows.length > 0 ? (
                  currentRows.map((row, i) => (
                    <tr
                      key={row.id}
                      className="border-b  hover:bg-primary/5"
                    >
                      <td className="p-3">{startIndex + i + 1}</td>
                      <td className="p-3 font-semibold whitespace-normal break-words ">
                        {row.itemName || "-"}
                      </td>

                      <td className="p-3 font-semibold">
                        {row.category || "-"}
                      </td>

                      {allSizes.map((s) => (
                        <td key={s} className="p-3 text-center">
                          {row.sizeMap[s]?.stock || 0}
                        </td>
                      ))}

                      <td className="p-3 text-left font-bold">
                        {row.totalQty ?? "-"}
                      </td>
                      <td className="p-3 text-left font-bold">
                        {row.totalSold ?? "-"}
                      </td>
                      <td className="p-3 text-left font-bold">
                        {row.totalPurchased ?? "-"}
                      </td>

                      <td className="p-3 text-left font-bold">
                        {row.stockValue?.toFixed(2) ?? "-"}
                      </td>

                      <td className="p-3 text-left">
                        {row.lastPurchase && row.lastPurchase !== "-"
                          ? new Date(row.lastPurchase).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-3 text-left ">
                        {row.lastSale && row.lastSale !== "-"
                          ? new Date(row.lastSale).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3 + allSizes.length + 6}
                      className="text-center py-10 text-gray-500 font-medium"
                    >
                      <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      No Stock Position Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ⭐ GRAND TOTAL */}
            <div className="w-full text-right mt-4 pr-4 border-t pt-4">
              <span className="text-lg font-bold text-primary">
                Grand Total Stock Value: {grandTotalStockValue}
              </span>
            </div>

            <div className="w-full  mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredRows.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StockPosition;
