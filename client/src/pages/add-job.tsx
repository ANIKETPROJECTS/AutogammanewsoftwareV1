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
import { ChevronLeft, User, Car, Settings, Shield, Package, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ServiceMaster, PPFMaster, AccessoryMaster } from "@shared/schema";
import { api } from "@shared/routes";
import { useState } from "react";

const jobCardSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  emailAddress: z.string().email().optional().or(z.literal("")),
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  year: z.string().min(4, "Year must be 4 digits"),
  licensePlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional().or(z.literal("")),
  services: z.array(z.object({
    serviceId: z.string(),
    name: z.string(),
  })),
  ppfs: z.array(z.object({
    ppfId: z.string(),
    name: z.string(),
    rollId: z.string().optional(),
    rollUsed: z.number().optional(),
  })),
  accessories: z.array(z.object({
    accessoryId: z.string(),
    name: z.string(),
  })),
});

type JobCardFormValues = z.infer<typeof jobCardSchema>;

export default function AddJobPage() {
  const [, setLocation] = useLocation();
  const form = useForm<JobCardFormValues>({
    resolver: zodResolver(jobCardSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      emailAddress: "",
      make: "",
      model: "",
      year: "",
      licensePlate: "",
      vin: "",
      services: [],
      ppfs: [],
      accessories: [],
    },
  });

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

  // Local selection states
  const [selectedService, setSelectedService] = useState("");
  const [selectedPPF, setSelectedPPF] = useState("");
  const [selectedRoll, setSelectedRoll] = useState("");
  const [rollQty, setRollQty] = useState(0);
  const [selectedAccessory, setSelectedAccessory] = useState("");

  const handleAddService = () => {
    const s = services.find(item => item.id === selectedService);
    if (s) {
      appendService({ serviceId: s.id!, name: s.name });
      setSelectedService("");
    }
  };

  const handleAddPPF = () => {
    const p = ppfMasters.find(item => item.id === selectedPPF);
    if (p) {
      appendPPF({ 
        ppfId: p.id!, 
        name: p.name,
        rollId: selectedRoll || undefined,
        rollUsed: rollQty > 0 ? rollQty : undefined
      });
      setSelectedPPF("");
      setSelectedRoll("");
      setRollQty(0);
    }
  };

  const handleAddAccessory = () => {
    const a = accessories.find(item => item.id === selectedAccessory);
    if (a) {
      appendAccessory({ accessoryId: a.id!, name: a.name });
      setSelectedAccessory("");
    }
  };

  const onSubmit = (data: JobCardFormValues) => {
    console.log("Job card data:", data);
  };

  const currentPPF = ppfMasters.find(p => p.id === selectedPPF);

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
            <h1 className="text-2xl font-bold text-foreground">Create New Job Card</h1>
            <p className="text-sm text-muted-foreground">
              Fill in the details below to create a new service job card
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
                          <Input placeholder="John Doe" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="+1 555-0123" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
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
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Make *</FormLabel>
                        <FormControl>
                          <Input placeholder="Toyota" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Model *</FormLabel>
                        <FormControl>
                          <Input placeholder="Camry" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
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
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700">VIN (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="1HGBH41JXMN109186" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <div className="flex gap-4">
                  <div className="flex-1">
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
                  <Button type="button" onClick={handleAddService} className="h-11 bg-red-600 hover:bg-red-700">
                    Add Service
                  </Button>
                </div>
                {serviceFields.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-50 p-3 text-xs font-bold uppercase text-slate-500 border-b">Selected Services</div>
                    <div className="divide-y">
                      {serviceFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3">
                          <span className="text-sm font-medium">{field.name}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeService(index)} className="h-8 w-8 text-slate-400 hover:text-red-600">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Select value={selectedRoll} onValueChange={setSelectedRoll} disabled={!selectedPPF}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select Roll (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentPPF?.rolls?.map((r: any) => (
                        <SelectItem key={r.id || r.name} value={r.id || r.name}>
                          {r.name} ({r.stock}sqft available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Qty (m)" 
                      value={rollQty || ""} 
                      onChange={e => setRollQty(parseFloat(e.target.value))}
                      className="h-11"
                      disabled={!selectedRoll}
                    />
                    <Button type="button" onClick={handleAddPPF} className="h-11 bg-red-600 hover:bg-red-700">
                      Add PPF
                    </Button>
                  </div>
                </div>
                {ppfFields.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-50 p-3 text-xs font-bold uppercase text-slate-500 border-b">Selected PPF</div>
                    <div className="divide-y">
                      {ppfFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{field.name}</span>
                            {field.rollId && (
                              <span className="text-xs text-slate-500">
                                Roll: {field.rollId} ({field.rollUsed}m)
                              </span>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removePPF(index)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
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
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Select value={selectedAccessory} onValueChange={setSelectedAccessory}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Accessory" />
                      </SelectTrigger>
                      <SelectContent>
                        {accessories.map(a => (
                          <SelectItem key={a.id} value={a.id!}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" onClick={handleAddAccessory} className="h-11 bg-red-600 hover:bg-red-700">
                    Add Accessory
                  </Button>
                </div>
                {accessoryFields.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-50 p-3 text-xs font-bold uppercase text-slate-500 border-b">Selected Accessories</div>
                    <div className="divide-y">
                      {accessoryFields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between p-3">
                          <span className="text-sm font-medium">{field.name}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeAccessory(index)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setLocation("/job-cards")} className="h-12 px-8">
                Cancel
              </Button>
              <Button type="submit" className="h-12 px-8 bg-red-600 hover:bg-red-700 font-bold">
                Create Job Card
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
