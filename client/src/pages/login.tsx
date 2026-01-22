import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginUser } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  
  const form = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginUser) {
    login(data);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-black/90 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Using a mechanic garage image from unsplash */}
        <img 
          src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?q=80&w=2574&auto=format&fit=crop"
          alt="Auto Workshop Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <Card className="bg-white rounded-2xl shadow-2xl overflow-hidden border-none p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-lg shadow-primary/30 transform -rotate-3">
              AG
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
              Auto <span className="text-primary">Gamma</span>
            </h1>
            <p className="text-muted-foreground font-medium mt-2">Management CRM</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="admin@autogamma.com" 
                        className="h-12 bg-gray-50 border-gray-200 focus:ring-primary focus:border-primary rounded-xl" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="h-12 bg-gray-50 border-gray-200 focus:ring-primary focus:border-primary rounded-xl" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 rounded-xl mt-2 transition-all hover:-translate-y-0.5"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Forgot your password? <a href="#" className="text-primary font-semibold hover:underline">Contact Support</a>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
