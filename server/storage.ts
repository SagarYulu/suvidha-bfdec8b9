import { db } from "./db";
import { 
  employees, dashboardUsers, issues, issueComments, 
  issueInternalComments, ticketFeedback, rbacRoles, rbacPermissions,
  masterRoles, masterCities, masterClusters,
  type Employee, type DashboardUser, type Issue, 
  type IssueComment, type InsertEmployee, 
  type InsertDashboardUser, type InsertIssue, type InsertIssueComment,
  type InsertTicketFeedback, type TicketFeedback
} from "@shared/schema";
import { eq, and, desc, or, like, sql } from "drizzle-orm";

export interface IStorage {
  // Employee methods
  getEmployeeById(id: number): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Dashboard user methods
  getDashboardUsers(): Promise<DashboardUser[]>;
  getDashboardUserById(id: number): Promise<DashboardUser | undefined>;
  getDashboardUserByEmail(email: string): Promise<DashboardUser | undefined>;
  createDashboardUser(user: InsertDashboardUser): Promise<DashboardUser>;
  updateDashboardUser(id: number, updates: Partial<DashboardUser>): Promise<DashboardUser | undefined>;
  deleteDashboardUser(id: number): Promise<boolean>;
  
  // Issue methods
  getIssues(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Issue[]>;
  getIssueById(id: number): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, updates: Partial<Issue>): Promise<Issue | undefined>;
  
  // Issue comment methods
  getIssueComments(issueId: number): Promise<IssueComment[]>;
  createIssueComment(comment: InsertIssueComment): Promise<IssueComment>;
  
  // Ticket feedback methods
  getTicketFeedback(issueId?: number): Promise<TicketFeedback[]>;
  createTicketFeedback(feedback: InsertTicketFeedback): Promise<TicketFeedback>;
  
  // Master data methods
  getMasterRoles(): Promise<any[]>;
  createMasterRole(name: string): Promise<any>;
  updateMasterRole(id: number, name: string): Promise<any>;
  deleteMasterRole(id: number): Promise<boolean>;
  
  getMasterCities(): Promise<any[]>;
  createMasterCity(name: string): Promise<any>;
  updateMasterCity(id: number, name: string): Promise<any>;
  deleteMasterCity(id: number): Promise<boolean>;
  
  getMasterClusters(): Promise<any[]>;
  createMasterCluster(name: string, cityId: number): Promise<any>;
  updateMasterCluster(id: number, name: string, cityId: number): Promise<any>;
  deleteMasterCluster(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Employee methods
  async getEmployeeById(id: number): Promise<Employee | undefined> {
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

  async updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee | undefined> {
    const result = await db.update(employees)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Dashboard user methods
  async getDashboardUsers(): Promise<DashboardUser[]> {
    return await db.select().from(dashboardUsers).orderBy(desc(dashboardUsers.createdAt));
  }

  async getDashboardUserById(id: number): Promise<DashboardUser | undefined> {
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

  async updateDashboardUser(id: number, updates: Partial<DashboardUser>): Promise<DashboardUser | undefined> {
    const result = await db.update(dashboardUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dashboardUsers.id, id))
      .returning();
    return result[0];
  }

  async deleteDashboardUser(id: number): Promise<boolean> {
    const result = await db.delete(dashboardUsers).where(eq(dashboardUsers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Issue methods
  async getIssues(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    employeeId?: string;
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
        const assignedToId = parseInt(filters.assignedTo);
        if (!isNaN(assignedToId)) {
          conditions.push(eq(issues.assignedTo, assignedToId));
        }
      }
      if (filters.employeeId) {
        const employeeId = parseInt(filters.employeeId);
        if (!isNaN(employeeId)) {
          conditions.push(eq(issues.employeeId, employeeId));
        }
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

  async getIssueById(id: number): Promise<Issue | undefined> {
    const result = await db.select().from(issues).where(eq(issues.id, id));
    return result[0];
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const result = await db.insert(issues).values(issue).returning();
    return result[0];
  }

  async updateIssue(id: number, updates: Partial<Issue>): Promise<Issue | undefined> {
    const result = await db.update(issues)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(issues.id, id))
      .returning();
    return result[0];
  }

  // Issue comment methods
  async getIssueComments(issueId: number): Promise<IssueComment[]> {
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
  async getTicketFeedback(issueId?: number): Promise<TicketFeedback[]> {
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

  // Master data methods
  async getMasterRoles(): Promise<any[]> {
    return await db.select().from(masterRoles).orderBy(masterRoles.name);
  }

  async createMasterRole(name: string): Promise<any> {
    const result = await db.insert(masterRoles).values({ name }).returning();
    return result[0];
  }

  async updateMasterRole(id: number, name: string): Promise<any> {
    const result = await db.update(masterRoles)
      .set({ name })
      .where(eq(masterRoles.id, id))
      .returning();
    return result[0];
  }

  async deleteMasterRole(id: number): Promise<boolean> {
    const result = await db.delete(masterRoles).where(eq(masterRoles.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMasterCities(): Promise<any[]> {
    return await db.select().from(masterCities).orderBy(masterCities.name);
  }

  async createMasterCity(name: string): Promise<any> {
    const result = await db.insert(masterCities).values({ name }).returning();
    return result[0];
  }

  async updateMasterCity(id: number, name: string): Promise<any> {
    const result = await db.update(masterCities)
      .set({ name })
      .where(eq(masterCities.id, id))
      .returning();
    return result[0];
  }

  async deleteMasterCity(id: number): Promise<boolean> {
    const result = await db.delete(masterCities).where(eq(masterCities.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getMasterClusters(): Promise<any[]> {
    return await db.select({
      id: masterClusters.id,
      name: masterClusters.name,
      cityId: masterClusters.cityId,
      cityName: masterCities.name,
      createdAt: masterClusters.createdAt
    })
    .from(masterClusters)
    .leftJoin(masterCities, eq(masterClusters.cityId, masterCities.id))
    .orderBy(masterClusters.name);
  }

  async createMasterCluster(name: string, cityId: number): Promise<any> {
    const result = await db.insert(masterClusters).values({ name, cityId }).returning();
    return result[0];
  }

  async updateMasterCluster(id: number, name: string, cityId: number): Promise<any> {
    const result = await db.update(masterClusters)
      .set({ name, cityId })
      .where(eq(masterClusters.id, id))
      .returning();
    return result[0];
  }

  async deleteMasterCluster(id: number): Promise<boolean> {
    const result = await db.delete(masterClusters).where(eq(masterClusters.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
