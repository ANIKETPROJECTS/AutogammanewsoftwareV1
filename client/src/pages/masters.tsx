import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Wrench, Shield, Package, Car, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, ServiceMaster, VehicleType } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function MastersPage() {
  const { toast } = useToast();
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isManageVehicleTypesOpen, setIsManageVehicleTypesOpen] = useState(false);
  const [newVehicleTypeName, setNewVehicleTypeName] = useState("");

  const { data: services = [] } = useQuery<ServiceMaster[]>({
    queryKey: [api.masters.services.list.path],
  });

  const { data: vehicleTypes = [] } = useQuery<VehicleType[]>({
    queryKey: [api.masters.vehicleTypes.list.path],
  });

  const createVehicleTypeMutation = useMutation({
    mutationFn: (name: string) => apiRequest("POST", api.masters.vehicleTypes.create.path, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.vehicleTypes.list.path] });
      setNewVehicleTypeName("");
      toast({ title: "Success", description: "Vehicle type added successfully" });
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

        <Tabs defaultValue="service" className="w-full">
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
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
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
          </TabsContent>

          {/* PPF and Accessories tabs remain simple for now */}
          <TabsContent value="ppf">
            <Card><CardContent className="pt-6 text-muted-foreground italic">PPF management coming soon...</CardContent></Card>
          </TabsContent>
          <TabsContent value="accessories">
            <Card><CardContent className="pt-6 text-muted-foreground italic">Accessories management coming soon...</CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function AddServiceForm({ onClose, vehicleTypes }: { onClose: () => void, vehicleTypes: VehicleType[] }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [pricing, setPricing] = useState<any[]>([]);

  const createServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", api.masters.services.create.path, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.services.list.path] });
      toast({ title: "Success", description: "Service added successfully" });
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
        <Button onClick={() => createServiceMutation.mutate({ name, pricingByVehicleType: pricing })}>Save Service</Button>
      </div>
    </div>
  );
}

