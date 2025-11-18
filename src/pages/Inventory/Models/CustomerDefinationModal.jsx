import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Loader } from "lucide-react";

const CustomerViewModal = ({ isOpen, onClose, customer }) => {
  console.log(customer);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-xl w-[95vw] bg-background/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Customer Details
          </DialogTitle>
        </DialogHeader>

        {customer ? (
          <div className="space-y-5 pt-4">
            <div className="space-y-3 text-sm sm:text-base px-1 sm:px-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <p className="font-medium text-muted-foreground">
                  Customer Code:
                </p>
                <p className="font-semibold break-all">
                  {customer.customerCode}
                </p>

                <p className="font-medium text-muted-foreground">
                  Customer Name:
                </p>
                <p className="font-semibold">{customer.customerName}</p>

                <p className="font-medium text-muted-foreground">
                  Phone Number:
                </p>
                <p className="font-semibold">{customer.phoneNumber}</p>
                 <p className="font-medium text-muted-foreground">
                  City:
                </p>
                <p className="font-semibold">{customer.city}</p>

                <p className="font-medium text-muted-foreground">
                  Postal code:
                </p>
                <p className="font-semibold">{customer.postalCode}</p>

                <p className="font-medium text-muted-foreground">Email:</p>
                <p className="font-semibold break-all">{customer.email}</p>

                <p className="font-medium text-muted-foreground">
                  Billing Address:
                </p>
                <p className="font-semibold">{customer.billingAddress}</p>

                <p className="font-medium text-muted-foreground">Country:</p>
                <p className="font-semibold">{customer.country}</p>

                <p className="font-medium text-muted-foreground">VAT Number:</p>
                <p className="font-semibold">{customer.vatNumber}</p>

                <p className="font-medium text-muted-foreground">
                  Customer Type:
                </p>
                <p className="font-semibold">{customer.customerType}</p>

                <p className="font-medium text-muted-foreground">
                  Default VAT Rate:
                </p>
                <p className="font-semibold">{customer.defaultVatRate}%</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
            Loading customer details...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerViewModal;
