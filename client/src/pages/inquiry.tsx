import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Inquiry, InsertInquiry, ServiceMaster, AccessoryMaster, VehicleType, AccessoryCategory, PPFMaster } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  Eye, 
  Download, 
  Send, 
  X,
  PlusCircle,
  IndianRupee
} from "lucide-react";
import { format } from "date-fns";

export default function InquiryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Queries
  const { data: inquiries = [], isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
  });
  const { data: services = [] } = useQuery<ServiceMaster[]>({
    queryKey: [api.masters.services.list.path],
  });
  const { data: ppfMasters = [] } = useQuery<PPFMaster[]>({
    queryKey: [api.masters.ppf.list.path],
  });
  const { data: accessories = [] } = useQuery<AccessoryMaster[]>({
    queryKey: [api.masters.accessories.list.path],
  });
  const { data: vehicleTypes = [] } = useQuery<VehicleType[]>({
    queryKey: [api.masters.vehicleTypes.list.path],
  });
  const { data: accessoryCategories = [] } = useQuery<AccessoryCategory[]>({
    queryKey: [api.masters.accessories.categories.list.path],
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: InsertInquiry) => {
      const res = await apiRequest("POST", "/api/inquiries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      setIsFormOpen(false);
      form.reset();
      toast({ title: "Inquiry saved successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      toast({ title: "Inquiry deleted" });
    },
  });

  const form = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      services: [],
      accessories: [],
      notes: "",
      ourPrice: 0,
      customerPrice: 0,
    },
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const { fields: accessoryFields, append: appendAccessory, remove: removeAccessory } = useFieldArray({
    control: form.control,
    name: "accessories",
  });

  // Intermediate state for selection
  const [selectedService, setSelectedService] = useState("");
  const [selectedServiceVehicleType, setSelectedServiceVehicleType] = useState("");

  const [selectedPPF, setSelectedPPF] = useState("");
  const [selectedPPFVehicleType, setSelectedPPFVehicleType] = useState("");
  const [selectedWarranty, setSelectedWarranty] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccessory, setSelectedAccessory] = useState("");

  const handleAddService = () => {
    const service = services.find(s => s.name === selectedService);
    if (!service || !selectedServiceVehicleType) return;

    let price = 0;
    const vPricing = service.pricingByVehicleType.find(v => v.vehicleType === selectedServiceVehicleType);
    if (vPricing) {
      price = vPricing.price || 0;
    }

    appendService({
      serviceId: service.id || "",
      serviceName: service.name,
      vehicleType: selectedServiceVehicleType,
      warrantyName: undefined,
      price: price
    });

    const currentOurPrice = form.getValues("ourPrice") || 0;
    form.setValue("ourPrice", currentOurPrice + price);
    setSelectedService("");
    setSelectedServiceVehicleType("");
  };

  const handleAddPPF = () => {
    const ppf = ppfMasters.find(p => p.name === selectedPPF);
    if (!ppf || !selectedPPFVehicleType || !selectedWarranty) return;

    let price = 0;
    const vPricing = ppf.pricingByVehicleType.find(v => v.vehicleType === selectedPPFVehicleType);
    if (vPricing) {
      const opt = vPricing.options.find((o: any) => o.warrantyName === selectedWarranty);
      price = opt?.price || 0;
    }

    appendService({
      serviceId: ppf.id || "",
      serviceName: ppf.name,
      vehicleType: selectedPPFVehicleType,
      warrantyName: selectedWarranty,
      price: price
    });

    const currentOurPrice = form.getValues("ourPrice") || 0;
    form.setValue("ourPrice", currentOurPrice + price);
    setSelectedPPF("");
    setSelectedPPFVehicleType("");
    setSelectedWarranty("");
  };

  const handleAddAccessory = () => {
    const accessory = accessories.find(a => a.name === selectedAccessory);
    if (!accessory) return;

    appendAccessory({
      accessoryId: accessory.id || "",
      accessoryName: accessory.name,
      category: accessory.category,
      price: accessory.price
    });

    const currentOurPrice = form.getValues("ourPrice") || 0;
    form.setValue("ourPrice", currentOurPrice + accessory.price);
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const matchesSearch = i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           i.phone.includes(searchTerm);
      const matchesService = serviceFilter === "ALL" || 
                            i.services.some(s => s.serviceName === serviceFilter);
      return matchesSearch && matchesService;
    });
  }, [inquiries, searchTerm, serviceFilter]);

  const onSubmit = (data: InsertInquiry) => {
    console.log("Submitting inquiry data:", data);
    
    // Ensure all numeric fields are correctly typed
    const payload = {
      ...data,
      ourPrice: Number(data.ourPrice || 0),
      customerPrice: Number(data.customerPrice || 0),
      // Ensure prices within services and accessories arrays are also numbers
      services: data.services.map(s => ({
        ...s,
        price: Number(s.price || 0)
      })),
      accessories: data.accessories.map(a => ({
        ...a,
        price: Number(a.price || 0)
      }))
    };

    console.log("Cleaned payload:", payload);
    createMutation.mutate(payload);
  };

  const handleSaveClick = () => {
    console.log("Save Inquiry button clicked");
    const values = form.getValues();
    console.log("Form values:", values);
    form.handleSubmit(onSubmit)();
  };

  const allServiceNames = useMemo(() => {
    const names = new Set<string>();
    inquiries.forEach(i => i.services.forEach(s => names.add(s.serviceName)));
    return Array.from(names);
  }, [inquiries]);


  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage notes and reminders linked to customers</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Services</SelectItem>
              {allServiceNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold">
              Add Inquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
            <div className="p-6 space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Tickets</DialogTitle>
                <p className="text-sm text-muted-foreground">Manage notes and reminders linked to customers</p>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground font-bold uppercase">Customer Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Customer name" {...field} className="h-10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-muted-foreground font-bold uppercase">Phone Number *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Phone number" 
                                {...field} 
                                className="h-10"
                                maxLength={10}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Email address (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Email address (optional)" {...field} className="h-10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Service Selection Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Service</label>
                      <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map(s => (
                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Vehicle Type</label>
                      <Select value={selectedServiceVehicleType} onValueChange={setSelectedServiceVehicleType}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map(v => (
                            <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-4">
                      <Button 
                        type="button" 
                        onClick={handleAddService}
                        className="w-full h-10 bg-red-200 text-red-600 hover:bg-red-300 border-none"
                      >
                        Add Service
                      </Button>
                    </div>
                  </div>

                  {/* PPF Selection Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">PPF</label>
                      <Select value={selectedPPF} onValueChange={setSelectedPPF}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select PPF" />
                        </SelectTrigger>
                        <SelectContent>
                          {ppfMasters.map(p => (
                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Vehicle Type</label>
                      <Select value={selectedPPFVehicleType} onValueChange={setSelectedPPFVehicleType}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map(v => (
                            <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Warranty</label>
                      <Select 
                        value={selectedWarranty} 
                        onValueChange={setSelectedWarranty}
                        disabled={!selectedPPF || !selectedPPFVehicleType}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Warranty" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedPPF && selectedPPFVehicleType && ppfMasters.find(p => p.name === selectedPPF)?.pricingByVehicleType
                            .find(v => v.vehicleType === selectedPPFVehicleType)?.options.map((o: any) => (
                              <SelectItem key={o.warrantyName} value={o.warrantyName}>{o.warrantyName}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3">
                      <Button 
                        type="button" 
                        onClick={handleAddPPF}
                        className="w-full h-10 bg-red-200 text-red-600 hover:bg-red-300 border-none"
                      >
                        Add PPF
                      </Button>
                    </div>
                  </div>

                  {/* Accessory Selection Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Accessory Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Accessory Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {accessoryCategories.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Accessory Name</label>
                      <Select value={selectedAccessory} onValueChange={setSelectedAccessory}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Accessory Name" />
                        </SelectTrigger>
                        <SelectContent>
                          {accessories.filter(a => a.category === selectedCategory).map(a => (
                            <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-3" />
                    <div className="md:col-span-3">
                      <Button 
                        type="button" 
                        onClick={handleAddAccessory}
                        className="w-full h-10 bg-red-200 text-red-600 hover:bg-red-300 border-none"
                      >
                        Add Accessory
                      </Button>
                    </div>
                  </div>

                  {/* Added Items Table */}
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-xs font-bold uppercase">Service Name</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-center">Warranty & Price</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-right">Service Price</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-center w-[200px]">Customer Price</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceFields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <div className="font-medium text-sm">{field.serviceName}</div>
                              <div className="text-xs text-muted-foreground">{field.vehicleType}</div>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {field.warrantyName || "—"}
                            </TableCell>
                            <TableCell className="text-right font-bold text-sm">
                              ₹{field.price.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="text"
                                placeholder="Enter price" 
                                className="h-10 text-center"
                                value={form.watch(`services.${index}.price`) === 0 ? "" : form.watch(`services.${index}.price`)}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                  form.setValue(`services.${index}.price`, val);
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="icon" onClick={() => removeService(index)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {accessoryFields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <div className="font-medium text-sm">{field.accessoryName}</div>
                              <div className="text-xs text-muted-foreground">{field.category}</div>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">—</TableCell>
                            <TableCell className="text-right font-bold text-sm">
                              ₹{field.price.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="text"
                                placeholder="Enter price" 
                                className="h-10 text-center"
                                value={form.watch(`accessories.${index}.price`) === 0 ? "" : form.watch(`accessories.${index}.price`)}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                  form.setValue(`accessories.${index}.price`, val);
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="icon" onClick={() => removeAccessory(index)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(serviceFields.length === 0 && accessoryFields.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                              No items added yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional notes or special requests..." 
                            {...field} 
                            className="min-h-[100px] resize-none"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      type="button"
                      onClick={handleSaveClick}
                      className="bg-red-500 hover:bg-red-600 text-white px-8"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Saving..." : "Save Inquiry"}
                    </Button>
                    <Button type="button" variant="outline" className="px-8" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Existing List UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInquiries.map((inquiry) => {
            const diff = inquiry.customerPrice - inquiry.ourPrice;
            const diffPercent = inquiry.ourPrice > 0 ? (diff / inquiry.ourPrice) * 100 : 0;
            return (
              <Card key={inquiry.id} className="hover-elevate transition-all duration-200 border-slate-200">
                <CardHeader className="p-4 bg-slate-50/50 border-b">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{inquiry.customerName}</h3>
                      <p className="text-xs text-muted-foreground">{inquiry.inquiryId}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase py-0 px-2 h-5 bg-white">
                      {format(new Date(inquiry.date), "MMM dd")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-blue-500" /> {inquiry.phone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Services</p>
                      <p className="text-sm font-medium truncate">
                        {inquiry.services.length + inquiry.accessories.length} items
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Final Price</p>
                      <p className="text-lg font-bold">₹{inquiry.customerPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Profit</p>
                      <p className={`text-sm font-bold ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ₹{diff.toLocaleString()} ({diffPercent.toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px] font-bold uppercase bg-blue-50 text-blue-600 hover:bg-blue-100 border-none"><Eye className="h-3 w-3 mr-1" /> View</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-[11px] font-bold uppercase bg-red-50 text-red-600 hover:bg-red-100 border-none" onClick={() => deleteMutation.mutate(inquiry.id!)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
