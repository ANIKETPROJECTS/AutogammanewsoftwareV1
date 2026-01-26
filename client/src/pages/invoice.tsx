import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Invoice } from "@shared/schema";
import { Search, FileText, Building2, User, Car, Calendar, IndianRupee, Printer } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function InvoicePage() {
  const [search, setSearch] = useState("");
  const [businessFilter, setBusinessFilter] = useState("All");

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(search.toLowerCase()) ||
      invoice.jobNo.toLowerCase().includes(search.toLowerCase());
    
    const matchesBusiness = businessFilter === "All" || invoice.business === businessFilter;
    
    return matchesSearch && matchesBusiness;
  });

  const businessCounts = {
    "All": invoices.length,
    "Auto Gamma": invoices.filter(i => i.business === "Auto Gamma").length,
    "AGNX": invoices.filter(i => i.business === "AGNX").length,
  };

  const totalAmount = filteredInvoices.reduce((acc, inv) => acc + inv.total, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage and view all generated invoices</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by invoice #, customer, job #..." 
              className="pl-10 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-invoice"
            />
          </div>
          <Select value={businessFilter} onValueChange={setBusinessFilter}>
            <SelectTrigger className="w-48" data-testid="select-business-filter">
              <SelectValue placeholder="Filter by business" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Businesses</SelectItem>
              <SelectItem value="Auto Gamma">Auto Gamma</SelectItem>
              <SelectItem value="AGNX">AGNX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(businessCounts).map(([business, count]) => (
            <Button
              key={business}
              variant={businessFilter === business ? "default" : "outline"}
              onClick={() => setBusinessFilter(business)}
              className={`h-9 whitespace-nowrap ${businessFilter === business ? "bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200" : ""}`}
              data-testid={`button-filter-${business.toLowerCase().replace(' ', '-')}`}
            >
              {business} <span className="ml-2 text-xs opacity-60">{count}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{filteredInvoices.length} invoices</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <IndianRupee className="h-5 w-5" />
            <span>Total: ₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-slate-100"></CardHeader>
                <CardContent className="h-32"></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No invoices found</h3>
            <p className="text-muted-foreground">
              {search || businessFilter !== "All" 
                ? "Try adjusting your search or filter" 
                : "Invoices will appear here when you create job cards"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <Card 
                key={invoice.id} 
                className="hover-elevate cursor-pointer"
                data-testid={`card-invoice-${invoice.invoiceNo}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">{invoice.invoiceNo}</CardTitle>
                      <p className="text-sm text-muted-foreground">Job: {invoice.jobNo}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={invoice.business === "Auto Gamma" 
                        ? "bg-red-50 text-red-700 border-red-200" 
                        : "bg-blue-50 text-blue-700 border-blue-200"
                      }
                    >
                      <Building2 className="h-3 w-3 mr-1" />
                      {invoice.business}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{invoice.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span>{invoice.vehicleInfo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(invoice.createdAt), "dd MMM yyyy, hh:mm a")}</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="text-xs text-muted-foreground mb-2">Items ({invoice.items.length})</div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {invoice.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="truncate flex-1">{item.name}</span>
                          <span className="text-muted-foreground ml-2">₹{item.price.toLocaleString()}</span>
                        </div>
                      ))}
                      {invoice.items.length > 3 && (
                        <div className="text-xs text-muted-foreground">+{invoice.items.length - 3} more items</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{invoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>GST ({invoice.gst}%)</span>
                      <span>₹{invoice.gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-1 border-t">
                      <span>Total</span>
                      <span className="text-red-600">₹{invoice.total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2" size="sm" data-testid={`button-print-${invoice.invoiceNo}`}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}