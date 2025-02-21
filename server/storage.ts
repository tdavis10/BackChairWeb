import { users, type User, type InsertUser, type SupportTicket, type InsertTicket } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTicketsByUserId(userId: number): Promise<SupportTicket[]>;
  createTicket(ticket: InsertTicket): Promise<SupportTicket>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<number, SupportTicket>;
  currentId: number;
  ticketId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.currentId = 1;
    this.ticketId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTicketsByUserId(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.userId === userId
    );
  }

  async createTicket(insertTicket: InsertTicket): Promise<SupportTicket> {
    const id = this.ticketId++;
    const ticket: SupportTicket = {
      ...insertTicket,
      id,
      createdAt: new Date(),
      status: "open"
    };
    this.tickets.set(id, ticket);
    return ticket;
  }
}

export const storage = new MemStorage();