import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import { connectDB } from "./db";
import mongoose from "mongoose";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await connectDB();

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(email);

      if (!user || user.password !== password) {
        // Simple password check for now as per instructions (no hash mentioned, but recommended)
        // For production, use bcrypt.
        return res.status(401).json({ message: "Invalid email or password" });
      }

      (req.session as any).userId = user.id;
      res.json({ id: user.id, email: user.email });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.sendStatus(401);

    const user = await storage.getUser(userId);
    if (!user) return res.sendStatus(401);

    res.json({ id: user.id, email: user.email, name: user.name });
  });

  app.patch("/api/user", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.sendStatus(401);

    try {
      const user = await storage.updateUser(userId, req.body);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Dashboard Route
  app.get(api.dashboard.get.path, async (req, res) => {
    if (!(req.session as any).userId) {
      return res.status(401).send("Unauthorized");
    }
    const data = await storage.getDashboardData();
    res.json(data);
  });

  // Masters Routes
  app.get(api.masters.services.list.path, async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.post(api.masters.services.create.path, async (req, res) => {
    try {
      const input = api.masters.services.create.input.parse(req.body);
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch("/api/masters/services/:id", async (req, res) => {
    try {
      const service = await storage.updateService(req.params.id, req.body);
      if (!service) return res.status(404).json({ message: "Service not found" });
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/masters/services/:id", async (req, res) => {
    const success = await storage.deleteService(req.params.id);
    if (!success) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted" });
  });

  app.get(api.masters.ppf.list.path, async (req, res) => {
    const ppfs = await storage.getPPFs();
    res.json(ppfs);
  });

  app.post(api.masters.ppf.create.path, async (req, res) => {
    try {
      const ppf = await storage.createPPF(req.body);
      res.status(201).json(ppf);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch("/api/masters/ppf/:id", async (req, res) => {
    try {
      const ppf = await storage.updatePPF(req.params.id, req.body);
      if (!ppf) return res.status(404).json({ message: "PPF not found" });
      res.json(ppf);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/masters/ppf/:id", async (req, res) => {
    const success = await storage.deletePPF(req.params.id);
    if (!success) return res.status(404).json({ message: "PPF not found" });
    res.json({ message: "PPF deleted" });
  });

  app.get(api.masters.accessories.list.path, async (req, res) => {
    const accessories = await storage.getAccessories();
    res.json(accessories);
  });

  app.post(api.masters.accessories.create.path, async (req, res) => {
    try {
      const accessory = await storage.createAccessory(req.body);
      res.status(201).json(accessory);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.masters.accessories.categories.list.path, async (req, res) => {
    const categories = await storage.getAccessoryCategories();
    res.json(categories);
  });

  app.post(api.masters.accessories.categories.create.path, async (req, res) => {
    try {
      const { name } = api.masters.accessories.categories.create.input.parse(req.body);
      const category = await storage.createAccessoryCategory(name);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch("/api/masters/accessory-categories/:id", async (req, res) => {
    try {
      const category = await storage.updateAccessoryCategory(req.params.id, req.body.name);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/masters/accessory-categories/:id", async (req, res) => {
    const success = await storage.deleteAccessoryCategory(req.params.id);
    if (!success) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  });

  app.patch("/api/masters/accessories/:id", async (req, res) => {
    try {
      const accessory = await storage.updateAccessory(req.params.id, req.body);
      if (!accessory) return res.status(404).json({ message: "Accessory not found" });
      res.json(accessory);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/masters/accessories/:id", async (req, res) => {
    const success = await storage.deleteAccessory(req.params.id);
    if (!success) return res.status(404).json({ message: "Accessory not found" });
    res.json({ message: "Accessory deleted" });
  });

  app.get(api.masters.vehicleTypes.list.path, async (req, res) => {
    const types = await storage.getVehicleTypes();
    res.json(types);
  });

  app.post(api.masters.vehicleTypes.create.path, async (req, res) => {
    try {
      const { name } = api.masters.vehicleTypes.create.input.parse(req.body);
      const type = await storage.createVehicleType(name);
      res.status(201).json(type);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Technician Routes
  app.get(api.technicians.list.path, async (req, res) => {
    const technicians = await storage.getTechnicians();
    res.json(technicians);
  });

  app.post(api.technicians.create.path, async (req, res) => {
    try {
      const input = api.technicians.create.input.parse(req.body);
      const technician = await storage.createTechnician(input);
      res.status(201).json(technician);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch("/api/technicians/:id", async (req, res) => {
    try {
      const technician = await storage.updateTechnician(req.params.id, req.body);
      if (!technician) return res.status(404).json({ message: "Technician not found" });
      res.json(technician);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/technicians/:id", async (req, res) => {
    const success = await storage.deleteTechnician(req.params.id);
    if (!success) return res.status(404).json({ message: "Technician not found" });
    res.json({ message: "Technician deleted" });
  });

  // Appointment Routes
  app.get(api.appointments.list.path, async (req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    try {
      const input = api.appointments.create.input.parse(req.body);
      const appointment = await storage.createAppointment(input);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.updateAppointment(req.params.id, req.body);
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    const success = await storage.deleteAppointment(req.params.id);
    if (!success) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment deleted" });
  });

  // Job Cards Routes
  app.get("/api/job-cards", async (req, res) => {
    const jobs = await storage.getJobCards();
    res.json(jobs);
  });

  app.get("/api/job-cards/:id", async (req, res) => {
    const job = await storage.getJobCard(req.params.id);
    if (!job) return res.status(404).json({ message: "Job card not found" });
    res.json(job);
  });

  app.post("/api/job-cards", async (req, res) => {
    const job = await storage.createJobCard(req.body);
    res.json(job);
  });

  app.patch("/api/job-cards/:id", async (req, res) => {
    const job = await storage.updateJobCard(req.params.id, req.body);
    if (!job) return res.status(404).json({ message: "Job card not found" });
    res.json(job);
  });

  app.delete("/api/job-cards/:id", async (req, res) => {
    const success = await storage.deleteJobCard(req.params.id);
    if (!success) return res.status(404).json({ message: "Job card not found" });
    res.json({ message: "Job card deleted" });
  });

  // Inquiry Routes
  app.get("/api/inquiries", async (req, res) => {
    const inquiries = await storage.getInquiries();
    res.json(inquiries);
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiry = await storage.createInquiry(req.body);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete("/api/inquiries/:id", async (req, res) => {
    const success = await storage.deleteInquiry(req.params.id);
    if (!success) return res.status(404).json({ message: "Inquiry not found" });
    res.json({ message: "Inquiry deleted" });
  });

  // Seed default user if not exists
  if (mongoose.connection.readyState === 1) {
    const defaultEmail = "Autogarage@system.com";
    const existing = await storage.getUserByEmail(defaultEmail);
    if (!existing) {
      await storage.createUser({
        email: defaultEmail,
        password: "password123", // Matches the dummy login in screenshot roughly
      });
      console.log("Seeded default user:", defaultEmail);
    }
  } else {
    console.warn("MongoDB not connected, skipping seed.");
  }

  return httpServer;
}
