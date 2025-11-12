import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Package, Calendar, TrendingUp, Layers } from "lucide-react";

const TransactionViewModal = ({ isOpen, onClose, transaction }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl w-[95vw] bg-background/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        {transaction ? (
          <div className="space-y-5 pt-4 text-sm sm:text-base">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <p className="font-medium text-muted-foreground">Item Name:</p>
              <p className="font-semibold">{transaction.itemName || "-"}</p>

              <p className="font-medium text-muted-foreground">Item Code:</p>
              <p className="font-semibold">{transaction.itemCode || "-"}</p>

              <p className="font-medium text-muted-foreground">Category:</p>
              <p className="font-semibold">{transaction.category || "-"}</p>

              <p className="font-medium text-muted-foreground">Total Purchased Qty:</p>
              <p className="font-semibold text-blue-700">{transaction.totalPurchasedQty}</p>

              <p className="font-medium text-muted-foreground">Total Sold Qty:</p>
              <p className="font-semibold text-green-700">{transaction.totalSoldQty}</p>

              <p className="font-medium text-muted-foreground">Current Stock Balance:</p>
              <p className="font-semibold text-purple-700">{transaction.currentStockBalance}</p>

              <p className="font-medium text-muted-foreground">Last Purchase Date:</p>
              <p className="font-semibold">
                {transaction.lastPurchaseDate
                  ? new Date(transaction.lastPurchaseDate).toLocaleDateString()
                  : "-"}
              </p>

              <p className="font-medium text-muted-foreground">Last Sale Date:</p>
              <p className="font-semibold">
                {transaction.lastSaleDate
                  ? new Date(transaction.lastSaleDate).toLocaleDateString()
                  : "-"}
              </p>

              <p className="font-medium text-muted-foreground">Created At:</p>
              <p className="font-semibold">
                {transaction.createdAt
                  ? new Date(transaction.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <Package className="w-10 h-10 mx-auto mb-3 text-primary opacity-50" />
            Loading transaction details...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionViewModal;
