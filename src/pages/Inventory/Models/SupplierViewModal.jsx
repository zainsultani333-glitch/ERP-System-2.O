import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Loader, Building2, Mail, Phone, Calendar, DollarSign } from "lucide-react";

const SupplierViewModal = ({ isOpen, onClose, supplier }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl w-[95vw] bg-background/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Supplier Details
          </DialogTitle>
        </DialogHeader>

        {supplier ? (
          <div className="space-y-5 pt-4 text-sm sm:text-base">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <p className="font-medium text-muted-foreground">Supplier Name:</p>
              <p className="font-semibold">{supplier.supplierName}</p>

              <p className="font-medium text-muted-foreground">Company:</p>
              <p className="font-semibold">{supplier.company}</p>

              <p className="font-medium text-muted-foreground">Address:</p>
              <p className="font-semibold">{supplier.address}</p>

              <p className="font-medium text-muted-foreground">VAT Number:</p>
              <p className="font-semibold">{supplier.vatNumber}</p>

              <p className="font-medium text-muted-foreground">Email:</p>
              <p className="font-semibold flex items-center gap-1"><Mail className="w-4 h-4" /> {supplier.email}</p>

              <p className="font-medium text-muted-foreground">Phone:</p>
              <p className="font-semibold flex items-center gap-1"><Phone className="w-4 h-4" /> {supplier.phone}</p>

              <p className="font-medium text-muted-foreground">Last Purchase Date:</p>
              <p className="font-semibold">{new Date(supplier.lastPurchase?.date).toLocaleDateString()}</p>

              <p className="font-medium text-muted-foreground">Last Purchase Price:</p>
              <p className="font-semibold text-green-700">€ {supplier.lastPurchase?.price}</p>

              <p className="font-medium text-muted-foreground">Avg Purchase Price:</p>
              <p className="font-semibold text-blue-700">€ {supplier.avgPurchasePrice}</p>

              <p className="font-medium text-muted-foreground">Total Spendings:</p>
              <p className="font-semibold text-emerald-700">€ {supplier.totalSpendings}</p>

              <p className="font-medium text-muted-foreground">Total Purchased Qty:</p>
              <p className="font-semibold">{supplier.totalPurchasedQty}</p>

              <p className="font-medium text-muted-foreground">Number of Orders:</p>
              <p className="font-semibold">{supplier.numberOfOrders}</p>

              <p className="font-medium text-muted-foreground">Created At:</p>
              <p className="font-semibold">{new Date(supplier.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
            Loading supplier details...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupplierViewModal;
