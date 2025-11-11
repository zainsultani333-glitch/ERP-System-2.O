import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Barcode,
  MessageSquare,
  FileText,
  Building2,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  Box,
  ShoppingBag,
  Container,
  Edit,
  Warehouse,
  Briefcase,
  Key,
  FileSpreadsheet 
} from "lucide-react";
import { ClipboardList, ArrowRightLeft } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    subNav: [
      { name: "Product", href: "/inventory/productinfo", icon: Box },
      { name: "Stock & Purchase", href: "/inventory/stock-purchase", icon: ShoppingBag },

      { name: "Supplier Information", href: "/inventory/supplier-information", icon: Container },
      { name: "Sales History", href: "/inventory/sales-history", icon: ClipboardList },
      { name: "Transaction Traking", href: "/inventory/transaction-traking", icon: ArrowRightLeft },
      { name: "WareHouse", href: "/inventory/warehouse", icon: Warehouse },

      { name: "Invoice", href: "/inventory/invoice", icon: FileSpreadsheet },

      { name: "Customer Defination", href: "/inventory/customer-defination", icon: User },

    ],
  },
  {
    name: "Company Management",
    href: "/company-management",
    icon: Briefcase, // you can choose a suitable icon for the main parent
    subNav: [
      { name: "Manage Companies", href: "/company-management/manage-companies", icon: Edit },
      { name: "Company Switcher", href: "/company-management/company-switcher", icon: Building2 },
      // { name: "Company Form", href: "/company-management/create-company-form", icon: Briefcase },
      { name: "Role Access", href: "/company-management/role-access-settings", icon: Key },
    ],
  },
  { name: "User Management", href: "/user-manegement", icon: User },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Consignment", href: "/consignment", icon: Truck },
  { name: "Barcode", href: "/barcode", icon: Barcode },
  { name: "Communication", href: "/communication", icon: MessageSquare },
  { name: "Reports", href: "/reports", icon: FileText },
];

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubNav, setOpenSubNav] = useState({});

  const selectedCompany = JSON.parse(localStorage.getItem("selectedCompany") || "{}");
  const isInventoryActive = location.pathname.startsWith("/inventory");
  const isCompanyManagementActive = location.pathname.startsWith("/company-management");

  useEffect(() => {
    if (isInventoryActive) {
      setOpenSubNav((prev) => ({ ...prev, Inventory: true }));
    }
    if (isCompanyManagementActive) {
      setOpenSubNav((prev) => ({ ...prev, "Company Management": true }));
    }
  }, [isInventoryActive, isCompanyManagementActive]);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              <div className="hidden sm:block">
                <h2 className="font-semibold text-foreground">
                  {selectedCompany.name || "Select Company"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedCompany.role || "Role"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Add items later */}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/company-selection")}>
                  <Building2 className="w-4 h-4 mr-2" /> Switch Company
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:translate-x-0 top-16",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="flex flex-col gap-2 p-4">
            {navigation.map((item) => {
              const isSubOpen = openSubNav[item.name];

              return (
                <div key={item.name}>
                  {/* Parent item */}
                  <div
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      location.pathname.startsWith(item.href)
                        ? "bg-[#36BFFA] text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-ring"
                    )}
                    onClick={() => {
                      if (item.subNav) {
                        setOpenSubNav((prev) => ({
                          ...prev,
                          [item.name]: !prev[item.name],
                        }));
                      } else {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </div>
                    {item.subNav &&
                      (isSubOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </div>

                  {/* Child links */}
                  {item.subNav && isSubOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subNav.map((sub) => (
                        <NavLink
                          key={sub.name}
                          to={sub.href}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive ? "bg-[#36BFFA] text-white" : "text-sidebar-foreground hover:bg-sidebar-ring"
                            )
                          }
                        >
                          {sub.icon && <sub.icon className="w-4 h-4" />}
                          <span>{sub.name}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;