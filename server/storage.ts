import mongoose from "mongoose";
import { 
  User, 
  InsertUser, 
  DashboardData, 
  ServiceMaster, 
  InsertServiceMaster, 
  PPFMaster,
  InsertPPFMaster,
  AccessoryMaster,
  InsertAccessoryMaster,
  AccessoryCategory,
  VehicleType,
  Technician,
  InsertTechnician,
  Appointment,
  InsertAppointment,
  JobCard,
  InsertJobCard
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
});

export const UserModel = mongoose.model("User", userSchema);

const serviceMasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricingByVehicleType: [{
    vehicleType: String,
    price: Number
  }]
});

export const ServiceMasterModel = mongoose.model("ServiceMaster", serviceMasterSchema);

const ppfMasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricingByVehicleType: [{
    vehicleType: String,
    options: [{
      warrantyName: String,
      price: Number
    }]
  }],
  rolls: [{
    name: String,
    stock: Number
  }]
});

export const PPFMasterModel = mongoose.model("PPFMaster", ppfMasterSchema);

const vehicleTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

export const VehicleTypeModel = mongoose.model("VehicleType", vehicleTypeSchema);

const accessoryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

export const AccessoryCategoryModel = mongoose.model("AccessoryCategory", accessoryCategorySchema);

const accessoryMasterSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

export const AccessoryMasterModel = mongoose.model("AccessoryMaster", accessoryMasterSchema);

const technicianMongoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  phone: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

export const TechnicianModel = mongoose.model("Technician", technicianMongoSchema);

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  vehicleInfo: { type: String, required: true },
  serviceType: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["SCHEDULED", "DONE", "CANCELLED"], default: "SCHEDULED" },
  cancelReason: { type: String },
});

export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);

const inquiryMongoSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  services: [{
    serviceId: String,
    serviceName: String,
    vehicleType: String,
    warrantyName: String,
    price: Number,
    customerPrice: Number
  }],
  accessories: [{
    accessoryId: String,
    accessoryName: String,
    category: String,
    price: Number,
    customerPrice: Number
  }],
  notes: { type: String },
  ourPrice: { type: Number, default: 0 },
  customerPrice: { type: Number, default: 0 },
  date: { type: String, required: true },
  inquiryId: { type: String, required: true }
});

export const InquiryModel = mongoose.model("Inquiry", inquiryMongoSchema);

const jobCardMongoSchema = new mongoose.Schema({
  jobNo: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  emailAddress: { type: String },
  referralSource: { type: String, required: true },
  referrerName: { type: String },
  referrerPhone: { type: String },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String, required: true },
  licensePlate: { type: String, required: true },
  vin: { type: String },
  services: [{ id: String, name: String, price: Number }],
  ppfs: [{ id: String, name: String, price: Number }],
  accessories: [{ id: String, name: String, price: Number }],
  laborCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 18 },
  serviceNotes: { type: String },
  status: { type: String, enum: ["Pending", "In Progress", "Completed", "Cancelled"], default: "Pending" },
  date: { type: String, required: true },
  estimatedCost: { type: Number, required: true },
  technician: { type: String }
});

