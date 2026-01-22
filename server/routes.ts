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

    res.json({ id: user.id, email: user.email });
  });

  // Dashboard Route
  app.get(api.dashboard.get.path, async (req, res) => {
    if (!(req.session as any).userId) {
      return res.status(401).send("Unauthorized");
    }
    const data = await storage.getDashboardData();
    res.json(data);
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
