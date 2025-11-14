import { useState, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Table, Loader } from "lucide-react";
import { toast } from "sonner";
import api from "../../Api/AxiosInstance"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const reportData = [
  {
    date: "2024-03-01",
    customer: "Customer A",
    invoice: "INV-1001",
    total: 25000,
    profit: 4500,
    vat: 4250,
  },
  {
    date: "2024-03-02",
    customer: "Customer B",
    invoice: "INV-1002",
    total: 18000,
    profit: 3200,
    vat: 3060,
  },
  {
    date: "2024-03-03",
    customer: "Customer C",
    invoice: "INV-1003",
    total: 32000,
    profit: 5800,
    vat: 5440,
  },
];

const SupplierLedgerReports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);         // Store ledger data
  const [ledgerLoading, setLedgerLoading] = useState(false); // Loading state
  const [selectedSupplier, setSelectedSupplier] = useState(""); // Optional for filtering
  const handleExportPDF = () => {
    toast.success("Exporting report as PDF...");
  };

  const handleExportExcel = () => {
    toast.success("Exporting report as Excel...");
  };

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      setSupplierLoading(true);
      const res = await api.get("/suppliers");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSuppliers(res.data.data);
      } else {
        toast.error("Invalid supplier response");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Error fetching suppliers");
    } finally {
      setSupplierLoading(false);
    }
  };

  // Supplier list fetch on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);


  // Table data fetch for suppliers
  const fetchLedgerReport = async (supplierId = "", start = "", end = "") => {
    try {
      setLedgerLoading(true);

      let query = [];
      if (start) query.push(`dateFrom=${start}`);
      if (end) query.push(`dateTo=${end}`);
      const queryString = query.length ? `?${query.join("&")}` : "";

      const url = supplierId
        ? `/reports/ledger/supplier/${supplierId}${queryString}`
        : `/reports/ledger/supplier${queryString}`;

      const res = await api.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setLedgerData(res.data.data);
      } else {
        toast.error("Invalid ledger response");
        setLedgerData([]);
      }
    } catch (error) {
      console.error("Error fetching ledger:", error);
      toast.error("Error fetching ledger report");
      setLedgerData([]);
    } finally {
      // keep loader for 1.5 seconds
      setTimeout(() => {
        setLedgerLoading(false);
      }, 1500);
    }
  };

  // Fetch supplier ledger on component mount
  useEffect(() => {
    fetchLedgerReport(); // no params
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      fetchLedgerReport(selectedSupplier, startDate, endDate);
    }
  }, [selectedSupplier]);

  // Loader
  const TableLoader = ({ message = "Loading..." }) => {
    return (
      <tr>
        <td colSpan="9" className="py-20 text-center">
          <div className="flex flex-col items-center justify-center">
            <Loader className="w-10 h-10 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              {message}
            </p>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and export business reports
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              {/*  */}

              <div className="space-y-2 relative">
                <Label>Supplier</Label>
                <Select onValueChange={(v) => setSelectedSupplier(v)}>
                  <SelectTrigger className="border-2">
                    {supplierLoading ? (
                      <div className="flex items-center justify-center w-full py-1">
                        <Loader className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <SelectValue placeholder="Select supplier" />
                    )}
                  </SelectTrigger>

                  <SelectContent>
                    {suppliers.map((sup) => (
                      <SelectItem key={sup._id} value={sup._id}>
                        {sup.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>



        {/* Report Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sales Report</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportExcel}>
                <Table className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Sr</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Purchase No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Supplier Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Debit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Credit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Balance</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {ledgerLoading ? (
                    <TableLoader message="Loading ledger data..." />
                  ) : ledgerData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">No data found</td>
                    </tr>
                  ) : (
                    ledgerData.map((row, i) => (
                      <tr key={row._id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3">{new Date(row.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {row.purchaseId?.purchaseNo ?? "-"}
                        </td>
                        <td className="px-4 py-3">{row.supplierId?.supplierName ?? "-"}</td>
                        <td className="px-4 py-3">{row.description ?? "-"}</td>
                        <td className="px-4 py-3">{row.entryType ?? "-"}</td>
                        <td className="px-4 py-3">€ {(row.debit ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">€ {(row.credit ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">€ {(row.balance ?? 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>

                <tfoot className="bg-muted/30 font-semibold">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right">Total:</td>
                    <td className="px-4 py-3">
                      € {ledgerData.reduce((sum, r) => sum + (r.debit ?? 0), 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      € {ledgerData.reduce((sum, r) => sum + (r.credit ?? 0), 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      € {ledgerData.reduce((sum, r) => sum + (r.balance ?? 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SupplierLedgerReports;