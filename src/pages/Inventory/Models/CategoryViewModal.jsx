import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Loader } from "lucide-react";

export default function CategoryViewDialog({ isOpen, onOpenChange, category }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg sm:max-w-xl w-[95vw] bg-background/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader className="border-b border-border/40 pb-3">
                    <DialogTitle className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Category Details
                    </DialogTitle>
                </DialogHeader>

                {category ? (
                    <div className="space-y-5 pt-4">
                        {/* Logo */}
                        {category.logo && (
                            <div className="flex justify-center">
                                <img
                                    src={category.logo}
                                    alt={category.name}
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover border-2 border-primary/20 shadow-md"
                                />
                            </div>
                        )}

                        {/* Info */}
                        <div className="space-y-3 text-sm sm:text-base px-1 sm:px-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <p className="font-medium text-muted-foreground">Category Name:</p>
                                <p className="font-semibold break-all">{category.name}</p>

                                <p className="font-medium text-muted-foreground">Status:</p>
                                <p className="font-semibold">{category.status}</p>

                                <p className="font-medium text-muted-foreground">Description:</p>
                                <p className="font-semibold break-words">{category.description || "No description available"}</p>

                              
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <Loader className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
                        Loading category details...
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
