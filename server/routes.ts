import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCaseBrief } from "./openai";
import { insertUserSchema, insertCaseSchema, insertEvidenceSchema, insertHearingSchema, type User } from "@shared/schema";
import session from "express-session";
import crypto from "crypto";

// Extend session interface to include user
declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}

// Simple session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "judicial-portal-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!req.session?.user || !roles.includes(req.session.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(sessionMiddleware);

  // Initialize seed data
  await storage.seedData();

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password, role, otp } = req.body;

      if (!identifier || !role) {
        return res.status(400).json({ message: "Identifier and role are required" });
      }

      // Handle citizen OTP authentication
      if (role === "citizen") {
        if (!otp || otp !== "123456") {
          return res.status(400).json({ message: "Invalid OTP. Use 123456 for demo." });
        }
        
        const user = await storage.getUserByCredentials(identifier, role);
        if (!user) {
          return res.status(401).json({ message: "Invalid CNIC" });
        }

        req.session.user = user;
        return res.json({ user, message: "Login successful" });
      }

      // Handle other roles with password
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const user = await storage.getUserByCredentials(identifier, role);
      console.log("Debug - identifier:", identifier, "role:", role);
      console.log("Debug - found user:", user ? "YES" : "NO");
      if (user) {
        console.log("Debug - user password:", user.password, "provided password:", password);
      }
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = user;
      res.json({ user, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/user", requireAuth, (req: any, res) => {
    res.json(req.session.user);
  });

  // User routes
  app.get("/api/users", requireAuth, requireRole(["clerk", "judge"]), async (req, res) => {
    try {
      // Implementation would go here for listing users
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Case routes
  app.get("/api/cases", requireAuth, async (req: any, res) => {
    try {
      const user = req.session.user;
      let cases;

      if (user.role === "citizen") {
        cases = await storage.getCasesByUser(user.id);
      } else if (user.role === "judge") {
        cases = await storage.getCasesByJudge(user.id);
      } else {
        cases = await storage.getCases();
      }

      res.json(cases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get("/api/cases/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const case_ = await storage.getCaseById(id);
      
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      res.json(case_);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  app.post("/api/cases", requireAuth, requireRole(["citizen", "advocate", "clerk"]), async (req: any, res) => {
    try {
      const caseData = insertCaseSchema.parse(req.body);
      const user = req.session.user;

      // Set filed by user
      caseData.filedBy = user.id;
      
      const case_ = await storage.createCase(caseData);
      res.status(201).json(case_);
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  app.patch("/api/cases/:id", requireAuth, requireRole(["judge", "clerk"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const case_ = await storage.updateCase(id, updates);
      res.json(case_);
    } catch (error) {
      console.error("Error updating case:", error);
      res.status(500).json({ message: "Failed to update case" });
    }
  });

  // Evidence routes
  app.get("/api/cases/:caseId/evidence", requireAuth, async (req, res) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const evidence = await storage.getEvidenceByCase(caseId);
      res.json(evidence);
    } catch (error) {
      console.error("Error fetching evidence:", error);
      res.status(500).json({ message: "Failed to fetch evidence" });
    }
  });

  app.post("/api/cases/:caseId/evidence", requireAuth, async (req: any, res) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const evidenceData = insertEvidenceSchema.parse(req.body);
      const user = req.session.user;

      evidenceData.caseId = caseId;
      evidenceData.uploadedBy = user.id;
      
      // Generate hash for the file (simplified for demo)
      evidenceData.hash = crypto.createHash('sha256').update(evidenceData.filename + Date.now()).digest('hex');
      
      const evidence = await storage.createEvidence(evidenceData);
      res.status(201).json(evidence);
    } catch (error) {
      console.error("Error creating evidence:", error);
      res.status(500).json({ message: "Failed to upload evidence" });
    }
  });

  // Hearing routes
  app.get("/api/cases/:caseId/hearings", requireAuth, async (req, res) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const hearings = await storage.getHearingsByCase(caseId);
      res.json(hearings);
    } catch (error) {
      console.error("Error fetching hearings:", error);
      res.status(500).json({ message: "Failed to fetch hearings" });
    }
  });

  app.post("/api/cases/:caseId/hearings", requireAuth, requireRole(["judge", "clerk"]), async (req, res) => {
    try {
      const caseId = parseInt(req.params.caseId);
      const hearingData = insertHearingSchema.parse(req.body);
      
      hearingData.caseId = caseId;
      
      const hearing = await storage.createHearing(hearingData);
      res.status(201).json(hearing);
    } catch (error) {
      console.error("Error creating hearing:", error);
      res.status(500).json({ message: "Failed to create hearing" });
    }
  });

  // AI Brief route
  app.get("/api/ai/brief", requireAuth, async (req, res) => {
    try {
      const caseId = parseInt(req.query.case_id as string);
      
      if (!caseId) {
        return res.status(400).json({ message: "case_id parameter is required" });
      }

      const case_ = await storage.getCaseById(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      const brief = await generateCaseBrief(
        caseId,
        case_.title,
        case_.summary || "",
        case_.type
      );

      res.json(brief);
    } catch (error) {
      console.error("Error generating AI brief:", error);
      res.status(500).json({ message: "Failed to generate AI brief" });
    }
  });

  // Dashboard stats routes
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
    try {
      const user = req.session.user;
      let stats = {};

      if (user.role === "judge") {
        const assignedCases = await storage.getCasesByJudge(user.id);
        const todayHearings = assignedCases.filter(c => 
          c.nextHearing && 
          new Date(c.nextHearing).toDateString() === new Date().toDateString()
        );
        const pendingDecisions = assignedCases.filter(c => c.status === "in-hearing");

        stats = {
          totalCases: assignedCases.length,
          todayHearings: todayHearings.length,
          pendingDecisions: pendingDecisions.length,
        };
      } else if (user.role === "citizen") {
        const userCases = await storage.getCasesByUser(user.id);
        stats = {
          totalCases: userCases.length,
          activeCases: userCases.filter(c => c.status !== "decided").length,
        };
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
