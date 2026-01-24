import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowLeft, Package } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { AccessoryMaster, AccessoryCategory } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

export default function AccessoryCategoryDetail() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newAccessoryName, setNewAccessoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory | null>(null);

  const { data: categories = [] } = useQuery<AccessoryCategory[]>({
    queryKey: [api.masters.accessories.categories.list.path],
  });

  const { data: accessories = [] } = useQuery<AccessoryMaster[]>({
    queryKey: [api.masters.accessories.list.path],
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
    mutationFn: (categoryId: string) => apiRequest("DELETE", `/api/masters/accessory-categories/${categoryId}`),
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: [api.masters.accessories.categories.list.path] });
      if (selectedCategory?.id === categoryId) setSelectedCategory(null);
      toast({ title: "Success", description: "Category deleted successfully" });
    },
  });

  const createAccessoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", api.masters.accessories.create.path, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.accessories.list.path] });
      setNewAccessoryName("");
      toast({ title: "Success", description: "Accessory item added successfully" });
    },
  });

  const deleteAccessoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/masters/accessories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.masters.accessories.list.path] });
      toast({ title: "Success", description: "Accessory deleted successfully" });
    },
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/masters">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Manage Categories & Accessories
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-4 w-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="New Category" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button size="icon" onClick={() => createCategoryMutation.mutate(newCategoryName)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      selectedCategory?.id === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>{cat.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={selectedCategory?.id === cat.id ? "text-primary-foreground hover:text-primary-foreground" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete category?")) deleteCategoryMutation.mutate(cat.id!);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedCategory ? `Accessories in ${selectedCategory.name}` : "Select a Category"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCategory ? (
                <>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="New Accessory Name" 
                      value={newAccessoryName}
                      onChange={(e) => setNewAccessoryName(e.target.value)}
                    />
                    <Button onClick={() => createAccessoryMutation.mutate({
                      category: selectedCategory.name,
                      name: newAccessoryName,
                      quantity: 0,
                      price: 0
                    })}>
                      Add Item
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {accessories
                      .filter(a => a.category === selectedCategory.name)
                      .map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-3 border rounded-md">
                          <span>{acc.name}</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete accessory?")) deleteAccessoryMutation.mutate(acc.id!);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
                  Select a category from the list to manage its accessories
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
