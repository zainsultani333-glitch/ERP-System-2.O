import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Loader } from "lucide-react";

const StockViewModal = ({ isOpen, onClose, stock }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl w-[95vw] bg-background/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
           Stock Purchase Details
          </DialogTitle>
        </DialogHeader>

        {stock ? (
          <div className="space-y-5 pt-4 px-2">
            {/* ================= PURCHASE DETAILS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm sm:text-base">
              <p className="font-medium text-muted-foreground">Purchase No:</p>
              <p className="font-semibold">{stock.purchaseNo}</p>

              <p className="font-medium text-muted-foreground">
                Purchase Date:
              </p>
              <p className="font-semibold">
                {new Date(stock.purchaseDate).toLocaleDateString()}
              </p>

              <p className="font-medium text-muted-foreground">Supplier:</p>
              <p className="font-semibold">
                {stock.supplier?.supplierName || "—"}
              </p>

              <p className="font-medium text-muted-foreground">Warehouse:</p>
              <p className="font-semibold">
                {stock.warehouse?.warehouseName || "—"}
              </p>

              <p className="font-medium text-muted-foreground">Tracking No:</p>
              <p className="font-semibold">{stock.trackingNumber}</p>

              <p className="font-medium text-muted-foreground">Status:</p>
              <p className="font-semibold">{stock.status}</p>
            </div>

            {/* ================= ITEM DETAILS ================= */}
            <div className="border-t border-border/40 pt-4">
              <h3 className="font-semibold text-lg mb-2">Item Details</h3>

              {stock.items?.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm sm:text-base">
                    <thead className="bg-muted/60 text-left">
                      <tr>
                        <th className="p-2 font-medium">#</th>
                        <th className="p-2 font-medium">Item Name</th>
                        <th className="p-2 font-medium">Description</th>
                        <th className="p-2 font-medium">Qty</th>
                        <th className="p-2 font-medium">Unit Cost</th>
                        <th className="p-2 font-medium">Barcode</th>
                      </tr>
                    </thead>

                    <tbody>
                      {stock.items.map((itm, index) => (
                        <tr
                          key={index}
                          className="border-t border-border/20 hover:bg-muted/40 transition"
                        >
                          <td className="p-2">{index + 1}</td>

                          <td className="p-2 font-semibold">
                            {itm.itemId?.itemName}
                          </td>

                          <td className="p-2">{itm.description}</td>

                          <td className="p-2 font-medium">{itm.quantity}</td>

                          <td className="p-2 text-green-700 font-semibold">
                            € {itm.unitCost?.toLocaleString()}
                          </td>

                          <td className="p-2 font-mono">{itm.barcode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No items available
                </p>
              )}
            </div>

            {/* ================= TOTALS ================= */}
            <div className="border-t border-border/40 pt-4 text-sm sm:text-base">
              <h3 className="font-semibold text-lg mb-2">Totals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <p className="font-medium text-muted-foreground">Net Total:</p>
                <p className="font-semibold">
                  € {stock.netTotal?.toLocaleString()}
                </p>

               

                <p className="font-medium text-muted-foreground">
                  Grand Total:
                </p>
                <p className="font-semibold text-primary text-lg">
                  € {stock.grandTotal?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
            Loading details...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StockViewModal;