export const JobCardModel = mongoose.model("JobCard", jobCardMongoSchema);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDashboardData(): Promise<DashboardData>;
  
  // Masters
  getServices(): Promise<ServiceMaster[]>;
  createService(service: InsertServiceMaster): Promise<ServiceMaster>;
  updateService(id: string, service: Partial<ServiceMaster>): Promise<ServiceMaster | undefined>;
  deleteService(id: string): Promise<boolean>;

  getPPFs(): Promise<PPFMaster[]>;
  createPPF(ppf: InsertPPFMaster): Promise<PPFMaster>;
  updatePPF(id: string, ppf: Partial<PPFMaster>): Promise<PPFMaster | undefined>;
  deletePPF(id: string): Promise<boolean>;

  getAccessories(): Promise<AccessoryMaster[]>;
  createAccessory(accessory: InsertAccessoryMaster): Promise<AccessoryMaster>;
  updateAccessory(id: string, accessory: Partial<AccessoryMaster>): Promise<AccessoryMaster | undefined>;
  deleteAccessory(id: string): Promise<boolean>;

  getVehicleTypes(): Promise<VehicleType[]>;
  createVehicleType(name: string): Promise<VehicleType>;

  // Accessory Categories
  getAccessoryCategories(): Promise<AccessoryCategory[]>;
  createAccessoryCategory(name: string): Promise<AccessoryCategory>;
  updateAccessoryCategory(id: string, name: string): Promise<AccessoryCategory | undefined>;
  deleteAccessoryCategory(id: string): Promise<boolean>;

  // Technicians
  getTechnicians(): Promise<Technician[]>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: string, technician: Partial<Technician>): Promise<Technician | undefined>;
  deleteTechnician(id: string): Promise<boolean>;

  // User
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  // Inquiries
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  deleteInquiry(id: string): Promise<boolean>;

  sessionStore: session.Store;
}

