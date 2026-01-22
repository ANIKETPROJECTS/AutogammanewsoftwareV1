import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  PlusSquare, 
  FileCheck, 
  Wrench, 
  Calendar, 
  Ticket, 
  Database,
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Search, label: "Inquiry", href: "/inquiry" },
  { icon: ClipboardList, label: "Job cards", href: "/job-cards" },
  { icon: PlusSquare, label: "Add Job", href: "/add-job" },
  { icon: FileCheck, label: "Invoice", href: "/invoice" },
  { icon: Wrench, label: "Technicians", href: "/technicians" },
  { icon: Calendar, label: "Appointment", href: "/appointments" },
  { icon: Ticket, label: "Tickets", href: "/tickets" },
  { icon: Database, label: "Masters", href: "/masters" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="h-screen w-64 bg-white border-r border-border flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Auto<span className="text-primary">Gamma</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                location === item.href
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", location === item.href ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
