import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@shared/schema";
import { useRoute, useLocation } from "wouter";
import { 
  ChevronLeft, 
  User, 
  Car, 
  Settings, 
  Clock, 
  IndianRupee,
  Edit,
  CheckCircle2,
  XCircle,
  PlayCircle
} from "lucide-react";
import { format } from "date-fns";

export default function JobDetailsPage() {
  const [, params] = useRoute("/job-cards/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;

  const { data: jobCards = [], isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
  });

  const job = jobCards.find(j => j.id === id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Job Card Not Found</h2>
          <Button onClick={() => setLocation("/job-cards")} className="mt-4">
            Back to Job Cards
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">{status}</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">{status}</Badge>;
      case "Completed":
        return <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">{status}</Badge>;
      case "Cancelled":
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/job-cards")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-red-600 tracking-tight">{job.jobNo}</h1>
                {getStatusBadge(job.status)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Created on {format(new Date(job.date), "MMMM dd, yyyy • HH:mm")}
              </p>
            </div>
          </div>
          <Button variant="destructive" className="font-bold flex items-center gap-2">
            <Edit className="h-4 w-4" /> Edit Job Card
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base font-bold">Customer Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Name</p>
                  <p className="text-base font-semibold text-slate-800">{job.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    {job.phoneNumber}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base font-bold">Vehicle Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Make / Model</p>
                  <p className="text-base font-semibold text-slate-800 capitalize">{job.make} {job.model}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle Type</p>
                  <p className="text-base font-semibold text-slate-800">{job.vehicleType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year</p>
                  <p className="text-base font-semibold text-slate-800">{job.year}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">License Plate</p>
                  <p className="text-base font-semibold text-slate-800 uppercase">{job.licensePlate}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base font-bold">Service Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {job.services.map((service, idx) => (
                    <div key={idx} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Type</p>
                        <p className="text-base font-semibold text-slate-800">{service.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Technician</p>
                        <p className="text-base font-semibold text-slate-800">
                          {(() => {
                            if (service.technician) return service.technician;
                            if (job.technician) return job.technician;
                            
                            // Fallback: Parse from service name "Service Name - Tech: Technician Name"
                            const techMatch = service.name.match(/- Tech:\s*(.+)$/i);
                            if (techMatch) return techMatch[1].trim();
                            
                            return "Unassigned";
                          })()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {job.ppfs.map((ppf, idx) => (
                    <div key={idx} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PPF Service</p>
                        <p className="text-base font-semibold text-slate-800">{ppf.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Technician</p>
                        <p className="text-base font-semibold text-slate-800">
                          {(() => {
                            if (job.technician) return job.technician;
                            
                            // Fallback: Parse from service name "Service Name - Tech: Technician Name"
                            const techMatch = ppf.name.match(/- Tech:\s*(.+)$/i);
                            if (techMatch) return techMatch[1].trim();
                            
                            return "Unassigned";
                          })()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {job.accessories.map((accessory, idx) => (
                    <div key={idx} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Accessory</p>
                        <p className="text-base font-semibold text-slate-800">{accessory.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                        <p className="text-base font-semibold text-slate-800">1</p>
                      </div>
                    </div>
                  ))}
                </div>
                {job.serviceNotes && (
                  <div className="p-6 border-t bg-slate-50/30">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Service Notes</p>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{job.serviceNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base font-bold">Pricing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                    <span>Estimated Cost</span>
                    <span className="text-lg font-black text-slate-900">₹{job.estimatedCost.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base font-bold">Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-600 shadow-sm z-10" />
                    <p className="text-xs font-bold text-slate-800">Created</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(job.date), "MMM dd, yyyy • HH:mm")}</p>
                  </div>
                  <div className="relative pl-7">
                    <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm z-10" />
                    <p className="text-xs font-bold text-slate-800">Last Updated</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(job.date), "MMM dd, yyyy • HH:mm")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start font-semibold text-slate-700 h-10 border-slate-200">
                  <PlayCircle className="h-4 w-4 mr-2 text-blue-600" /> Mark as In Progress
                </Button>
                <Button variant="outline" className="w-full justify-start font-semibold text-green-700 hover:text-green-800 hover:bg-green-50 h-10 border-slate-200">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Completed
                </Button>
                <div className="pt-2">
                  <Button variant="ghost" className="w-full justify-start font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 h-10">
                    <XCircle className="h-4 w-4 mr-2" /> Cancel Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
