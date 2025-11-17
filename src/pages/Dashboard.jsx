import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, DollarSign, Package, TrendingUp, Users } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Total Sales", value: "€ 2.4M", change: "+12.5%", icon: DollarSign, trend: "up" },
    { title: "Stock Value", value: "€ 1.2M", change: "+8.2%", icon: Package, trend: "up" },
    { title: "Profit Margin", value: "18.3%", change: "+2.1%", icon: TrendingUp, trend: "up" },
    { title: "Active Customers", value: "234", change: "+5", icon: Users, trend: "up" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Invoice #{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">Customer {i}</p>
                    </div>
                    <p className="font-semibold">€ {(Math.random() * 50000 + 10000).toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Item A", "Item B", "Item C"].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item}</p>
                      <p className="text-sm text-muted-foreground">SKU: {1000 + i}</p>
                    </div>
                    <Button size="sm" variant="outline">Reorder</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
