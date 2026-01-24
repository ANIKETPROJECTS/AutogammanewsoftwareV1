import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Inquiry, InsertInquiry, ServiceMaster, AccessoryMaster, VehicleType, AccessoryCategory } from "@shared/schema";
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
  PlusCircle
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
      date: format(new Date(), "yyyy-MM-dd"),
      inquiryId: `INQA${Math.floor(Math.random() * 1000)}`,
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
    createMutation.mutate(data);
  };

  // Helper for unique services in filter
  const allServiceNames = useMemo(() => {
    const names = new Set<string>();
    inquiries.forEach(i => i.services.forEach(s => names.add(s.serviceName)));
    return Array.from(names);
  }, [inquiries]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inquiry</h1>
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Inquiry</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Customer name" {...field} />
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
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Services</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => appendService({ serviceId: "", serviceName: "", vehicleType: "", price: 0 })}
                      className="bg-red-100 text-red-600 hover:bg-red-200 border-none"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Add Service
                    </Button>
                  </div>
                  {serviceFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg relative">
                      <FormField
                        control={form.control}
                        name={`services.${index}.serviceName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Service" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services.map(s => (
                                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`services.${index}.vehicleType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicleTypes.map(v => (
                                  <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`services.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeService(index)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Accessories</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => appendAccessory({ accessoryId: "", accessoryName: "", category: "", price: 0 })}
                      className="bg-red-100 text-red-600 hover:bg-red-200 border-none"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Add Accessory
                    </Button>
                  </div>
                  {accessoryFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg relative">
                      <FormField
                        control={form.control}
                        name={`accessories.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accessoryCategories.map(c => (
                                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`accessories.${index}.accessoryName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accessory</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Accessory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accessories.filter(a => a.category === form.watch(`accessories.${index}.category`)).map(a => (
                                  <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`accessories.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeAccessory(index)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Add any additional notes..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="ourPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Our Price</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="customerPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Price</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white">Save Inquiry</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const diff = inquiry.customerPrice - inquiry.ourPrice;
            const diffPercent = inquiry.ourPrice > 0 ? (diff / inquiry.ourPrice) * 100 : 0;
            return (
              <Card key={inquiry.id} className="overflow-hidden border-slate-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</p>
                        <h3 className="text-lg font-bold text-slate-900">{inquiry.customerName}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                          <p className="text-sm font-medium text-blue-600 flex items-center gap-2">
                            <Phone className="h-3 w-3" /> {inquiry.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                          <p className="text-sm font-medium text-blue-600 flex items-center gap-2">
                            <Mail className="h-3 w-3" /> {inquiry.email || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services Requested</p>
                        <div className="mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                          <p className="text-sm text-slate-700">
                            {inquiry.services.length > 0 
                              ? inquiry.services.map(s => s.serviceName).join(", ")
                              : "General Inquiry"}
                          </p>
                        </div>
                      </div>
                      {inquiry.notes && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Special Notes</p>
                          <p className="text-sm italic text-slate-600">"{inquiry.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-8 flex flex-col justify-between">
                      <div className="grid grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Our Price</p>
                          <p className="text-lg font-bold">₹{inquiry.ourPrice}</p>
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Price</p>
                          <p className="text-lg font-bold">₹{inquiry.customerPrice}</p>
                        </div>
                        <div className="border-l border-slate-200 pl-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difference</p>
                          <p className={`text-lg font-bold ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {diff >= 0 ? "+" : ""}₹{diff}
                          </p>
                          <p className="text-[10px] font-medium text-green-600">+{diffPercent.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 border-dashed">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Inquiry ID: {inquiry.inquiryId}</span>
                          <span>Date: {format(new Date(inquiry.date), "MMMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none h-8 px-4"><Eye className="h-3 w-3 mr-1" /> View</Button>
                          <Button variant="outline" size="sm" className="bg-orange-500 text-white hover:bg-orange-600 hover:text-white border-none h-8 px-4"><Download className="h-3 w-3 mr-1" /> Download</Button>
                          <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700 hover:text-white border-none h-8 px-4"><Send className="h-3 w-3 mr-1" /> Send</Button>
                          <Button variant="outline" size="sm" className="bg-red-600 text-white hover:bg-red-700 hover:text-white border-none h-8 px-4" onClick={() => deleteMutation.mutate(inquiry.id!)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                        </div>
                      </div>
                    </div>
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
