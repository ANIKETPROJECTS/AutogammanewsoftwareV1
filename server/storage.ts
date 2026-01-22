import mongoose from "mongoose";
import { User, InsertUser, DashboardData } from "@shared/schema";
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

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDashboardData(): Promise<DashboardData>;
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
}

export const storage = new MongoStorage();
