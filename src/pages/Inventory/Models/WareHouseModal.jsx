import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

const WarehouseViewModal = ({ isOpen, onClose, viewWarehouse }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg sm:max-w-xl w-[95vw] bg-background/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="border-b border-border/40 pb-3">
                    <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Warehouse Details
                    </DialogTitle>
                </DialogHeader>

                {viewWarehouse && (
                    <div className="space-y-5 pt-4 px-2 sm:px-4 text-sm sm:text-base">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            <p className="font-medium text-muted-foreground">Name:</p>
                            <p className="font-semibold break-words">{viewWarehouse.name}</p>

                            <p className="font-medium text-muted-foreground">Address:</p>
                            <p className="font-semibold break-words">{viewWarehouse.address}</p>

                            <p className="font-medium text-muted-foreground">Incharge Name:</p>
                            <p className="font-semibold break-words">{viewWarehouse.incharge?.name}</p>

                            <p className="font-medium text-muted-foreground">Incharge Contact:</p>
                            <p className="font-semibold break-words">{viewWarehouse.incharge?.contact}</p>

                            <p className="font-medium text-muted-foreground">Incharge Email:</p>
                            <p className="font-semibold break-words">{viewWarehouse.incharge?.email}</p>

                            <p className="font-medium text-muted-foreground">Items in Stock:</p>
                            <p className="font-semibold">{viewWarehouse.itemsInStock}</p>

                            <p className="font-medium text-muted-foreground">Purchase Value:</p>
                            <p className="font-semibold">€ {viewWarehouse.PurchaseValue.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WarehouseViewModal;
