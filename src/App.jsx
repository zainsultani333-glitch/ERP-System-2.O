import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import CompanySelection from "./pages/CompanySelection";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Consignment from "./pages/Consignment";
import Barcode from "./pages/Barcode";
import Communication from "./pages/Communication";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import WareHouse from "./pages/Inventory/WareHouse";
import Signup from "./pages/SignUpPage";
// Direct Inventory Pages (No Sidebar or Layout)
import ProductInfo from "./pages/Inventory/ProductInfo";
import StockPurchaseDetails from "./pages/Inventory/StockPurchaseDetails";
import UserManegement from "./pages/UserManegement/UserManegement";
import SupplierInformation from "./pages/Inventory/SupplierInformation";
import SalesHistory from "./pages/Inventory/SalesHistory";
import TransactionTracking from "./pages/Inventory/TransactionTracking";
import CustomerDefination from "./pages/Inventory/CustomerDefination";
// Company Management Pages
import ManageCompanies from "./pages/CompanyManagement/ManageCompanies";
import CompanySwitcher from "./pages/CompanyManagement/CompanySwitcher";
import CreateCompanyForm from "./pages/CompanyManagement/CreateCompanyForm";
import RoleAccessSettings from "./pages/CompanyManagement/RoleAccessSettings";
import Invoice from "./pages/Inventory/Invoice";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/company-selection" element={<CompanySelection />} />

          {/* Protected Routes (All use DashboardLayout inside their page) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/consignment" element={<Consignment />} />
          <Route path="/barcode" element={<Barcode />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/reports" element={<Reports />} />

          {/* Inventory Pages – Direct, No Sidebar */}
          <Route path="/inventory/productinfo" element={<ProductInfo />} />
          <Route path="/inventory/stock-purchase" element={<StockPurchaseDetails />} />
          <Route path="/inventory/supplier-information" element={<SupplierInformation />} />
          <Route path="/inventory/sales-history" element={<SalesHistory />} />
          <Route path="/inventory/transaction-traking" element={<TransactionTracking />} />

          <Route path="/inventory/invoice" element={<Invoice />} />

          <Route path="/inventory/customer-defination" element={<CustomerDefination />} />


          {/* Company Management Pages */}
          <Route path="/company-management/manage-companies" element={<ManageCompanies />} />
          <Route path="/company-management/company-switcher" element={<CompanySwitcher />} />
          <Route path="/company-management/create-company-form" element={<CreateCompanyForm />} />
          <Route path="/company-management/role-access-settings" element={<RoleAccessSettings />} />
          {/* user Mangement */}
          <Route path="/user-manegement" element={<UserManegement />} />

          <Route path="/inventory/warehouse" element={<WareHouse />} />
          <Route path="/signup" element={<Signup />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;