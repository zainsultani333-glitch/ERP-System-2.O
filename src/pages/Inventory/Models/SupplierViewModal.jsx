import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Loader,
  Mail,
  Phone,
  Package,
} from "lucide-react";

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

        {/* When loading */}
        {!supplier ? (
          <div className="text-center text-muted-foreground py-10">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
            Loading supplier details...
          </div>
        ) : (
          <div className="space-y-5 pt-4 text-sm sm:text-base">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">

              {/* Supplier Name */}
              <p className="font-medium text-muted-foreground">Supplier Name:</p>
              <p className="font-semibold">{supplier.supplierName || "-"}</p>

              {/* Company */}
              <p className="font-medium text-muted-foreground">Company:</p>
              <p className="font-semibold">{supplier.company || "-"}</p>

              {/* Address */}
              <p className="font-medium text-muted-foreground">Address:</p>
              <p className="font-semibold">{supplier.address || "-"}</p>

              {/* VAT Number */}
              <p className="font-medium text-muted-foreground">VAT Number:</p>
              <p className="font-semibold">{supplier.vatNumber || "-"}</p>

              {/* Email */}
              <p className="font-medium text-muted-foreground">Email:</p>
              <p className="font-semibold flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {supplier.email || "-"}
              </p>

              {/* Phone */}
              <p className="font-medium text-muted-foreground">Phone:</p>
              <p className="font-semibold flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {supplier.phone || "-"}
              </p>

              {/* Avg Purchase Price */}
              <p className="font-medium text-muted-foreground">Avg Purchase Price:</p>
              <p className="font-semibold text-blue-700">
                € {(supplier.avgPurchasePrice || 0).toLocaleString()}
              </p>

              {/* Total Spendings */}
              <p className="font-medium text-muted-foreground">Total Spendings:</p>
              <p className="font-semibold text-emerald-700">
                € {(supplier.totalSpendings || 0).toLocaleString()}
              </p>

              {/* Total Purchased Qty */}
              <p className="font-medium text-muted-foreground">Total Purchased Qty:</p>
              <p className="font-semibold">
                {supplier.totalPurchasedQty || 0}
              </p>

              {/* Number of Orders */}
              <p className="font-medium text-muted-foreground">Number of Orders:</p>
              <p className="font-semibold">
                {supplier.numberOfOrders || 0}
              </p>

             
            
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupplierViewModal;
