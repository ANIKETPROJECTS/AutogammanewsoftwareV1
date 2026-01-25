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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, User, Car } from "lucide-react";
import { useLocation } from "wouter";

const jobCardSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  emailAddress: z.string().email().optional().or(z.literal("")),
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  year: z.string().min(4, "Year must be 4 digits"),
  licensePlate: z.string().min(1, "License plate is required"),
  vin: z.string().optional().or(z.literal("")),
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
    },
  });

  const onSubmit = (data: JobCardFormValues) => {
    console.log("Job card data:", data);
    // Logic for next sections will be added later
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
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
          </form>
        </Form>
      </div>
    </Layout>
  );
}
