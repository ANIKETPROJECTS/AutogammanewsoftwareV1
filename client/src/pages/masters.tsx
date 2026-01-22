import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Shield, Package } from "lucide-react";

export default function MastersPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Masters
          </h1>
          <p className="text-muted-foreground">
            Manage your service, PPF, and accessories master data.
          </p>
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

          <TabsContent value="service">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Service Master List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  Manage standard services, labor rates, and maintenance packages.
                </p>
                {/* Future implementation: Service table/form */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ppf">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  PPF Master List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  Manage Paint Protection Film variants, pricing, and warranty terms.
                </p>
                {/* Future implementation: PPF table/form */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Accessories Master List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  Manage accessory inventory categories, suppliers, and retail pricing.
                </p>
                {/* Future implementation: Accessories table/form */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
