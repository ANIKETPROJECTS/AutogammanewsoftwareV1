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
  PlayCircle,
  Trash2,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function JobDetailsPage() {
  const [, params] = useRoute("/job-cards/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = params?.id;

  const { data: jobCards = [], isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
  });

  const job = jobCards.find(j => j.id === id);

  const updateStatus = async (status: string) => {
    try {
      await apiRequest("PATCH", `/api/job-cards/${id}`, { status });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      toast({
        title: "Status Updated",
        description: `Job card has been marked as ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteJob = async () => {
    if (!confirm("Are you sure you want to delete this job card? This action cannot be undone.")) return;
    
    try {
      await apiRequest("DELETE", `/api/job-cards/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      toast({
        title: "Job Card Deleted",
        description: "The job card has been successfully removed.",
      });
      setLocation("/job-cards");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job card. Please try again.",
        variant: "destructive",
      });
    }
  };

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
            <div className="flex items-center gap-3">
              <Button 
                variant="destructive" 
                className="font-bold flex items-center gap-2"
                onClick={() => setLocation(`/add-job?id=${id}`)}
              >
                <Edit className="h-4 w-4" /> Edit Job Card
              </Button>
              <Button 
                variant="outline" 
                className="font-bold text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                onClick={deleteJob}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
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
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
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
                {job.emailAddress && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                    <p className="text-base font-semibold text-slate-800 break-all">{job.emailAddress}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base font-bold">Vehicle Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Make / Model</p>
                    <p className="text-base font-semibold text-slate-800 capitalize">{job.make} {job.model}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle Type</p>
                    <p className="text-base font-semibold text-slate-800">{(job as any).vehicleType || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year</p>
                    <p className="text-base font-semibold text-slate-800">{job.year}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">License Plate</p>
                    <p className="text-base font-semibold text-slate-800 uppercase">{job.licensePlate}</p>
                  </div>
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
                        <p className="text-base font-semibold text-slate-800">
                          {service.name.split(" - Tech:")[0]}
                        </p>
                      </div>
                    </div>
                  ))}
                  {job.ppfs.map((ppf, idx) => (
                    <div key={idx} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PPF Service</p>
                        <p className="text-base font-semibold text-slate-800">
                          {ppf.name.split(" - Tech:")[0]}
                        </p>
                      </div>
                      {ppf.rollUsed && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SQFT Used</p>
                          <p className="text-base font-semibold text-slate-800">{ppf.rollUsed} SQFT</p>
                        </div>
                      )}
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
                        <p className="text-base font-semibold text-slate-800">{accessory.quantity || 1}</p>
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
                  <div className="flex justify-between items-center text-sm font-medium text-slate-500 pt-2 border-t border-slate-100">
                    <span>Assigned Technician</span>
                    <span className="text-base font-bold text-red-600">
                      {(() => {
                        if (job.technician) return job.technician;
                        if (job.services?.[0]?.technician) return job.services[0].technician;
                        
                        // Fallback: Parse from service name "Service Name - Tech: Technician Name"
                        const techMatch = (job.services?.[0]?.name || "").match(/- Tech:\s*(.+)$/i);
                        if (techMatch) return techMatch[1].trim();
                        
                        return "Unassigned";
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base font-bold">Additional Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Referral Source</p>
                  <p className="text-base font-semibold text-slate-800">{job.referralSource}</p>
                </div>
                {job.referralSource === "Friend/Family" && (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Referrer Name</p>
                      <p className="text-base font-semibold text-slate-800">{job.referrerName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Referrer Phone</p>
                      <p className="text-base font-semibold text-slate-800">{job.referrerPhone || "N/A"}</p>
                    </div>
                  </>
                )}
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start font-semibold text-slate-700 h-10 border-slate-200"
                  onClick={() => updateStatus("In Progress")}
                  disabled={job.status === "In Progress"}
                >
                  <PlayCircle className="h-4 w-4 mr-2 text-blue-600" /> Mark as In Progress
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start font-semibold text-green-700 hover:text-green-800 hover:bg-green-50 h-10 border-slate-200"
                  onClick={() => updateStatus("Completed")}
                  disabled={job.status === "Completed"}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Completed
                </Button>
                <div className="pt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 h-10"
                    onClick={() => updateStatus("Cancelled")}
                    disabled={job.status === "Cancelled"}
                  >
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
