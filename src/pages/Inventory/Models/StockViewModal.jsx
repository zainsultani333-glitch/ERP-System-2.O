import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Loader, Package, Warehouse, AlertTriangle, TrendingUp } from "lucide-react";

const StockViewModal = ({ isOpen, onClose, stock }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl w-[95vw] bg-background/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Stock Details
          </DialogTitle>
        </DialogHeader>

        {stock ? (
          <div className="space-y-5 pt-4">
            {/* Image */}
            <div className="flex justify-center">
              <img
                src={stock.itemImage?.url || "/placeholder.png"}
                alt={stock.itemName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover border-2 border-primary/20 shadow-md"
              />
            </div>

            {/* Info */}
            <div className="space-y-3 text-sm sm:text-base px-1 sm:px-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <p className="font-medium text-muted-foreground">Item Code:</p>
                <p className="font-semibold break-all">{stock.itemCode}</p>

                <p className="font-medium text-muted-foreground">Item Name:</p>
                <p className="font-semibold">{stock.itemName}</p>

                <p className="font-medium text-muted-foreground">Category:</p>
                <p className="font-semibold">{stock.category}</p>

                <p className="font-medium text-muted-foreground">Unit:</p>
                <p className="font-semibold">{stock.unitOfMeasure}</p>

                <p className="font-medium text-muted-foreground">Warehouse:</p>
                <p className="font-semibold">
                  {stock.warehouseId?.warehouseName || "—"}
                </p>

                <p className="font-medium text-muted-foreground">Address:</p>
                <p className="font-semibold">
                  {stock.warehouseId?.warehouseAddress || "—"}
                </p>

                <p className="font-medium text-muted-foreground">In-Charge:</p>
                <p className="font-semibold">
                  {stock.warehouseId?.inCharge?.name || "—"}
                </p>

                <p className="font-medium text-muted-foreground">Opening Stock:</p>
                <p className="font-semibold text-blue-700">
                  {stock.openingStock}
                </p>

                <p className="font-medium text-muted-foreground">Purchase Rate:</p>
                <p className="font-semibold text-green-700">
                  € {stock.purchaseRate?.toLocaleString()}
                </p>

                <p className="font-medium text-muted-foreground">Selling Price:</p>
                <p className="font-semibold text-green-700">
                  € {stock.sellingPrice?.toLocaleString()}
                </p>

                <p className="font-medium text-muted-foreground">Wholesale Price:</p>
                <p className="font-semibold text-green-700">
                  € {stock.wholesalePrice?.toLocaleString()}
                </p>

                <p className="font-medium text-muted-foreground">Min Stock Level:</p>
                <p className="font-semibold text-amber-700">
                  {stock.minStockLevel}
                </p>

                <p className="font-medium text-muted-foreground">Profit / Item:</p>
                <p className="font-semibold text-emerald-700">
                  € {stock.profitPerItem}
                </p>

                <p className="font-medium text-muted-foreground">Margin %:</p>
                <p className="font-semibold text-emerald-700">
                  {stock.marginPercent}%
                </p>

                <p className="font-medium text-muted-foreground">Created At:</p>
                <p className="font-semibold">
                  {new Date(stock.createdAt).toLocaleDateString()}
                </p>

                <p className="font-medium text-muted-foreground">Updated At:</p>
                <p className="font-semibold">
                  {new Date(stock.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-muted-foreground mb-1">
                  Description:
                </p>
                <p className="bg-muted/80 rounded-md p-3 text-foreground text-sm sm:text-base break-words">
                  {stock.description || "No description available"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
            Loading stock details...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockViewModal;
