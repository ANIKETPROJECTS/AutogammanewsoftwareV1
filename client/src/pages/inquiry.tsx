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

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function InquiryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);

  const handleDownloadPDF = (inquiry: Inquiry) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text("AUTO GAMMA", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Car Care Studio", 14, 28);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("QUOTATION", pageWidth - 14, 22, { align: "right" });
    
    doc.setFontSize(10);
    doc.text(`ID: ${inquiry.inquiryId || "N/A"}`, pageWidth - 14, 28, { align: "right" });
    doc.text(`Date: ${format(new Date(inquiry.createdAt || new Date()), "MMM dd, yyyy")}`, pageWidth - 14, 34, { align: "right" });

    // Customer Info
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(14, 40, pageWidth - 14, 40);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.text(inquiry.customerName || "N/A", 14, 56);
    doc.text(inquiry.phone || "N/A", 14, 61);
    if (inquiry.email) doc.text(inquiry.email, 14, 66);

    // Items Table
    const tableData = [
      ...(inquiry.services || []).map(s => [
        s.serviceName + (s.vehicleType ? ` (${s.vehicleType})` : ""),
        s.warrantyName || "-",
        `INR ${(s.price || 0).toLocaleString()}`,
        `INR ${(s.customerPrice ?? s.price ?? 0).toLocaleString()}`
      ]),
      ...(inquiry.accessories || []).map(a => [
        a.accessoryName + ` (${a.category})`,
        "-",
        `INR ${(a.price || 0).toLocaleString()}`,
        `INR ${(a.customerPrice ?? a.price ?? 0).toLocaleString()}`
      ])
    ];

    autoTable(doc, {
      startY: 75,
      head: [["Service/Item", "Warranty", "Base Price", "Quoted Price"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 75;

    // Totals
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const totalLabel = "Total Quoted Price:";
    const totalValue = `INR ${(inquiry.customerPrice || 0).toLocaleString()}`;
    
    // Position total label more to the left and value more to the right to avoid overlap
    doc.text(totalLabel, pageWidth - 100, finalY + 15);
    doc.text(totalValue, pageWidth - 14, finalY + 15, { align: "right" });

    // Notes
    if (inquiry.notes) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Special Notes:", 14, finalY + 30);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(inquiry.notes, pageWidth - 28);
      doc.text(splitNotes, 14, finalY + 36);
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for choosing Auto Gamma!", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });

    doc.save(`Quotation_${inquiry.inquiryId || "unknown"}.pdf`);
  };

  const handleSendWhatsApp = (inquiry: Inquiry) => {
    const servicesList = [
      ...(inquiry.services || []).map(s => `- ${s.serviceName}${s.warrantyName ? ` (${s.warrantyName})` : ""}`),
      ...(inquiry.accessories || []).map(a => `- ${a.accessoryName}`)
    ].join("\n");

    const message = `Hi ${inquiry.customerName},

Thank you for your interest in Auto Gamma Car Care Studio!

*QUOTATION DETAILS:*
ID: ${inquiry.inquiryId || "N/A"}
Date: ${format(new Date(inquiry.createdAt || new Date()), "MMM dd, yyyy")}

*SERVICES REQUESTED:*
${servicesList || "General Inquiry"}

*PRICING:*
Our Quote: ₹${(inquiry.ourPrice || 0).toLocaleString()}
Your Quote: ₹${(inquiry.customerPrice || 0).toLocaleString()}

*SPECIAL NOTES:*
${inquiry.notes || "No special notes"}

Please let me know if you have any questions!

Best regards,
Auto Gamma Car Care Studio`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${inquiry.phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

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
      price: price,
      customerPrice: price
    });

    const currentOurPrice = form.getValues("ourPrice") || 0;
    form.setValue("ourPrice", currentOurPrice + price);
    const currentCustomerPrice = form.getValues("customerPrice") || 0;
    form.setValue("customerPrice", currentCustomerPrice + price);
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
      price: price,
      customerPrice: price
    });

    const currentOurPrice = form.getValues("ourPrice") || 0;
    form.setValue("ourPrice", currentOurPrice + price);
    const currentCustomerPrice = form.getValues("customerPrice") || 0;
    form.setValue("customerPrice", currentCustomerPrice + price);
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
      price: accessory.price,
      customerPrice: accessory.price
    });

    const currentOurPrice = form.getValues("ourPrice") || 0;
    form.setValue("ourPrice", currentOurPrice + accessory.price);
    const currentCustomerPrice = form.getValues("customerPrice") || 0;
    form.setValue("customerPrice", currentCustomerPrice + accessory.price);
  };

  const onSubmit = (data: InsertInquiry) => {
    createMutation.mutate(data);
  };

  const handleSaveClick = () => {
    form.handleSubmit(onSubmit)();
  };

  const allServiceNames = useMemo(() => {
    const names = new Set<string>();
    inquiries?.forEach(i => {
      i.services?.forEach(s => names.add(s.serviceName));
    });
    return Array.from(names);
  }, [inquiries]);


  const filteredInquiries = useMemo(() => {
    return (inquiries || []).filter((i) => {
      const matchesSearch = i.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           i.phone?.includes(searchTerm);
      const matchesService = serviceFilter === "ALL" || 
                            i.services?.some(s => s.serviceName === serviceFilter);
      return matchesSearch && matchesService;
    });
  }, [inquiries, searchTerm, serviceFilter]);


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
                                value={form.watch(`services.${index}.customerPrice`) === 0 ? "" : form.watch(`services.${index}.customerPrice`)}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                  form.setValue(`services.${index}.customerPrice`, val);
                                  
                                  // Recalculate total customer price
                                  const services = form.getValues("services");
                                  const accessories = form.getValues("accessories");
                                  const totalCustomerPrice = 
                                    services.reduce((acc, s) => acc + (s.customerPrice || 0), 0) +
                                    accessories.reduce((acc, a) => acc + (a.customerPrice || 0), 0);
                                  form.setValue("customerPrice", totalCustomerPrice);
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
                                value={form.watch(`accessories.${index}.customerPrice`) === 0 ? "" : form.watch(`accessories.${index}.customerPrice`)}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                  form.setValue(`accessories.${index}.customerPrice`, val);

                                  // Recalculate total customer price
                                  const services = form.getValues("services");
                                  const accessories = form.getValues("accessories");
                                  const totalCustomerPrice = 
                                    services.reduce((acc, s) => acc + (s.customerPrice || 0), 0) +
                                    accessories.reduce((acc, a) => acc + (a.customerPrice || 0), 0);
                                  form.setValue("customerPrice", totalCustomerPrice);
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
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const diff = inquiry.customerPrice - inquiry.ourPrice;
            const diffPercent = inquiry.ourPrice > 0 ? (diff / inquiry.ourPrice) * 100 : 0;
            return (
              <Card key={inquiry.id} className="hover-elevate transition-all duration-200 border-slate-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column: Customer Details */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</p>
                        <h3 className="text-lg font-bold text-slate-900">{inquiry.customerName}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                          <p className="text-sm font-medium flex items-center gap-2 text-blue-600">
                            <Phone className="h-4 w-4" /> {inquiry.phone}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Email Address</p>
                          <p className="text-sm font-medium flex items-center gap-2 text-blue-600">
                            <Mail className="h-4 w-4" /> {inquiry.email || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Services Requested</p>
                        <div className="bg-slate-50 p-2 rounded-md border border-slate-100 min-h-[40px] flex flex-wrap gap-2">
                          {inquiry.services.map((s, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-white text-slate-700 border-slate-200">
                              {s.serviceName} ({s.vehicleType})
                            </Badge>
                          ))}
                          {inquiry.accessories.map((a, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-white text-slate-700 border-slate-200">
                              {a.accessoryName}
                            </Badge>
                          ))}
                          {inquiry.services.length === 0 && inquiry.accessories.length === 0 && (
                            <span className="text-sm text-muted-foreground italic">No items requested</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Special Notes</p>
                        <div className="bg-orange-50/50 p-2 rounded-md border border-orange-100 text-sm italic text-slate-600 min-h-[40px]">
                          "{inquiry.notes || "None"}"
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Pricing and Actions */}
                    <div className="lg:w-1/3 space-y-6 flex flex-col">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex-1 grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Our Price</p>
                          <p className="text-base font-bold">₹{inquiry.ourPrice.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Price</p>
                          <p className="text-base font-bold">₹{inquiry.customerPrice.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Difference</p>
                          <p className={`text-sm font-bold ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {diff >= 0 ? "+" : ""}₹{diff.toLocaleString()}
                          </p>
                          <p className={`text-[10px] ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {diff >= 0 ? "+" : ""}{diffPercent.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                          <span>Inquiry ID: {inquiry.inquiryId}</span>
                          <span>Date: {format(new Date(inquiry.createdAt || new Date()), "MMMM dd, yyyy")}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none h-9 text-xs font-bold uppercase"
                            onClick={() => setViewingInquiry(inquiry)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-none h-9 text-xs font-bold uppercase"
                            onClick={() => handleDownloadPDF(inquiry)}
                          >
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-none h-9 text-xs font-bold uppercase"
                            onClick={() => handleSendWhatsApp(inquiry)}
                          >
                            Send
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none h-9 text-xs font-bold uppercase"
                            onClick={() => deleteMutation.mutate(inquiry.id!)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View Inquiry Dialog */}
        <Dialog open={!!viewingInquiry} onOpenChange={(open) => !open && setViewingInquiry(null)}>
          <DialogContent className="max-w-3xl p-0">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Inquiry Details</DialogTitle>
                </DialogHeader>
              </div>

              {viewingInquiry && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Name</p>
                      <p className="text-sm font-bold">{viewingInquiry.customerName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                      <p className="text-sm font-bold">{viewingInquiry.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                      <p className="text-sm font-bold">{viewingInquiry.email || "N/A"}</p>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-[10px] font-bold uppercase">Service Name</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-right">Service Price</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase text-right">Customer Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingInquiry.services.map((s, idx) => (
                          <TableRow key={`s-${idx}`}>
                            <TableCell className="text-sm">
                              {s.serviceName}
                              <div className="text-[10px] text-muted-foreground">{s.vehicleType}</div>
                            </TableCell>
                            <TableCell className="text-right text-sm">₹{s.price.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-sm font-bold">₹{(s.customerPrice ?? s.price).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        {viewingInquiry.accessories.map((a, idx) => (
                          <TableRow key={`a-${idx}`}>
                            <TableCell className="text-sm">{a.accessoryName}</TableCell>
                            <TableCell className="text-right text-sm">₹{a.price.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-sm font-bold">₹{(a.customerPrice ?? a.price).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Our Price</p>
                      <p className="text-lg font-bold">₹{viewingInquiry.ourPrice.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Price</p>
                      <p className="text-lg font-bold">₹{viewingInquiry.customerPrice.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Difference</p>
                      <p className={`text-lg font-bold ${viewingInquiry.customerPrice - viewingInquiry.ourPrice >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {viewingInquiry.customerPrice - viewingInquiry.ourPrice >= 0 ? "+" : ""}
                        ₹{(viewingInquiry.customerPrice - viewingInquiry.ourPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Notes</p>
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-sm">
                      {viewingInquiry.notes || "No notes"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
