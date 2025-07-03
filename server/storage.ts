import { db } from "./db";
import { 
  users, employees, dashboardUsers, issues, issueComments, 
  issueInternalComments, ticketFeedback, rbacRoles, rbacPermissions,
  type User, type Employee, type DashboardUser, type Issue, 
  type IssueComment, type InsertUser, type InsertEmployee, 
  type InsertDashboardUser, type InsertIssue, type InsertIssueComment,
  type InsertTicketFeedback, type TicketFeedback
} from "@shared/schema";
import { eq, and, desc, or, like, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employee methods
  getEmployeeById(id: string): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;
  
  // Dashboard user methods
  getDashboardUsers(): Promise<DashboardUser[]>;
  getDashboardUserById(id: string): Promise<DashboardUser | undefined>;
  getDashboardUserByEmail(email: string): Promise<DashboardUser | undefined>;
  createDashboardUser(user: InsertDashboardUser): Promise<DashboardUser>;
  updateDashboardUser(id: string, updates: Partial<DashboardUser>): Promise<DashboardUser | undefined>;
  deleteDashboardUser(id: string): Promise<boolean>;
  
  // Issue methods
  getIssues(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    employeeUuid?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Issue[]>;
  getIssueById(id: string): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | undefined>;
  
  // Issue comment methods
  getIssueComments(issueId: string): Promise<IssueComment[]>;
  createIssueComment(comment: InsertIssueComment): Promise<IssueComment>;
  
  // Ticket feedback methods
  getTicketFeedback(issueId?: string): Promise<TicketFeedback[]>;
  createTicketFeedback(feedback: InsertTicketFeedback): Promise<TicketFeedback>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Employee methods
  async getEmployeeById(id: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.id, id));
    return result[0];
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.email, email));
    return result[0];
  }

  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(employee).returning();
    return result[0];
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const result = await db.update(employees)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Dashboard user methods
  async getDashboardUsers(): Promise<DashboardUser[]> {
    return await db.select().from(dashboardUsers).orderBy(desc(dashboardUsers.createdAt));
  }

  async getDashboardUserById(id: string): Promise<DashboardUser | undefined> {
    const result = await db.select().from(dashboardUsers).where(eq(dashboardUsers.id, id));
    return result[0];
  }

  async getDashboardUserByEmail(email: string): Promise<DashboardUser | undefined> {
    const result = await db.select().from(dashboardUsers).where(eq(dashboardUsers.email, email));
    return result[0];
  }

  async createDashboardUser(user: InsertDashboardUser): Promise<DashboardUser> {
    const result = await db.insert(dashboardUsers).values(user).returning();
    return result[0];
  }

  async updateDashboardUser(id: string, updates: Partial<DashboardUser>): Promise<DashboardUser | undefined> {
    const result = await db.update(dashboardUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dashboardUsers.id, id))
      .returning();
    return result[0];
  }

  async deleteDashboardUser(id: string): Promise<boolean> {
    const result = await db.delete(dashboardUsers).where(eq(dashboardUsers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Issue methods
  async getIssues(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    employeeUuid?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Issue[]> {
    let query = db.select().from(issues);
    
    if (filters) {
      const conditions = [];
      
      if (filters.status) {
        conditions.push(eq(issues.status, filters.status));
      }
      if (filters.priority) {
        conditions.push(eq(issues.priority, filters.priority));
      }
      if (filters.assignedTo) {
        conditions.push(eq(issues.assignedTo, filters.assignedTo));
      }
      if (filters.employeeId) {
        conditions.push(eq(issues.employeeId, filters.employeeId));
      }
      if (filters.startDate) {
        conditions.push(sql`${issues.createdAt} >= ${filters.startDate}`);
      }
      if (filters.endDate) {
        conditions.push(sql`${issues.createdAt} <= ${filters.endDate}`);
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
    }
    
    return await query.orderBy(desc(issues.createdAt));
  }

  async getIssueById(id: string): Promise<Issue | undefined> {
    const result = await db.select().from(issues).where(eq(issues.id, id));
    return result[0];
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const result = await db.insert(issues).values(issue).returning();
    return result[0];
  }

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | undefined> {
    const result = await db.update(issues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(issues.id, id))
      .returning();
    return result[0];
  }

  // Issue comment methods
  async getIssueComments(issueId: string): Promise<IssueComment[]> {
    return await db.select()
      .from(issueComments)
      .where(eq(issueComments.issueId, issueId))
      .orderBy(desc(issueComments.createdAt));
  }

  async createIssueComment(comment: InsertIssueComment): Promise<IssueComment> {
    const result = await db.insert(issueComments).values(comment).returning();
    return result[0];
  }

  // Ticket feedback methods
  async getTicketFeedback(issueId?: string): Promise<TicketFeedback[]> {
    if (issueId) {
      return await db.select()
        .from(ticketFeedback)
        .where(eq(ticketFeedback.issueId, issueId))
        .orderBy(desc(ticketFeedback.createdAt));
    }
    
    return await db.select()
      .from(ticketFeedback)
      .orderBy(desc(ticketFeedback.createdAt));
  }

  async createTicketFeedback(feedback: InsertTicketFeedback): Promise<TicketFeedback> {
    const result = await db.insert(ticketFeedback).values(feedback).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
