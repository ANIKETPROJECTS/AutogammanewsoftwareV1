import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import AppointmentsPage from "@/pages/appointments";
import MastersPage from "@/pages/masters";
import AccessoryCategoryDetail from "@/pages/accessory-category-detail";
import TechniciansPage from "@/pages/technicians";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

// Public Route Wrapper (redirects to dashboard if already logged in)
function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicRoute component={LoginPage} />
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>

      {/* Redirect placeholder routes to dashboard for now */}
      <Route path="/inquiry"><ProtectedRoute component={DashboardPage} /></Route>
      <Route path="/job-cards"><ProtectedRoute component={DashboardPage} /></Route>
      <Route path="/add-job"><ProtectedRoute component={DashboardPage} /></Route>
      <Route path="/invoice"><ProtectedRoute component={DashboardPage} /></Route>
      <Route path="/technicians"><ProtectedRoute component={TechniciansPage} /></Route>
      <Route path="/appointments"><ProtectedRoute component={AppointmentsPage} /></Route>
      <Route path="/tickets"><ProtectedRoute component={DashboardPage} /></Route>
      <Route path="/masters">
        <ProtectedRoute component={MastersPage} />
      </Route>
      <Route path="/masters/accessory-category/:id">
        <ProtectedRoute component={AccessoryCategoryDetail} />
      </Route>
      <Route path="/settings"><ProtectedRoute component={DashboardPage} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
