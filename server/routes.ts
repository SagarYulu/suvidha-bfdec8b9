import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seedData";
import { 
  insertEmployeeSchema, insertDashboardUserSchema, insertIssueSchema, 
  insertIssueCommentSchema, insertTicketFeedbackSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      if (isNaN(employeeId)) {
        return res.status(400).json({ error: "Invalid employee ID" });
      }
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(400).json({ error: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      if (isNaN(employeeId)) {
        return res.status(400).json({ error: "Invalid employee ID" });
      }
      const employee = await storage.updateEmployee(employeeId, req.body);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      if (isNaN(employeeId)) {
        return res.status(400).json({ error: "Invalid employee ID" });
      }
      const success = await storage.deleteEmployee(employeeId);
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard user routes
  app.get("/api/dashboard-users", async (req, res) => {
    try {
      const users = await storage.getDashboardUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching dashboard users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard-users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const user = await storage.getDashboardUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "Dashboard user not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/dashboard-users", async (req, res) => {
    try {
      const validatedData = insertDashboardUserSchema.parse(req.body);
      const user = await storage.createDashboardUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating dashboard user:", error);
      res.status(400).json({ error: "Invalid dashboard user data" });
    }
  });

  app.put("/api/dashboard-users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const user = await storage.updateDashboardUser(userId, req.body);
      if (!user) {
        return res.status(404).json({ error: "Dashboard user not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/dashboard-users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const success = await storage.deleteDashboardUser(userId);
      if (!success) {
        return res.status(404).json({ error: "Dashboard user not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting dashboard user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Issue routes
  app.get("/api/issues", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedTo: req.query.assignedTo as string,
        employeeId: req.query.employeeId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      
      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const issues = await storage.getIssues(filters);
      res.json(issues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/issues/count", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedTo: req.query.assignedTo as string,
        employeeId: req.query.employeeId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      
      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const issues = await storage.getIssues(filters);
      res.json({ count: issues.length });
    } catch (error) {
      console.error("Error fetching issues count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/issues/:id", async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      const issue = await storage.getIssueById(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(issue);
    } catch (error) {
      console.error("Error fetching issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/issues", async (req, res) => {
    try {
      const validatedData = insertIssueSchema.parse(req.body);
      const issue = await storage.createIssue(validatedData);
      res.status(201).json(issue);
    } catch (error) {
      console.error("Error creating issue:", error);
      res.status(400).json({ error: "Invalid issue data" });
    }
  });

  app.put("/api/issues/:id", async (req, res) => {
    try {
      const issueId = parseInt(req.params.id);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      const issue = await storage.updateIssue(issueId, req.body);
      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }
      res.json(issue);
    } catch (error) {
      console.error("Error updating issue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Issue comment routes
  app.get("/api/issues/:issueId/comments", async (req, res) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      const comments = await storage.getIssueComments(issueId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching issue comments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/issues/:issueId/comments", async (req, res) => {
    try {
      const issueId = parseInt(req.params.issueId);
      if (isNaN(issueId)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      const validatedData = insertIssueCommentSchema.parse({
        ...req.body,
        issueId: issueId
      });
      const comment = await storage.createIssueComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating issue comment:", error);
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // Ticket feedback routes
  app.get("/api/ticket-feedback", async (req, res) => {
    try {
      const issueIdParam = req.query.issueId as string;
      const issueId = issueIdParam ? parseInt(issueIdParam) : undefined;
      if (issueIdParam && isNaN(issueId!)) {
        return res.status(400).json({ error: "Invalid issue ID" });
      }
      
      // Get all feedback first
      const feedback = await storage.getTicketFeedback(issueId);
      
      // Apply additional filters for analytics
      let filteredFeedback = feedback;
      
      // Filter by date range
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate as string);
        filteredFeedback = filteredFeedback.filter((f: any) => {
          const feedbackDate = new Date(f.createdAt || f.created_at || '');
          return feedbackDate >= startDate;
        });
      }
      
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate as string);
        endDate.setDate(endDate.getDate() + 1); // Include the end date
        filteredFeedback = filteredFeedback.filter((f: any) => {
          const feedbackDate = new Date(f.createdAt || f.created_at || '');
          return feedbackDate < endDate;
        });
      }
      
      // Filter by sentiment
      if (req.query.sentiment) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.sentiment === req.query.sentiment);
      }
      
      // Filter by city
      if (req.query.city) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.city === req.query.city);
      }
      
      // Filter by cluster
      if (req.query.cluster) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.cluster === req.query.cluster);
      }
      
      // Filter by agent
      if (req.query.agentId) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.agentId === req.query.agentId || f.agent_id === req.query.agentId);
      }
      
      if (req.query.agentName) {
        filteredFeedback = filteredFeedback.filter((f: any) => f.agentName === req.query.agentName || f.agent_name === req.query.agentName);
      }
      
      res.json(filteredFeedback);
    } catch (error) {
      console.error("Error fetching ticket feedback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ticket-feedback", async (req, res) => {
    try {
      const validatedData = insertTicketFeedbackSchema.parse(req.body);
      const feedback = await storage.createTicketFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating ticket feedback:", error);
      res.status(400).json({ error: "Invalid feedback data" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check dashboard users first
      const dashboardUser = await storage.getDashboardUserByEmail(email);
      if (dashboardUser && dashboardUser.password === password) {
        res.json({
          user: {
            id: dashboardUser.id,
            email: dashboardUser.email,
            name: dashboardUser.name,
            role: dashboardUser.role
          },
          success: true
        });
        return;
      }

      // Check employees
      const employee = await storage.getEmployeeByEmail(email);
      if (employee && employee.password === password) {
        res.json({
          user: {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            role: employee.role || "employee"
          },
          success: true
        });
        return;
      }

      res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sentiment analysis route (replacing Supabase Edge Function)
  app.post("/api/analyze-sentiment", async (req, res) => {
    try {
      const { feedback } = req.body;
      
      if (!feedback) {
        return res.status(400).json({ error: "Missing feedback text" });
      }

      // Simple sentiment analysis implementation
      const positiveWords = [
        "good", "great", "excellent", "amazing", "awesome", "fantastic", "wonderful", 
        "happy", "satisfied", "convenient", "helpful", "easy", "comfortable", "enjoy",
        "like", "love", "appreciate", "best", "better", "improved", "thank", "thanks"
      ];

      const negativeWords = [
        "bad", "poor", "terrible", "awful", "horrible", "disappointing", "frustrated",
        "difficult", "hard", "unhappy", "unsatisfied", "inconvenient", "unhelpful", 
        "uncomfortable", "dislike", "hate", "worst", "worse", "not good", "problem",
        "issue", "complaint", "broken", "useless", "waste", "annoying", "annoyed"
      ];

      const normalized = feedback.toLowerCase();
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      for (const word of positiveWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = normalized.match(regex);
        if (matches) {
          positiveCount += matches.length;
        }
      }
      
      for (const word of negativeWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = normalized.match(regex);
        if (matches) {
          negativeCount += matches.length;
        }
      }
      
      let score = 0;
      if (positiveCount > 0 || negativeCount > 0) {
        score = (positiveCount - negativeCount) / (positiveCount + negativeCount);
      }
      
      let label;
      if (score >= 0.3) {
        label = "positive";
      } else if (score > -0.3 && score < 0.3) {
        label = "neutral";
      } else {
        label = "negative";
      }

      let suggestedRating;
      if (score >= 0.5) {
        suggestedRating = 5;
      } else if (score >= 0.1) {
        suggestedRating = 4;
      } else if (score >= -0.1) {
        suggestedRating = 3;
      } else if (score >= -0.5) {
        suggestedRating = 2;
      } else {
        suggestedRating = 1;
      }

      res.json({
        sentiment_score: score,
        sentiment_label: label,
        rating: suggestedRating,
        suggested_tags: [],
        flag_urgent: false,
        flag_abusive: false
      });
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master data routes
  
  // Master roles routes
  app.get("/api/master-roles", async (req, res) => {
    try {
      const result = await storage.getMasterRoles();
      res.json(result);
    } catch (error) {
      console.error("Error fetching master roles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master-roles", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Role name is required" });
      }
      const result = await storage.createMasterRole(name);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating master role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/master-roles/:id", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(roleId) || !name) {
        return res.status(400).json({ error: "Invalid role ID or missing name" });
      }
      const result = await storage.updateMasterRole(roleId, name);
      if (!result) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating master role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/master-roles/:id", async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: "Invalid role ID" });
      }
      const success = await storage.deleteMasterRole(roleId);
      if (!success) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting master role:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master cities routes
  app.get("/api/master-cities", async (req, res) => {
    try {
      const result = await storage.getMasterCities();
      res.json(result);
    } catch (error) {
      console.error("Error fetching master cities:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master-cities", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "City name is required" });
      }
      const result = await storage.createMasterCity(name);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating master city:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/master-cities/:id", async (req, res) => {
    try {
      const cityId = parseInt(req.params.id);
      const { name } = req.body;
      if (isNaN(cityId) || !name) {
        return res.status(400).json({ error: "Invalid city ID or missing name" });
      }
      const result = await storage.updateMasterCity(cityId, name);
      if (!result) {
        return res.status(404).json({ error: "City not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating master city:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/master-cities/:id", async (req, res) => {
    try {
      const cityId = parseInt(req.params.id);
      if (isNaN(cityId)) {
        return res.status(400).json({ error: "Invalid city ID" });
      }
      const success = await storage.deleteMasterCity(cityId);
      if (!success) {
        return res.status(404).json({ error: "City not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting master city:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master clusters routes
  app.get("/api/master-clusters", async (req, res) => {
    try {
      const result = await storage.getMasterClusters();
      res.json(result);
    } catch (error) {
      console.error("Error fetching master clusters:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master-clusters", async (req, res) => {
    try {
      const { name, cityId } = req.body;
      if (!name || !cityId) {
        return res.status(400).json({ error: "Cluster name and city ID are required" });
      }
      const result = await storage.createMasterCluster(name, cityId);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating master cluster:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/master-clusters/:id", async (req, res) => {
    try {
      const clusterId = parseInt(req.params.id);
      const { name, cityId } = req.body;
      if (isNaN(clusterId) || !name || !cityId) {
        return res.status(400).json({ error: "Invalid cluster ID or missing data" });
      }
      const result = await storage.updateMasterCluster(clusterId, name, cityId);
      if (!result) {
        return res.status(404).json({ error: "Cluster not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error updating master cluster:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/master-clusters/:id", async (req, res) => {
    try {
      const clusterId = parseInt(req.params.id);
      if (isNaN(clusterId)) {
        return res.status(400).json({ error: "Invalid cluster ID" });
      }
      const success = await storage.deleteMasterCluster(clusterId);
      if (!success) {
        return res.status(404).json({ error: "Cluster not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting master cluster:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Audit logs routes
  app.get("/api/audit-logs", async (req, res) => {
    try {
      // For now, return empty array since audit logs aren't fully implemented
      res.json([]);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/audit-logs", async (req, res) => {
    try {
      // For now, just acknowledge the request since audit logs aren't fully implemented
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Seed data route (for development/demo)
  app.post("/api/seed-data", async (req, res) => {
    try {
      const result = await seedDatabase();
      res.json({ 
        message: "Database seeded successfully", 
        data: result 
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
