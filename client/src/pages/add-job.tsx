import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ServiceMaster, PPFMaster, AccessoryMaster, JobCard } from "@shared/schema";
import { api } from "@shared/routes";
import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  User, 
  Car, 
  Settings, 
  Shield, 
  Package, 
  FileText, 
  Trash2 
} from "lucide-react";

  const jobCardSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    emailAddress: z.string().optional().or(z.literal("")),
    referralSource: z.string().min(1, "Referral source is required"),
    referrerName: z.string().optional().or(z.literal("")),
    referrerPhone: z.string().optional().or(z.literal("")),
    make: z.string().min(1, "Vehicle make is required"),
    model: z.string().min(1, "Vehicle model is required"),
    year: z.string().min(1, "Vehicle year is required"),
    licensePlate: z.string().min(1, "License plate is required"),
    vehicleType: z.string().optional(),
    services: z.array(z.any()).default([]),
    ppfs: z.array(z.any()).default([]),
    accessories: z.array(z.any()).default([]),
    laborCharge: z.coerce.number().default(0),
    discount: z.coerce.number().default(0),
    gst: z.coerce.number().default(18),
    serviceNotes: z.string().optional().or(z.literal("")),
    status: z.string().optional(),
    date: z.string().optional(),
    estimatedCost: z.number().optional(),
    technician: z.string().optional(),
  });

  type JobCardFormValues = z.infer<typeof jobCardSchema>;

