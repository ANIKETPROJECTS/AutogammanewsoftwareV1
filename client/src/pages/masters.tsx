import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Wrench, Shield, Package, Car, X, Edit2, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { ServiceMaster, VehicleType, PPFMaster, AccessoryMaster, AccessoryCategory } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { Link, useLocation } from "wouter";

export default function MastersPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const defaultTab = searchParams.get("tab") || "service";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  const { toast } = useToast();
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceMaster | null>(null);
  const [isAddPPFOpen, setIsAddPPFOpen] = useState(false);
  const [editingPPF, setEditingPPF] = useState<PPFMaster | null>(null);
  const [isAddAccessoryOpen, setIsAddAccessoryOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<AccessoryMaster | null>(null);
  const [isManageVehicleTypesOpen, setIsManageVehicleTypesOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [newVehicleTypeName, setNewVehicleTypeName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: services = [] } = useQuery<ServiceMaster[]>({
    queryKey: [api.masters.services.list.path],
  });

  const { data: ppfs = [] } = useQuery<PPFMaster[]>({
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

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/masters/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.services.list.path] });
      toast({ title: "Success", description: "Service deleted successfully" });
    },
  });

  const deletePPFMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/masters/ppf/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.ppf.list.path] });
      toast({ title: "Success", description: "PPF deleted successfully" });
    },
  });

  const deleteAccessoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/masters/accessories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.accessories.list.path] });
      toast({ title: "Success", description: "Accessory deleted successfully" });
    },
  });

  const createVehicleTypeMutation = useMutation({
    mutationFn: (name: string) => apiRequest("POST", api.masters.vehicleTypes.create.path, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.vehicleTypes.list.path] });
      setNewVehicleTypeName("");
      toast({ title: "Success", description: "Vehicle type added successfully" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => apiRequest("POST", api.masters.accessories.categories.create.path, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.accessories.categories.list.path] });
      setNewCategoryName("");
      toast({ title: "Success", description: "Category added successfully" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/masters/accessory-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.accessories.categories.list.path] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              Masters
            </h1>
            <p className="text-muted-foreground">
              Manage your service, PPF, and accessories master data.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Service Master
            </TabsTrigger>
            <TabsTrigger value="ppf" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              PPF Master
            </TabsTrigger>
            <TabsTrigger value="accessories" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Accessories Master
            </TabsTrigger>
          </TabsList>

          <TabsContent value="service" className="space-y-6">
            <div className="flex justify-end gap-3">
              <Dialog open={isManageVehicleTypesOpen} onOpenChange={setIsManageVehicleTypesOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Manage Vehicle Types
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Vehicle Types</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Vehicle Type Name (e.g. SUV, Sedan)" 
                        value={newVehicleTypeName}
                        onChange={(e) => setNewVehicleTypeName(e.target.value)}
                      />
                      <Button onClick={() => createVehicleTypeMutation.mutate(newVehicleTypeName)}>Add</Button>
                    </div>
                    <div className="space-y-2">
                      {vehicleTypes.map((type) => (
                        <div key={type.id} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{type.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                  </DialogHeader>
                  <AddServiceForm onClose={() => setIsAddServiceOpen(false)} vehicleTypes={vehicleTypes} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingService(service)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (confirm("Are you sure you want to delete this service?")) {
                          deleteServiceMutation.mutate(service.id!);
                        }
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {service.pricingByVehicleType.map((p) => (
                        <div key={p.vehicleType} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <span className="text-xs font-bold text-primary uppercase">{p.vehicleType}</span>
                          <span className="font-medium">₹{p.price}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Service</DialogTitle>
                </DialogHeader>
                {editingService && (
                  <AddServiceForm 
                    onClose={() => setEditingService(null)} 
                    vehicleTypes={vehicleTypes} 
                    initialData={editingService} 
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="ppf" className="space-y-6">
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsManageVehicleTypesOpen(true)}>
                <Car className="h-4 w-4" />
                Manage Vehicle Types
              </Button>
              <Dialog open={isAddPPFOpen} onOpenChange={setIsAddPPFOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add PPF
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New PPF</DialogTitle>
                  </DialogHeader>
                  <AddPPFForm onClose={() => setIsAddPPFOpen(false)} vehicleTypes={vehicleTypes} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ppfs.map((ppf) => (
                <Card key={ppf.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">{ppf.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingPPF(ppf)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (confirm("Are you sure you want to delete this PPF?")) {
                          deletePPFMutation.mutate(ppf.id!);
                        }
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      {ppf.pricingByVehicleType.map((v) => (
                        <div key={v.vehicleType} className="border-b pb-2 last:border-0 last:pb-0">
                          <div className="text-xs font-bold text-primary uppercase mb-1">{v.vehicleType}</div>
                          {v.options.map((opt, i) => (
                            <div key={i} className="flex justify-between items-center text-xs ml-2">
                              <span className="text-muted-foreground">{opt.warrantyName}</span>
                              <span className="font-medium">₹{opt.price}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      
                      {ppf.rolls && ppf.rolls.length > 0 && (
                        <div className="pt-2 border-t mt-2">
                          <div className="text-xs font-bold uppercase mb-2">Roll Inventory ({ppf.rolls.length})</div>
                          <div className="space-y-1">
                            {ppf.rolls.map((roll, i) => (
                              <div key={i} className="flex justify-between items-center text-[10px] bg-muted/50 p-1 px-2 rounded">
                                <span className="font-bold">{roll.name || `Roll #${i+1}`}</span>
                                <span>{roll.stock} sqft</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={!!editingPPF} onOpenChange={(open) => !open && setEditingPPF(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit PPF</DialogTitle>
                </DialogHeader>
                {editingPPF && (
                  <AddPPFForm 
                    onClose={() => setEditingPPF(null)} 
                    vehicleTypes={vehicleTypes} 
                    initialData={editingPPF} 
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="accessories" className="space-y-6">
            <div className="flex justify-end gap-3">
              <Link href="/masters/accessory-category/manage">
                <Button variant="outline" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Manage Categories
                </Button>
              </Link>

              <Dialog open={isAddAccessoryOpen} onOpenChange={setIsAddAccessoryOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Accessory
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Accessory</DialogTitle>
                  </DialogHeader>
                  <AddAccessoryForm 
                    onClose={() => setIsAddAccessoryOpen(false)} 
                    categories={accessoryCategories}
                    onAddCategory={(name) => createCategoryMutation.mutate(name)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accessories.map((accessory) => (
                <Card key={accessory.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <div className="text-[10px] uppercase text-muted-foreground mb-1">{accessory.category}</div>
                      <CardTitle className="text-lg">{accessory.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingAccessory(accessory)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (confirm("Are you sure you want to delete this accessory?")) {
                          deleteAccessoryMutation.mutate(accessory.id!);
                        }
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground">Quantity</span>
                        <span className="font-bold text-xl">{accessory.quantity}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase text-muted-foreground">Price</span>
                        <span className="font-bold text-xl text-primary">₹{accessory.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={!!editingAccessory} onOpenChange={(open) => !open && setEditingAccessory(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Accessory</DialogTitle>
                </DialogHeader>
                {editingAccessory && (
                  <AddAccessoryForm 
                    onClose={() => setEditingAccessory(null)} 
                    initialData={editingAccessory} 
                    categories={accessoryCategories}
                    onAddCategory={(name) => createCategoryMutation.mutate(name)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function AddServiceForm({ onClose, vehicleTypes, initialData }: { onClose: () => void, vehicleTypes: VehicleType[], initialData?: ServiceMaster }) {
  const { toast } = useToast();
  const [name, setName] = useState(initialData?.name || "");
  const [pricing, setPricing] = useState<any[]>(initialData?.pricingByVehicleType || []);

  const serviceMutation = useMutation({
    mutationFn: (data: any) => {
      if (initialData?.id) {
        return apiRequest("PATCH", `/api/masters/services/${initialData.id}`, data);
      }
      return apiRequest("POST", api.masters.services.create.path, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.services.list.path] });
      toast({ title: "Success", description: initialData ? "Service updated successfully" : "Service added successfully" });
      onClose();
    },
  });

  const addVehiclePricing = (typeName: string) => {
    if (pricing.some(p => p.vehicleType === typeName)) return;
    setPricing([...pricing, { vehicleType: typeName, price: 0 }]);
  };

  const updatePrice = (typeIndex: number, value: string) => {
    const newPricing = [...pricing];
    newPricing[typeIndex].price = value;
    setPricing(newPricing);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label>Service Name</Label>
        <Input placeholder="e.g. Garware Glaze" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Pricing by Vehicle Type</Label>
          <div className="w-64">
            <Select onValueChange={(value) => addVehiclePricing(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Add Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(vt => (
                  <SelectItem key={vt.id} value={vt.name} disabled={pricing.some(p => p.vehicleType === vt.name)}>
                    {vt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {pricing.map((p, typeIndex) => (
          <Card key={p.vehicleType} className="border-dashed overflow-visible">
            <CardHeader className="py-3 bg-muted/50 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold uppercase">{p.vehicleType}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {
                const n = [...pricing];
                n.splice(typeIndex, 1);
                setPricing(n);
              }}><X className="h-4 w-4 text-destructive" /></Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground">Single Price</Label>
                <Input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0" 
                  value={p.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^[0-9]+$/.test(value)) {
                      updatePrice(typeIndex, value);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => serviceMutation.mutate({ name, pricingByVehicleType: pricing })}>
          {initialData ? "Update Service" : "Save Service"}
        </Button>
      </div>
    </div>
  );
}

function AddPPFForm({ onClose, vehicleTypes, initialData }: { onClose: () => void, vehicleTypes: VehicleType[], initialData?: PPFMaster }) {
  const { toast } = useToast();
  const [name, setName] = useState(initialData?.name || "");
  const [pricing, setPricing] = useState<any[]>(initialData?.pricingByVehicleType || []);
  const [rolls, setRolls] = useState<any[]>(initialData?.rolls || []);

  const ppfMutation = useMutation({
    mutationFn: (data: any) => {
      if (initialData?.id) {
        return apiRequest("PATCH", `/api/masters/ppf/${initialData.id}`, data);
      }
      return apiRequest("POST", api.masters.ppf.create.path, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.ppf.list.path] });
      toast({ title: "Success", description: initialData ? "PPF updated successfully" : "PPF added successfully" });
      onClose();
    },
  });

  const addRoll = () => {
    setRolls([...rolls, { name: "", stock: 0 }]);
  };

  const updateRoll = (index: number, field: string, value: any) => {
    const newRolls = [...rolls];
    newRolls[index] = { ...newRolls[index], [field]: value };
    setRolls(newRolls);
  };

  const removeRoll = (index: number) => {
    const newRolls = [...rolls];
    newRolls.splice(index, 1);
    setRolls(newRolls);
  };

  const addVehiclePricing = (typeName: string) => {
    if (pricing.some(p => p.vehicleType === typeName)) return;
    setPricing([...pricing, { 
      vehicleType: typeName, 
      options: [{ warrantyName: "", price: 0 }] 
    }]);
  };

  const addOption = (typeIndex: number) => {
    const newPricing = [...pricing];
    newPricing[typeIndex].options.push({ warrantyName: "", price: 0 });
    setPricing(newPricing);
  };

  const updateOption = (typeIndex: number, optIndex: number, field: string, value: any) => {
    const newPricing = [...pricing];
    newPricing[typeIndex].options[optIndex][field] = value;
    setPricing(newPricing);
  };

  const removeOption = (typeIndex: number, optIndex: number) => {
    const newPricing = [...pricing];
    newPricing[typeIndex].options.splice(optIndex, 1);
    setPricing(newPricing);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label>PPF Name</Label>
        <Input placeholder="e.g. Garware Premium" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Pricing by Vehicle Type</Label>
          <div className="w-64">
            <Select onValueChange={(value) => addVehiclePricing(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Add Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(vt => (
                  <SelectItem key={vt.id} value={vt.name} disabled={pricing.some(p => p.vehicleType === vt.name)}>
                    {vt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {pricing.map((p, typeIndex) => (
          <Card key={p.vehicleType} className="border-dashed overflow-visible">
            <CardHeader className="py-3 bg-muted/50 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-bold uppercase">{p.vehicleType}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{p.options.length} options</span>
                <Button variant="ghost" size="sm" onClick={() => {
                  const n = [...pricing];
                  n.splice(typeIndex, 1);
                  setPricing(n);
                }}><X className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-[1fr,120px,40px] gap-4 mb-2 items-end">
                <Label className="text-[10px] uppercase text-muted-foreground">Warranty Name</Label>
                <Label className="text-[10px] uppercase text-muted-foreground text-right">Price</Label>
                <span></span>
              </div>
              
              {p.options.map((opt: any, optIndex: number) => (
                <div key={optIndex} className="grid grid-cols-[1fr,120px,40px] gap-4 items-center">
                  <Input 
                    placeholder="e.g. TPU 5 Years Gloss" 
                    value={opt.warrantyName} 
                    onChange={(e) => updateOption(typeIndex, optIndex, "warrantyName", e.target.value)}
                  />
                  <Input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0" 
                    value={opt.price}
                    className="text-right"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^[0-9]+$/.test(value)) {
                        updateOption(typeIndex, optIndex, "price", value);
                      }
                    }}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeOption(typeIndex, optIndex)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-dashed"
                onClick={() => addOption(typeIndex)}
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Warranty Option
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-bold">Roll Inventory</Label>
          <Button variant="outline" size="sm" onClick={addRoll} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Roll
          </Button>
        </div>

        {rolls.map((roll, index) => (
          <Card key={index} className="border-dashed">
            <CardHeader className="py-2 bg-muted/30 flex flex-row items-center justify-between space-y-0">
              <span className="text-xs font-bold uppercase">{roll.name || `Roll #${index + 1}`}</span>
              <Button variant="ghost" size="sm" onClick={() => removeRoll(index)}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="pt-3 pb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Roll Name</Label>
                  <Input 
                    placeholder="e.g. Front Roll" 
                    value={roll.name} 
                    onChange={(e) => updateRoll(index, "name", e.target.value)} 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Stock (sqft)</Label>
                  <Input 
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0" 
                    value={roll.stock} 
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^[0-9]+$/.test(value)) {
                        updateRoll(index, "stock", value);
                      }
                    }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => ppfMutation.mutate({ name, pricingByVehicleType: pricing, rolls })}>
          {initialData ? "Update PPF" : "Save PPF"}
        </Button>
      </div>
    </div>
  );
}

function AddAccessoryForm({ 
  onClose, 
  initialData, 
  categories, 
  onAddCategory 
}: { 
  onClose: () => void, 
  initialData?: AccessoryMaster,
  categories: AccessoryCategory[],
  onAddCategory: (name: string) => void
}) {
  const { toast } = useToast();
  const [category, setCategory] = useState(initialData?.category || "");
  const [name, setName] = useState(initialData?.name || "");
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || "0");
  const [price, setPrice] = useState(initialData?.price?.toString() || "0");

  const { data: accessories = [] } = useQuery<AccessoryMaster[]>({
    queryKey: [api.masters.accessories.list.path],
  });

  const accessoryMutation = useMutation({
    mutationFn: (data: any) => {
      if (initialData?.id) {
        return apiRequest("PATCH", `/api/masters/accessories/${initialData.id}`, data);
      }
      return apiRequest("POST", api.masters.accessories.create.path, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.accessories.list.path] });
      toast({ title: "Success", description: initialData ? "Accessory updated successfully" : "Accessory added successfully" });
      onClose();
    },
  });

  // Get unique accessory names for the current category
  const existingNames = Array.from(new Set(
    accessories
      .filter(a => a.category === category)
      .map(a => a.name)
  )).map(n => ({ label: n, value: n }));

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Category / Type</Label>
        <SearchableSelect
          options={categories.map(c => ({ label: c.name, value: c.name }))}
          value={category}
          onValueChange={setCategory}
          placeholder="Select category"
          searchPlaceholder="Search select category..."
          addNewLabel="Add New Category"
          onAddNew={() => {
            const name = prompt("Enter new category name:");
            if (name) onAddCategory(name);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Accessory Name</Label>
        <SearchableSelect
          options={existingNames}
          value={name}
          onValueChange={setName}
          placeholder="Select or enter name"
          searchPlaceholder="Search accessory name..."
          addNewLabel="Add New Accessory Name"
          onAddNew={() => {
            const newName = prompt("Enter new accessory name:");
            if (newName) setName(newName);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input 
            type="number" 
            placeholder="0" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input 
            type="number" 
            placeholder="0" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => accessoryMutation.mutate({ 
          category, 
          name, 
          quantity: parseInt(quantity) || 0, 
          price: parseInt(price) || 0 
        })}>
          {initialData ? "Update Accessory" : "Save Accessory"}
        </Button>
      </div>
    </div>
  );
}
