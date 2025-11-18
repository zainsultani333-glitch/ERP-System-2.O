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
  Tag,
  NotepadTextDashed,
  FileSpreadsheet,
  BookOpenText,
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
import { useAuth } from "../context/AuthContext";

const parentMap = {
  "/setup": "Setup",
  "/inventory": "Inventory",
  "/sales": "Sales",
  "/company-management": "Company Management",
  "/reports": "Reports",
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    subNav: [
      { name: "Product", href: "/inventory/productinfo", icon: Box },
      {
        name: "Stock & Purchase",
        href: "/inventory/stock-purchase",
        icon: ShoppingBag,
      },
      {
        name: "Draft Track",
        href: "/inventory/draft-track",
        icon: NotepadTextDashed,
      },
      {
        name: "Stock Position",
        href: "/inventory/stock-position",
        icon: Package,
      },
    ],
  },
  {
    name: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    subNav: [
      { name: "Sales Invoice", href: "/sales/invoice", icon: FileSpreadsheet },
      {
        name: "Sales History",
        href: "/sales/sales-history",
        icon: ClipboardList,
      },
      {
        name: "Transaction Traking",
        href: "/sales/transaction-traking",
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    name: "Setup",
    href: "/setup",
    icon: Briefcase,
    subNav: [
      {
        name: "Customer Defination",
        href: "/setup/customer-defination",
        icon: User,
      },
      {
        name: "Supplier Information",
        href: "/setup/supplier-information",
        icon: Container,
      },
      { name: "WareHouse", href: "/setup/warehouse", icon: Warehouse },
      { name: "Category", href: "/setup/category-fields", icon: Tag },
    ],
  },
  {
    name: "Company Management",
    href: "/company-management",
    icon: Briefcase,
    subNav: [
      {
        name: "Manage Companies",
        href: "/company-management/manage-companies",
        icon: Edit,
      },
      {
        name: "Company Switcher",
        href: "/company-management/company-switcher",
        icon: Building2,
      },
      {
        name: "Role Access",
        href: "/company-management/role-access-settings",
        icon: Key,
      },
    ],
  },
  { name: "User Management", href: "/user-manegement", icon: User },
  { name: "Barcode", href: "/barcode", icon: Barcode },
  { name: "Communication", href: "/communication", icon: MessageSquare },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    subNav: [
      {
        name: "Customer Ledger",
        href: "/reports/customer-ledger",
        icon: BookOpenText,
      },
      {
        name: "Supplier Ledger",
        href: "/reports/supplier-ledger",
        icon: BookOpenText,
      },
    ],
  },
];

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubNav, setOpenSubNav] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { logout, token } = useAuth();

  const selectedCompany = JSON.parse(
    localStorage.getItem("selectedCompany") || "{}"
  );

  useEffect(() => {
    // find which parent menu matches the current route
    const matchedParent = Object.keys(parentMap).find((key) =>
      location.pathname.startsWith(key)
    );

    if (matchedParent) {
      setOpenSubNav((prev) => ({
        ...prev,
        [parentMap[matchedParent]]: true,
      }));
    }
  }, [location.pathname]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
          // Count unread notifications
          const unread = data.data.filter(notification => !notification.isRead).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Purchase':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Sale':
        return <ShoppingCart className="w-4 h-4" />;
      case 'Inventory':
        return <Package className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
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
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
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
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification._id}
                        className={cn(
                          "flex flex-col items-start p-3 cursor-pointer border-l-2 focus:bg-gray-200 hover:bg-gray-200", // Added hover:bg-gray-200 and focus:bg-gray-200
                          notification.isRead
                            ? "border-l-transparent bg-transparent"
                            : "border-l-blue-500 bg-blue-50"
                        )}
                        onClick={() => markAsRead(notification._id)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className={cn(
                            "p-1 rounded-full mt-0.5",
                            notification.isRead ? "text-gray-400" : "text-blue-600"
                          )}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              notification.isRead ? "text-gray-600" : "text-gray-900"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-blue-600 hover:text-blue-700 hover:bg-gray-200 focus:bg-gray-200 cursor-pointer" // Added hover styles here too
                  onClick={() => navigate("/notifications")}
                >
                  View all notifications
                </DropdownMenuItem>
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
                <DropdownMenuItem
                  onClick={() => navigate("/company-selection")}
                >
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
            "fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:translate-x-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent top-16",
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
                      (isSubOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      ))}
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
                              isActive
                                ? "bg-[#36BFFA] text-white"
                                : "text-sidebar-foreground hover:bg-sidebar-ring"
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
        <main className="flex-1 lg:ml-64 p-6 h-screen overflow-x-auto max-w-full">
          {children}
        </main>
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