export default function AddJobPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const jobId = searchParams.get("id");

  const { data: jobToEdit, isLoading: isLoadingJob } = useQuery<JobCard>({
    queryKey: ["/api/job-cards", jobId],
    queryFn: async () => {
      console.log("Fetching job for edit, jobId:", jobId);
      const res = await fetch(`/api/job-cards/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job");
      const data = await res.json();
      console.log("Fetched job data:", data);
      return data;
    },
    enabled: !!jobId,
  });

  const form = useForm<JobCardFormValues>({
    resolver: zodResolver(jobCardSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      emailAddress: "",
      referralSource: "",
      referrerName: "",
      referrerPhone: "",
      make: "",
      model: "",
      year: "",
      licensePlate: "",
      vehicleType: "",
      services: [],
      ppfs: [],
      accessories: [],
      laborCharge: 0,
      discount: 0,
      gst: 18,
      serviceNotes: "",
    },
  });

  useEffect(() => {
    if (jobToEdit) {
      form.reset({
        customerName: jobToEdit.customerName,
        phoneNumber: jobToEdit.phoneNumber,
        emailAddress: jobToEdit.emailAddress || "",
        referralSource: jobToEdit.referralSource || "",
        referrerName: jobToEdit.referrerName || "",
        referrerPhone: jobToEdit.referrerPhone || "",
        make: jobToEdit.make,
        model: jobToEdit.model,
        year: jobToEdit.year,
        licensePlate: jobToEdit.licensePlate,
        vehicleType: jobToEdit.vehicleType || "",
        services: (jobToEdit.services || []).map(s => ({
          serviceId: (s as any).serviceId || (s as any).id,
          name: s.name,
          price: s.price,
          technician: s.technician
        })),
        ppfs: (jobToEdit.ppfs || []).map(p => ({
          ppfId: (p as any).ppfId || (p as any).id,
          name: p.name,
          price: p.price,
          technician: p.technician,
          rollUsed: p.rollUsed,
          warranty: (p as any).warranty || p.name.match(/\((.*)\)/)?.[1]?.split(" - ")?.[1] || ""
        })),
        accessories: (jobToEdit.accessories || []).map(a => ({
          accessoryId: (a as any).accessoryId || (a as any).id,
          name: a.name,
          price: a.price,
          quantity: a.quantity
        })),
        laborCharge: jobToEdit.laborCharge,
        discount: jobToEdit.discount,
        gst: jobToEdit.gst,
        serviceNotes: jobToEdit.serviceNotes || "",
      });
    }
  }, [jobToEdit, form]);

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const { fields: ppfFields, append: appendPPF, remove: removePPF } = useFieldArray({
    control: form.control,
    name: "ppfs",
  });

  const { fields: accessoryFields, append: appendAccessory, remove: removeAccessory } = useFieldArray({
    control: form.control,
    name: "accessories",
  });

  // Masters Queries
  const { data: services = [] } = useQuery<ServiceMaster[]>({
    queryKey: [api.masters.services.list.path],
  });
  const { data: ppfMasters = [] } = useQuery<PPFMaster[]>({
    queryKey: [api.masters.ppf.list.path],
  });
  const { data: accessories = [] } = useQuery<AccessoryMaster[]>({
    queryKey: [api.masters.accessories.list.path],
  });
  const { data: technicians = [] } = useQuery<any[]>({
    queryKey: [api.technicians.list.path],
  });

  // Local selection states
  const [selectedService, setSelectedService] = useState("");
  const [selectedServiceVehicleType, setSelectedServiceVehicleType] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [selectedPPF, setSelectedPPF] = useState("");
  const [selectedPPFVehicleType, setSelectedPPFVehicleType] = useState("");
  const [selectedWarranty, setSelectedWarranty] = useState("");
  const [rollQty, setRollQty] = useState(0);
  const [selectedAccessoryCategory, setSelectedAccessoryCategory] = useState("");
  const [selectedAccessory, setSelectedAccessory] = useState("");

  const handleAddService = () => {
    const s = services.find(item => item.id === selectedService);
    const tech = technicians.find(t => t.id === selectedTechnician);
    const vehicleType = form.getValues("vehicleType");
    
    if (!vehicleType) {
      toast({
        title: "Vehicle Type Required",
        description: "Please select a Vehicle Type in the Vehicle Information section first.",
        variant: "destructive",
      });
      return;
    }

    const vehiclePricing = s?.pricingByVehicleType.find(p => p.vehicleType === vehicleType);
    
    if (s) {
      appendService({ 
        serviceId: s.id!, 
        name: `${s.name} (${vehicleType})`,
        price: vehiclePricing?.price || 0,
        technician: tech?.name
      } as any);
      setSelectedService("");
      setSelectedTechnician("");
    }
  };

  const handleAddPPF = () => {
    const p = ppfMasters.find(item => item.id === selectedPPF);
    const tech = technicians.find(t => t.id === selectedTechnician);
    const vehicleType = form.getValues("vehicleType");

    if (!vehicleType) {
      toast({
        title: "Vehicle Type Required",
        description: "Please select a Vehicle Type in the Vehicle Information section first.",
        variant: "destructive",
      });
      return;
    }

    const vehiclePricing = p?.pricingByVehicleType.find(v => v.vehicleType === vehicleType);
    const option = vehiclePricing?.options.find(o => o.warrantyName === selectedWarranty);
    
    if (p && selectedWarranty) {
      appendPPF({ 
        ppfId: p.id!, 
        name: `${p.name} (${vehicleType} - ${selectedWarranty})`,
        rollUsed: rollQty > 0 ? rollQty : undefined,
        price: option?.price || 0,
        technician: tech?.name,
        warranty: selectedWarranty
      } as any);
      setSelectedPPF("");
      setSelectedWarranty("");
      setRollQty(0);
      setSelectedTechnician("");
    }
  };

  const handleAddAccessory = () => {
    const a = accessories.find(item => item.id === selectedAccessory);
    if (a) {
      appendAccessory({ accessoryId: a.id!, name: a.name, price: a.price } as any);
      setSelectedAccessory("");
    }
  };

  const { toast } = useToast();

  const createJobMutation = useMutation({
    mutationFn: async (values: JobCardFormValues) => {
      console.log("Mutation starting - Payload:", values);
      const subtotal = [...values.services, ...values.ppfs, ...values.accessories].reduce((acc, curr) => acc + curr.price, 0) + values.laborCharge;
      const afterDiscount = subtotal - values.discount;
      const tax = afterDiscount * (values.gst / 100);
      const estimatedCost = Math.round(afterDiscount + tax);

      // Extract technician from first service if available
      const technician = values.services[0]?.technician;

      const payload = {
        customerName: values.customerName,
        phoneNumber: values.phoneNumber,
        emailAddress: values.emailAddress,
        referralSource: values.referralSource,
        referrerName: values.referrerName,
        referrerPhone: values.referrerPhone,
        make: values.make,
        model: values.model,
        year: values.year,
        licensePlate: values.licensePlate,
        vehicleType: values.vehicleType,
        services: values.services,
        ppfs: values.ppfs,
        accessories: values.accessories,
        laborCharge: values.laborCharge,
        discount: values.discount,
        gst: values.gst,
        serviceNotes: values.serviceNotes,
        estimatedCost,
        status: jobToEdit?.status || "Pending",
        technician
      };
      
      const method = jobId ? "PATCH" : "POST";
      const url = jobId ? `/api/job-cards/${jobId}` : "/api/job-cards";
      console.log(`Sending ${method} request to ${url}`);
      const res = await apiRequest(method, url, payload);
      const result = await res.json();
      console.log("API Response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Mutation successful", data);
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-cards", jobId] });
      queryClient.invalidateQueries({ queryKey: [api.masters.ppf.list.path] });
      toast({
        title: "Success",
        description: `Job card ${jobId ? "updated" : "created"} successfully`,
      });
      setLocation("/job-cards");
    },
    onError: (error: any) => {
      console.error("Mutation error", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${jobId ? "update" : "create"} job card`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: JobCardFormValues) => {
    console.log("Form submitted - Values:", data);
    
    try {
      console.log("Starting manual validation...");
      const isValid = await form.trigger();
      console.log("Manual validation result:", isValid);
      
      if (!isValid) {
        const errors = form.formState.errors;
        console.warn("Validation failed with errors:", errors);
        
        // Detailed error logging
        Object.entries(errors).forEach(([field, error]: [any, any]) => {
          console.error(`Field "${field}" has error:`, error.message || error.type || error);
          if (error.root) {
             console.error(`Root error for ${field}:`, error.root);
          }
        });
        
        // Find first error and scroll to it
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                               document.querySelector(`[id*="${firstErrorField}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }

        toast({
          title: "Validation Error",
          description: "Please check the required fields highlighted in red.",
          variant: "destructive",
        });
        return;
      }

      console.log("Form is valid, executing mutation...");
      
      const subtotal = [...(data.services || []), ...(data.ppfs || []), ...(data.accessories || [])].reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) + (Number(data.laborCharge) || 0);
      const afterDiscount = subtotal - (Number(data.discount) || 0);
      const tax = afterDiscount * ((Number(data.gst) || 18) / 100);
      const totalCost = Math.round(afterDiscount + tax);

      const formattedData = {
        ...data,
        services: (data.services || []).map(s => ({ ...s, price: Number(s.price) })),
        ppfs: (data.ppfs || []).map(p => ({ ...p, price: Number(p.price) })),
        accessories: (data.accessories || []).map(a => ({ ...a, price: Number(a.price) })),
        laborCharge: Number(data.laborCharge),
        discount: Number(data.discount),
        gst: Number(data.gst),
      };

      console.log("Sending formatted data:", formattedData);
      createJobMutation.mutate(formattedData);
    } catch (err) {
      console.error("Submit handler error:", err);
    }
  };

  const currentPPF = ppfMasters.find(p => p.id === selectedPPF);
  const { data: vehicleTypes = [] } = useQuery<any[]>({
    queryKey: [api.masters.vehicleTypes.list.path],
  });
  const { data: accessoryCategories = [] } = useQuery<any[]>({
    queryKey: [api.masters.accessories.categories.list.path],
  });

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/job-cards")}
            className="mt-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{jobId ? "Edit Job Card" : "Create New Job Card"}</h1>
            <p className="text-sm text-muted-foreground">
              {jobId ? `Updating details for job card ${jobToEdit?.jobNo || ""}` : "Fill in the details below to create a new service job card"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information Section */}
            <Card className="border-slate-200">
              <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg font-bold">Customer Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Customer Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                            className={`h-11 ${form.formState.errors.customerName ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`} 
                          />
                        </FormControl>
                        {form.formState.errors.customerName && (
                          <p className="text-xs font-bold text-red-600 mt-1">
                            {form.formState.errors.customerName.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 555-0123" 
                            {...field} 
                            className={`h-11 ${form.formState.errors.phoneNumber ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`} 
                          />
                        </FormControl>
                        {form.formState.errors.phoneNumber && (
                          <p className="text-xs font-bold text-red-600 mt-1">
                            {form.formState.errors.phoneNumber.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                  <FormField
                    control={form.control}
                    name="emailAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="referralSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">How did you hear about us? *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger className={`h-11 ${form.formState.errors.referralSource ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`}>
                              <SelectValue placeholder="Select referral source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Google Search">Google Search</SelectItem>
                            <SelectItem value="Social Media">Social Media</SelectItem>
                            <SelectItem value="Friend/Family">Friend/Family</SelectItem>
                            <SelectItem value="Advertisement">Advertisement</SelectItem>
                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.referralSource && (
                          <p className="text-xs font-bold text-red-600 mt-1">
                            {form.formState.errors.referralSource.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                    {form.watch("referralSource") === "Friend/Family" && (
                      <div className="contents">
                        <FormField
                          control={form.control}
                          name="referrerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-slate-700">Referrer's Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter name of the person who referred" {...field} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="referrerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-slate-700">Referrer's Phone Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="10-digit mobile number" 
                                  {...field} 
                                  className="h-11" 
                                  maxLength={10}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
              </CardContent>
            </Card>

            {/* Vehicle Information Section */}
            <Card className="border-slate-200">
              <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg font-bold">Vehicle Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Vehicle Type *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger className={`h-11 ${form.formState.errors.vehicleType ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`}>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map((type: any) => (
                              <SelectItem key={type.id} value={type.name}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.vehicleType && (
                          <p className="text-xs font-bold text-red-600 mt-1">
                            {form.formState.errors.vehicleType.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Year *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="2024" 
                            {...field} 
                            className={`h-11 ${form.formState.errors.year ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`} 
                          />
                        </FormControl>
                        {form.formState.errors.year && (
                          <p className="text-xs font-bold text-red-600 mt-1">
                            {form.formState.errors.year.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">License Plate *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ABC-1234" 
                            {...field} 
                            className={`h-11 ${form.formState.errors.licensePlate ? "border-red-500 ring-1 ring-red-500 bg-red-50" : ""}`} 
                          />
                        </FormControl>
                        {form.formState.errors.licensePlate && (
                          <p className="text-xs font-bold text-red-600 mt-1">
                            {form.formState.errors.licensePlate.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Year *</FormLabel>
                        <FormControl>
                          <Input placeholder="2021" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">License Plate *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC 1234" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Vehicle Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select Vehicle Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map((v) => (
                              <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Section */}
            <Card className="border-slate-200">
              <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg font-bold">Services</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Service</label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(s => (
                          <SelectItem key={s.id} value={s.id!}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Technician (Optional)</label>
                    <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Tech" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {technicians.filter(t => t.status === "active").map(t => (
                          <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" onClick={handleAddService} className="w-full h-11 bg-red-100 text-red-600 hover:bg-red-200 border-none font-semibold">
                      Add Service
                    </Button>
                  </div>
                </div>
                {serviceFields.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-50 p-3 text-xs font-bold uppercase text-slate-500 border-b">Selected Services</div>
                    <div className="divide-y">
                      {serviceFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3">
                          <span className="text-sm font-medium">{(field as any).name}</span>
                          <Button variant="ghost" size="icon" type="button" onClick={() => removeService(index)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PPF Section */}
            <Card className="border-slate-200">
              <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg font-bold">PPF (Paint Protection Film)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">PPF</label>
                    <Select value={selectedPPF} onValueChange={setSelectedPPF}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select PPF" />
                      </SelectTrigger>
                      <SelectContent>
                        {ppfMasters.map(p => (
                          <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Warranty</label>
                    <Select value={selectedWarranty} onValueChange={setSelectedWarranty} disabled={!selectedPPF || !form.watch("vehicleType")}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Warranty" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentPPF?.pricingByVehicleType
                          ?.find(v => v.vehicleType === form.watch("vehicleType"))
                          ?.options.map(o => (
                            <SelectItem key={o.warrantyName} value={o.warrantyName}>{o.warrantyName}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Sqft Used</label>
                    <Input 
                      type="number" 
                      value={rollQty || ""} 
                      onChange={(e) => setRollQty(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="h-11"
                      disabled={!selectedPPF}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" onClick={handleAddPPF} className="w-full h-11 bg-red-100 text-red-600 hover:bg-red-200 border-none font-semibold">
                      Add PPF
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Available Stock (sqft)</label>
                    <div className="h-11 flex items-center px-3 border rounded-md bg-slate-50 font-medium text-slate-700">
                      {selectedPPF ? (() => {
                        const totalStock = currentPPF?.rolls?.reduce((acc: number, r: any) => acc + (r.stock || 0), 0) || 0;
                        const usedInCurrentJob = ppfFields.reduce((acc, field: any) => {
                          const nameMatch = field.name.startsWith(currentPPF?.name);
                          return nameMatch ? acc + (field.rollUsed || 0) : acc;
                        }, 0);
                        return `${totalStock - usedInCurrentJob} sqft`;
                      })() : "Select PPF"}
                    </div>
                  </div>
                </div>
                {ppfFields.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-50 p-3 text-xs font-bold uppercase text-slate-500 border-b">Selected PPF</div>
                      {ppfFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{(field as any).name}</span>
                            {(field as any).rollUsed && (
                              <span className="text-xs text-slate-500">
                                Quantity: {(field as any).rollUsed}m
                              </span>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" type="button" onClick={() => removePPF(index)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accessories Section */}
            <Card className="border-slate-200">
              <CardHeader className="border-b bg-slate-50/50 py-4 px-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg font-bold">Accessories</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Accessory Category</label>
                    <Select value={selectedAccessoryCategory} onValueChange={setSelectedAccessoryCategory}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Accessory Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {accessoryCategories.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Accessory Name</label>
                    <Select value={selectedAccessory} onValueChange={setSelectedAccessory} disabled={!selectedAccessoryCategory}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Accessory Name" />
                      </SelectTrigger>
                      <SelectContent>
                        {accessories.filter(a => a.category === selectedAccessoryCategory).map(a => (
                          <SelectItem key={a.id} value={a.id!}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3">
                    <Button type="button" onClick={handleAddAccessory} className="w-full h-11 bg-red-100 text-red-600 hover:bg-red-200 border-none font-semibold">
                      Add Accessory
                    </Button>
                  </div>
                </div>
                {accessoryFields.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-50 p-3 text-xs font-bold uppercase text-slate-500 border-b">Selected Accessories</div>
                    <div className="divide-y">
                      {accessoryFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3">
                          <span className="text-sm font-medium">{(field as any).name}</span>
                          <Button variant="ghost" size="icon" type="button" onClick={() => removeAccessory(index)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charges and Notes Section */}
            <Card className="border-slate-200">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="laborCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Labor Charge (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={field.value === 0 ? "" : field.value} 
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, "");
                              field.onChange(val === "" ? 0 : parseInt(val));
                            }} 
                            placeholder="0"
                            className="h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Discount (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={field.value === 0 ? "" : field.value} 
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, "");
                              field.onChange(val === "" ? 0 : parseInt(val));
                            }} 
                            placeholder="0"
                            className="h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gst"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">GST (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={field.value === 0 ? "" : field.value} 
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, "");
                              field.onChange(val === "" ? 0 : parseInt(val));
                            }} 
                            placeholder="0"
                            className="h-11 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="serviceNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700">Service Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Additional notes for the invoice..." {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Price Summary Section */}
            <Card className="border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b">
                <h3 className="font-bold text-slate-700 uppercase text-sm tracking-wider">Price Summary</h3>
              </div>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b">
                    <tr>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3 text-right">Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...form.watch("services"), ...form.watch("ppfs"), ...form.watch("accessories")].map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700">{(item as any).name}</td>
                        <td className="px-6 py-4 text-right font-semibold">₹{(item as any).price.toLocaleString()}</td>
                      </tr>
                    ))}
                    {form.watch("laborCharge") > 0 && (
                      <tr className="bg-slate-50/30">
                        <td className="px-6 py-4 font-medium text-slate-500 italic">Labor Charges</td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-500">₹{form.watch("laborCharge").toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50/80 font-bold text-slate-900 border-t-2 border-slate-200">
                    <tr>
                      <td className="px-6 py-4 text-right text-slate-500">Subtotal</td>
                      <td className="px-6 py-4 text-right text-lg">
                        ₹{(
                          ([...form.watch("services"), ...form.watch("ppfs"), ...form.watch("accessories")] as any[]).reduce((acc, curr) => acc + curr.price, 0) +
                          form.watch("laborCharge")
                        ).toLocaleString()}
                      </td>
                    </tr>
                    {form.watch("discount") > 0 && (
                      <tr className="text-red-600">
                        <td className="px-6 py-2 text-right">Discount</td>
                        <td className="px-6 py-2 text-right">-₹{form.watch("discount").toLocaleString()}</td>
                      </tr>
                    )}
                    {form.watch("gst") > 0 && (
                      <tr className="text-slate-600">
                        <td className="px-6 py-2 text-right">GST ({form.watch("gst")}%)</td>
                        <td className="px-6 py-2 text-right">
                          ₹{(
                            Math.round((([...form.watch("services"), ...form.watch("ppfs"), ...form.watch("accessories")] as any[]).reduce((acc, curr) => acc + curr.price, 0) +
                            form.watch("laborCharge") - form.watch("discount")) * (form.watch("gst") / 100))
                          ).toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="text-xl bg-red-600 text-white">
                      <td className="px-6 py-4 text-right uppercase tracking-wider">Total Amount</td>
                      <td className="px-6 py-4 text-right">
                        ₹{(
                          (() => {
                            const subtotal = ([...form.watch("services"), ...form.watch("ppfs"), ...form.watch("accessories")] as any[]).reduce((acc, curr) => acc + (curr.price || 0), 0) + (form.watch("laborCharge") || 0);
                            const afterDiscount = subtotal - (form.watch("discount") || 0);
                            const tax = afterDiscount * ((form.watch("gst") || 0) / 100);
                            return Math.round(afterDiscount + tax);
                          })()
                        ).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setLocation("/job-cards")} className="h-12 px-8">
                Cancel
              </Button>
              <Button 
                type="button"
                className="h-12 px-8 bg-red-600 hover:bg-red-700 font-bold" 
                disabled={createJobMutation.isPending}
                onClick={async () => {
                  console.log("Update button clicked manually");
                  const data = form.getValues();
                  await onSubmit(data);
                }}
              >
                {createJobMutation.isPending ? "Saving..." : (jobId ? "Update Job Card" : "Create Job Card")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
