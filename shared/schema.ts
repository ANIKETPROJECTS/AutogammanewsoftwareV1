import { z } from "zod";

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type User = {
  id: string;
  email: string;
  password?: string; // omit in responses
  name?: string;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

// Dashboard Types
export const statSchema = z.object({
  label: z.string(),
  value: z.string(),
  subtext: z.string(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type Stat = z.infer<typeof statSchema>;

export const chartDataSchema = z.object({
  name: z.string(),
  value: z.number(),
});

export type ChartData = z.infer<typeof chartDataSchema>;

export const dashboardDataSchema = z.object({
  stats: z.array(statSchema),
  salesTrends: z.array(chartDataSchema),
  customerStatus: z.array(chartDataSchema),
  customerGrowth: z.array(chartDataSchema),
  inventoryByCategory: z.array(chartDataSchema),
});

// Service Master Schemas
export const warrantyOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.coerce.number(),
});

export const vehiclePricingSchema = z.object({
  vehicleType: z.string(),
  options: z.array(warrantyOptionSchema),
});

export const serviceMasterSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  pricingByVehicleType: z.array(vehiclePricingSchema),
});

export type WarrantyOption = z.infer<typeof warrantyOptionSchema>;
export type VehiclePricing = z.infer<typeof vehiclePricingSchema>;
export type ServiceMaster = z.infer<typeof serviceMasterSchema>;

export const insertServiceMasterSchema = serviceMasterSchema.omit({ id: true });
export type InsertServiceMaster = z.infer<typeof insertServiceMasterSchema>;

export const vehicleTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type VehicleType = z.infer<typeof vehicleTypeSchema>;
