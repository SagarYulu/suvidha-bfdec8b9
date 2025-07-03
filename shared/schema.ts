import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for basic authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  empId: text("emp_id").notNull(),
  city: text("city"),
  cluster: text("cluster"),
  manager: text("manager"),
  role: text("role"),
  password: text("password").notNull(),
  dateOfJoining: text("date_of_joining"),
  bloodGroup: text("blood_group"),
  dateOfBirth: text("date_of_birth"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard users table
export const dashboardUsers = pgTable("dashboard_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  employeeId: text("employee_id"),
  city: text("city"),
  cluster: text("cluster"),
  manager: text("manager"),
  role: text("role").notNull(),
  password: text("password").notNull(),
  userId: text("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: text("created_by"),
  lastUpdatedBy: text("last_updated_by"),
});

// Issues table
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  priority: text("priority").notNull(),
  typeId: text("type_id"),
  subTypeId: text("sub_type_id"),
  employeeId: integer("employee_id").notNull(),
  assignedTo: integer("assigned_to"),
  attachmentUrl: text("attachment_url"),
  attachments: jsonb("attachments"),
  mappedTypeId: text("mapped_type_id"),
  mappedSubTypeId: text("mapped_sub_type_id"),
  mappedBy: integer("mapped_by"),
  mappedAt: timestamp("mapped_at"),
  closedAt: timestamp("closed_at"),
  escalationLevel: integer("escalation_level").default(0),
  escalatedAt: timestamp("escalated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Issue comments table
export const issueComments = pgTable("issue_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: text("issue_id").notNull(),
  content: text("content").notNull(),
  employeeUuid: text("employee_uuid").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Issue internal comments table
export const issueInternalComments = pgTable("issue_internal_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: text("issue_id").notNull(),
  content: text("content").notNull(),
  employeeUuid: text("employee_uuid").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Issue audit trail table
export const issueAuditTrail = pgTable("issue_audit_trail", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: text("issue_id").notNull(),
  action: text("action").notNull(),
  employeeUuid: text("employee_uuid").notNull(),
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Issue notifications table
export const issueNotifications = pgTable("issue_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: text("issue_id").notNull(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ticket feedback table
export const ticketFeedback = pgTable("ticket_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: text("issue_id").notNull(),
  employeeUuid: text("employee_uuid").notNull(),
  feedbackOption: text("feedback_option").notNull(),
  sentiment: text("sentiment").notNull(),
  agentId: text("agent_id"),
  agentName: text("agent_name"),
  city: text("city"),
  cluster: text("cluster"),
  createdAt: timestamp("created_at").defaultNow(),
});

// RBAC tables
export const rbacRoles = pgTable("rbac_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rbacPermissions = pgTable("rbac_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rbacRolePermissions = pgTable("rbac_role_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleId: text("role_id").notNull(),
  permissionId: text("permission_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rbacUserRoles = pgTable("rbac_user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  roleId: text("role_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Master data tables
export const masterRoles = pgTable("master_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const masterCities = pgTable("master_cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const masterClusters = pgTable("master_clusters", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  cityId: text("city_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs
export const dashboardUserAuditLogs = pgTable("dashboard_user_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  changes: jsonb("changes").notNull(),
  performedBy: text("performed_by"),
  performedAt: timestamp("performed_at").defaultNow(),
});

export const masterAuditLogs = pgTable("master_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  changes: jsonb("changes").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardUserSchema = createInsertSchema(dashboardUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIssueCommentSchema = createInsertSchema(issueComments).omit({
  id: true,
  createdAt: true,
});

export const insertTicketFeedbackSchema = createInsertSchema(ticketFeedback).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertDashboardUser = z.infer<typeof insertDashboardUserSchema>;
export type DashboardUser = typeof dashboardUsers.$inferSelect;

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

export type InsertIssueComment = z.infer<typeof insertIssueCommentSchema>;
export type IssueComment = typeof issueComments.$inferSelect;

export type InsertTicketFeedback = z.infer<typeof insertTicketFeedbackSchema>;
export type TicketFeedback = typeof ticketFeedback.$inferSelect;
