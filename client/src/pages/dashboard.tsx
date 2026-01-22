import { useDashboard } from "@/hooks/use-dashboard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/ui/stat-card";
import { 
  DollarSign, 
  Wrench, 
  MessageCircle, 
  Users 
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const COLORS = ['#D32F2F', '#FF8A65', '#FFCDD2', '#BDBDBD'];

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  // Map backend icon string to component if dynamic, otherwise static mapping
  const getIcon = (key: string) => {
    switch (key) {
      case "Today's Sales": return <DollarSign className="h-6 w-6" />;
      case "Active Service Jobs": return <Wrench className="h-6 w-6" />;
      case "Inquiries Today": return <MessageCircle className="h-6 w-6" />;
      case "Total Customers": return <Users className="h-6 w-6" />;
      default: return <DollarSign className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Topbar />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">Welcome back, here's what's happening at Auto Gamma today.</p>
              </div>
              <div className="hidden sm:block text-sm text-muted-foreground font-medium bg-white px-4 py-2 rounded-lg border border-border">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <StatCard 
                    label={stat.label}
                    value={stat.value}
                    subtext={stat.subtext}
                    icon={getIcon(stat.label)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Charts Section 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Trends - Takes up 2 cols */}
              <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Sales Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.salesTrends}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#D32F2F" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                          itemStyle={{color: '#D32F2F', fontWeight: 600}}
                        />
                        <Area type="monotone" dataKey="value" stroke="#D32F2F" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Status Pie Chart */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Customer Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.customerStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {data?.customerStatus.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Growth */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Customer Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.customerGrowth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        />
                        <Area type="monotone" dataKey="value" stroke="#1f2937" strokeWidth={2} fill="#f3f4f6" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory By Category */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Inventory by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.inventoryByCategory} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#D32F2F" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white border-r hidden lg:block p-6">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