export class MongoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    if (!user) return undefined;
    return { 
      id: user._id.toString(), 
      email: user.email, 
      password: user.password as string | undefined, 
      name: user.name as string | undefined 
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    if (!user) return undefined;
    return { 
      id: user._id.toString(), 
      email: user.email, 
      password: user.password as string | undefined, 
      name: user.name as string | undefined 
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel(insertUser);
    await user.save();
    return { id: user._id.toString(), email: user.email, password: user.password };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password as string | undefined,
      name: user.name as string | undefined
    };
  }

  async getDashboardData(): Promise<DashboardData> {
    // Return dummy data as requested
    return {
      stats: [
        { label: "TODAY'S SALES", value: "₹0", subtext: "Total sales generated today", icon: "IndianRupee" },
        { label: "ACTIVE SERVICE JOBS", value: "1", subtext: "Service jobs in progress", icon: "Box" },
        { label: "INQUIRIES TODAY", value: "0", subtext: "Inquiries received today", icon: "MessageSquare" },
        { label: "TOTAL CUSTOMERS", value: "2", subtext: "Registered customers", icon: "Users" },
      ],
      salesTrends: [
        { name: "Fri", value: 0 },
        { name: "Sat", value: 0 },
        { name: "Sun", value: 0 },
        { name: "Mon", value: 0 },
        { name: "Tue", value: 0 },
        { name: "Wed", value: 0 },
        { name: "Thu", value: 0 },
      ],
      customerStatus: [
        { name: "New Lead", value: 1 },
        { name: "Completed", value: 2 },
      ],
      customerGrowth: [
        { name: "Week 1", value: 1 },
        { name: "Week 2", value: 1.5 },
        { name: "Week 3", value: 1.2 },
        { name: "Week 4", value: 2.5 },
      ],
      inventoryByCategory: [
        { name: "Elite", value: 40 },
        { name: "Garware Plus", value: 30 },
        { name: "Garware Premium", value: 20 },
      ],
    };
  }

  async getServices(): Promise<ServiceMaster[]> {
    const services = await ServiceMasterModel.find();
    return services.map(s => ({
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any
    }));
  }

  async createService(service: InsertServiceMaster): Promise<ServiceMaster> {
    const s = new ServiceMasterModel(service);
    await s.save();
    return {
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any
    };
  }

  async updateService(id: string, service: Partial<ServiceMaster>): Promise<ServiceMaster | undefined> {
    const s = await ServiceMasterModel.findByIdAndUpdate(id, service, { new: true });
    if (!s) return undefined;
    return {
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any
    };
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await ServiceMasterModel.findByIdAndDelete(id);
    return !!result;
  }

  async getPPFs(): Promise<PPFMaster[]> {
    const ppfs = await PPFMasterModel.find();
    return ppfs.map(s => ({
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any,
      rolls: s.rolls as any
    }));
  }

  async createPPF(ppf: InsertPPFMaster): Promise<PPFMaster> {
    const s = new PPFMasterModel(ppf);
    await s.save();
    return {
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any,
      rolls: s.rolls as any
    };
  }

  async updatePPF(id: string, ppf: Partial<PPFMaster>): Promise<PPFMaster | undefined> {
    const s = await PPFMasterModel.findByIdAndUpdate(id, ppf, { new: true });
    if (!s) return undefined;
    return {
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any,
      rolls: s.rolls as any
    };
  }

  async deletePPF(id: string): Promise<boolean> {
    const result = await PPFMasterModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAccessories(): Promise<AccessoryMaster[]> {
    const accessories = await AccessoryMasterModel.find();
    return accessories.map(a => ({
      id: a._id.toString(),
      category: a.category,
      name: a.name,
      quantity: a.quantity,
      price: a.price
    }));
  }

  async createAccessory(accessory: InsertAccessoryMaster): Promise<AccessoryMaster> {
    const a = new AccessoryMasterModel(accessory);
    await a.save();
    return {
      id: a._id.toString(),
      category: a.category,
      name: a.name,
      quantity: a.quantity,
      price: a.price
    };
  }

  async updateAccessory(id: string, accessory: Partial<AccessoryMaster>): Promise<AccessoryMaster | undefined> {
    const a = await AccessoryMasterModel.findByIdAndUpdate(id, accessory, { new: true });
    if (!a) return undefined;
    return {
      id: a._id.toString(),
      category: a.category,
      name: a.name,
      quantity: a.quantity,
      price: a.price
    };
  }

  async deleteAccessory(id: string): Promise<boolean> {
    const result = await AccessoryMasterModel.findByIdAndDelete(id);
    return !!result;
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    const types = await VehicleTypeModel.find();
    return types.map(t => ({
      id: t._id.toString(),
      name: t.name
    }));
  }

  async createVehicleType(name: string): Promise<VehicleType> {
    const t = new VehicleTypeModel({ name });
    await t.save();
    return {
      id: t._id.toString(),
      name: t.name
    };
  }

  async getAccessoryCategories(): Promise<AccessoryCategory[]> {
    const categories = await AccessoryCategoryModel.find();
    return categories.map(c => ({
      id: c._id.toString(),
      name: c.name
    }));
  }

  async createAccessoryCategory(name: string): Promise<AccessoryCategory> {
    const c = new AccessoryCategoryModel({ name });
    await c.save();
    return {
      id: c._id.toString(),
      name: c.name
    };
  }

  async updateAccessoryCategory(id: string, name: string): Promise<AccessoryCategory | undefined> {
    const c = await AccessoryCategoryModel.findByIdAndUpdate(id, { name }, { new: true });
    if (!c) return undefined;
    return {
      id: c._id.toString(),
      name: c.name
    };
  }

  async deleteAccessoryCategory(id: string): Promise<boolean> {
    const result = await AccessoryCategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  async getTechnicians(): Promise<Technician[]> {
    const technicians = await TechnicianModel.find();
    return technicians.map(t => ({
      id: t._id.toString(),
      name: t.name,
      specialty: t.specialty,
      phone: t.phone || undefined,
      status: t.status as "active" | "inactive"
    }));
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const t = new TechnicianModel(technician);
    await t.save();
    return {
      id: t._id.toString(),
      name: t.name,
      specialty: t.specialty,
      phone: t.phone || undefined,
      status: t.status as "active" | "inactive"
    };
  }

  async updateTechnician(id: string, technician: Partial<Technician>): Promise<Technician | undefined> {
    const t = await TechnicianModel.findByIdAndUpdate(id, technician, { new: true });
    if (!t) return undefined;
    return {
      id: t._id.toString(),
      name: t.name,
      specialty: t.specialty,
      phone: t.phone || undefined,
      status: t.status as "active" | "inactive"
    };
  }

  async deleteTechnician(id: string): Promise<boolean> {
    const result = await TechnicianModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAppointments(): Promise<Appointment[]> {
    const appointments = await AppointmentModel.find();
    return appointments.map(a => ({
      id: a._id.toString(),
      customerName: a.customerName,
      phone: a.phone,
      vehicleInfo: a.vehicleInfo,
      serviceType: a.serviceType,
      date: a.date,
      time: a.time,
      status: a.status as any,
      cancelReason: a.cancelReason || undefined
    }));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const a = new AppointmentModel(appointment);
    await a.save();
    return {
      id: a._id.toString(),
      customerName: a.customerName,
      phone: a.phone,
      vehicleInfo: a.vehicleInfo,
      serviceType: a.serviceType,
      date: a.date,
      time: a.time,
      status: a.status as any
    };
  }

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    const a = await AppointmentModel.findByIdAndUpdate(id, appointment, { new: true });
    if (!a) return undefined;
    return {
      id: a._id.toString(),
      customerName: a.customerName,
      phone: a.phone,
      vehicleInfo: a.vehicleInfo,
      serviceType: a.serviceType,
      date: a.date,
      time: a.time,
      status: a.status as any,
      cancelReason: a.cancelReason || undefined
    };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await AppointmentModel.findByIdAndDelete(id);
    return !!result;
  }

  // Job Cards
  async getJobCards(): Promise<JobCard[]> {
    const jobs = await JobCardModel.find().sort({ date: -1 });
    return jobs.map(j => ({
      ...j.toObject(),
      id: j._id.toString(),
      services: j.services || [],
      ppfs: j.ppfs || [],
      accessories: j.accessories || []
    })) as JobCard[];
  }

  async createJobCard(jobCard: InsertJobCard): Promise<JobCard> {
    const count = await JobCardModel.countDocuments();
    const year = new Date().getFullYear();
    const jobNo = `JC-${year}-${(count + 1).toString().padStart(3, "0")}`;
    
    const j = new JobCardModel({
      ...jobCard,
      jobNo,
      date: new Date().toISOString()
    });
    await j.save();
    return {
      ...j.toObject(),
      id: j._id.toString()
    } as JobCard;
  }

  async updateJobCard(id: string, jobCard: Partial<JobCard>): Promise<JobCard | undefined> {
    const j = await JobCardModel.findByIdAndUpdate(id, jobCard, { new: true });
    if (!j) return undefined;
    return {
      ...j.toObject(),
      id: j._id.toString()
    } as JobCard;
  }

  async deleteJobCard(id: string): Promise<boolean> {
    const result = await JobCardModel.findByIdAndDelete(id);
    return !!result;
  }

  async getInquiries(): Promise<Inquiry[]> {
    const inquiries = await InquiryModel.find();
    return inquiries.map(i => ({
      id: i._id.toString(),
      customerName: i.customerName,
      phone: i.phone,
      email: i.email || undefined,
      services: i.services as any,
      accessories: i.accessories as any,
      notes: i.notes || undefined,
      ourPrice: i.ourPrice,
      customerPrice: i.customerPrice,
      date: i.date,
      inquiryId: i.inquiryId
    }));
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const nextInquiryId = `INQ-${Date.now()}`;
    const i = new InquiryModel({
      ...inquiry,
      inquiryId: nextInquiryId,
      date: new Date().toISOString()
    });
    await i.save();
    return {
      id: i._id.toString(),
      customerName: i.customerName,
      phone: i.phone,
      email: i.email || undefined,
      services: i.services as any,
      accessories: i.accessories as any,
      notes: i.notes || undefined,
      ourPrice: i.ourPrice,
      customerPrice: i.customerPrice,
      date: i.date,
      inquiryId: i.inquiryId
    };
  }

  async deleteInquiry(id: string): Promise<boolean> {
    const result = await InquiryModel.findByIdAndDelete(id);
    return !!result;
  }
}

export const storage = new MongoStorage();
