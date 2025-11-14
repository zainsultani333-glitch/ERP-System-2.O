import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Table, Loader } from "lucide-react";
import { toast } from "sonner";
import api from "../../Api/AxiosInstance";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const CustomerLedgerReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const handleExportPDF = () => {
    toast.success("Exporting report as PDF...");
  };

  const handleExportExcel = () => {
    toast.success("Exporting report as Excel...");
  };


  // Fetch Customer
  const fetchCustomers = async () => {
    try {
      setCustomerLoading(true);

      const res = await api.get("/customers");
      console.log("Res", res.data);

      if (res.data?.success && Array.isArray(res.data.data)) {
        setCustomers(res.data.data);
      } else {
        toast.error("Invalid customer response");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error fetching customers");
    } finally {
      setTimeout(() => setCustomerLoading(false), 500);
    }
  };

  // Customer list
  useEffect(() => {
    fetchCustomers();
  }, []);


  // Table data fetch
  const fetchLedgerReport = async (customerId = "", start = "", end = "") => {
    try {
      setLedgerLoading(true);

      // Build query params
      let query = [];
      if (start) query.push(`dateFrom=${start}`);
      if (end) query.push(`dateTo=${end}`);
      const queryString = query.length ? `?${query.join("&")}` : "";

      // Build URL
      const url = customerId
        ? `/reports/ledger/customer/${customerId}${queryString}`
        : `/reports/ledger/customer${queryString}`;

      setTimeout(async () => {
        const res = await api.get(url);
        console.log("Ledger API Response", res.data);

        if (res.data?.success && Array.isArray(res.data.data)) {
          setLedgerData(res.data.data);
        } else {
          toast.error("Invalid ledger response");
          setLedgerData([]);
        }
        setLedgerLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error fetching ledger:", error);
      toast.error("Error fetching ledger report");
      setLedgerData([]);
      setLedgerLoading(false);
    }
  };


  // 1️⃣ Fetch all data initially
  useEffect(() => {
    fetchLedgerReport(); // no params, show all data
  }, []);

  // 2️⃣ Fetch filtered data when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      fetchLedgerReport(selectedCustomer, startDate, endDate);
    }
  }, [selectedCustomer]);

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
              <div className="space-y-2 relative">
                <Label>Customer</Label>
                <Select onValueChange={(v) => setSelectedCustomer(v)}>
                  <SelectTrigger className="border-2 relative">
                    {customerLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <SelectValue placeholder="Select customer" />
                    )}
                  </SelectTrigger>

                  <SelectContent>
                    {customers.map((cust) => (
                      <SelectItem key={cust._id} value={cust._id}>
                        {cust.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {/*  */}
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
                    <th className="px-4 py-3 text-left text-sm font-medium">Invoice No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Customer Name</th>
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
                      <tr key={row._id || i} className="hover:bg-muted/30">
                        <td className="px-4 py-3">{i + 1}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(row?.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{row?.invoiceId?.invoiceNo ?? "-"}</td>
                        <td className="px-4 py-3">{row?.customerId?.customerName ?? "-"}</td>
                        <td className="px-4 py-3">{row?.description ?? "-"}</td>
                        <td className="px-4 py-3">{row?.entryType ?? "-"}</td>
                        <td className="px-4 py-3">€ {(row?.debit ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">€ {(row?.credit ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">€ {(row?.balance ?? 0).toLocaleString()}</td>
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

export default CustomerLedgerReport;