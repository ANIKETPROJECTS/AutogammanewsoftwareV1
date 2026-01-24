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

export type DashboardData = z.infer<typeof dashboardDataSchema>;

// Service Master Schemas
export const vehiclePricingSchema = z.object({
  vehicleType: z.string(),
  price: z.coerce.number(),
});

export const serviceMasterSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  pricingByVehicleType: z.array(vehiclePricingSchema),
});

export type VehiclePricing = z.infer<typeof vehiclePricingSchema>;
export type ServiceMaster = z.infer<typeof serviceMasterSchema>;

export const insertServiceMasterSchema = serviceMasterSchema.omit({ id: true });
export type InsertServiceMaster = z.infer<typeof insertServiceMasterSchema>;

// PPF Master Schemas
export const ppfPricingOptionSchema = z.object({
  warrantyName: z.string(),
  price: z.coerce.number(),
});

export const ppfVehiclePricingSchema = z.object({
  vehicleType: z.string(),
  options: z.array(ppfPricingOptionSchema),
});

export const ppfRollSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  stock: z.coerce.number(), // sqft
});

export const ppfMasterSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  pricingByVehicleType: z.array(ppfVehiclePricingSchema),
  rolls: z.array(ppfRollSchema).optional().default([]),
});

export type PPFRoll = z.infer<typeof ppfRollSchema>;
export type PPFPricingOption = z.infer<typeof ppfPricingOptionSchema>;
export type PPFVehiclePricing = z.infer<typeof ppfVehiclePricingSchema>;
export type PPFMaster = z.infer<typeof ppfMasterSchema>;

export const insertPPFMasterSchema = ppfMasterSchema.omit({ id: true });
export type InsertPPFMaster = z.infer<typeof insertPPFMasterSchema>;

export const vehicleTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type VehicleType = z.infer<typeof vehicleTypeSchema>;

// Accessory Master Schemas
export const accessoryCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
});

export type AccessoryCategory = z.infer<typeof accessoryCategorySchema>;

export const accessoryMasterSchema = z.object({
  id: z.string().optional(),
  category: z.string(),
  name: z.string(),
  quantity: z.coerce.number(),
  price: z.coerce.number(),
});

export type AccessoryMaster = z.infer<typeof accessoryMasterSchema>;
export const insertAccessoryMasterSchema = accessoryMasterSchema.omit({ id: true });
export type InsertAccessoryMaster = z.infer<typeof insertAccessoryMasterSchema>;

// Technician Schemas
export const technicianSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  specialty: z.string().min(1),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type Technician = z.infer<typeof technicianSchema>;
export const insertTechnicianSchema = technicianSchema.omit({ id: true });
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;

// Appointment Schemas
export const appointmentStatusSchema = z.enum(["SCHEDULED", "DONE", "CANCELLED"]);
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export const appointmentSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().min(1),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  vehicleInfo: z.string().min(1),
  serviceType: z.string().min(1),
  date: z.string(), // ISO string or YYYY-MM-DD
  time: z.string(), // HH:mm
  status: appointmentStatusSchema.default("SCHEDULED"),
  cancelReason: z.string().optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
export const insertAppointmentSchema = appointmentSchema.omit({ id: true, status: true, cancelReason: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Inquiry Schemas
export const inquiryServiceSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  vehicleType: z.string(),
  warrantyName: z.string().optional(),
  price: z.number(),
});

export const inquiryAccessorySchema = z.object({
  accessoryId: z.string(),
  accessoryName: z.string(),
  category: z.string(),
  price: z.number(),
});

export const inquirySchema = z.object({
  id: z.string().optional(),
  inquiryId: z.string(),
  customerName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  services: z.array(inquiryServiceSchema).default([]),
  accessories: z.array(inquiryAccessorySchema).default([]),
  notes: z.string().optional(),
  ourPrice: z.number(),
  customerPrice: z.number(),
  date: z.string().default(() => new Date().toISOString()),
});

export type Inquiry = z.infer<typeof inquirySchema>;
export const insertInquirySchema = inquirySchema.omit({ id: true, inquiryId: true, date: true });
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
