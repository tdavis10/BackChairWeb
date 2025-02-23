import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { insertTicketSchema } from "@shared/schema";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize auth before other routes
  setupAuth(app);

  app.get("/api/tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tickets = await storage.getTicketsByUserId(req.user.id);
    res.json(tickets);
  });

  app.post("/api/tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertTicketSchema.safeParse({
      ...req.body,
      userId: req.user.id,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const ticket = await storage.createTicket(result.data);
    res.status(201).json(ticket);
  });

  const httpServer = createServer(app);
  return httpServer;
}