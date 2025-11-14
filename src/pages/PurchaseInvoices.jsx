import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Printer, Scan } from "lucide-react";
import { toast } from "sonner";

const PurchaseInvoices = () => {
  const [productName, setProductName] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const handleGenerate = () => {
    const code = `BC${Date.now()}`;
    setGeneratedCode(code);
    toast.success("Barcode generated!");
  };

  const handlePrint = () => {
    toast.success("Printing barcode labels...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Barcode Management</h1>
          <p className="text-muted-foreground">Generate, print, and scan product barcodes</p>
        </div>

        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="generate">
              <QrCode className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="print">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </TabsTrigger>
            <TabsTrigger value="scan">
              <Scan className="w-4 h-4 mr-2" />
              Scan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Barcode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      placeholder="Enter product name"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleGenerate} className="w-full">
                    Generate Barcode
                  </Button>
                </CardContent>
              </Card>

              {generatedCode && (
                <Card>
                  <CardHeader>
                    <CardTitle>Barcode Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="w-64 h-32 bg-card border-2 border-dashed rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-mono text-sm mb-2">{generatedCode}</div>
                        <div className="flex gap-1 justify-center">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-1 h-16 bg-foreground" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{productName}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="print">
            <Card>
              <CardHeader>
                <CardTitle>Print Barcode Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Product</Label>
                    <Input placeholder="Search products..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Labels</Label>
                    <Input type="number" placeholder="1" defaultValue="1" />
                  </div>
                </div>
                <Button onClick={handlePrint} className="w-full">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Labels
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle>Scan Barcode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Barcode Scanner Input</Label>
                  <Input
                    placeholder="Scan or enter barcode manually"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        toast.success("Product found and added to invoice!");
                      }
                    }}
                  />
                </div>
                <div className="p-8 border-2 border-dashed rounded-lg text-center">
                  <Scan className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Use scanner or enter barcode above
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseInvoices;
