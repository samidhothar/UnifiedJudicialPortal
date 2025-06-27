import {
  users,
  cases,
  evidence,
  hearings,
  type User,
  type InsertUser,
  type Case,
  type InsertCase,
  type Evidence,
  type InsertEvidence,
  type Hearing,
  type InsertHearing,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByCredentials(identifier: string, role: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Case operations
  getCases(): Promise<Case[]>;
  getCaseById(id: number): Promise<Case | undefined>;
  getCasesByUser(userId: number): Promise<Case[]>;
  getCasesByJudge(judgeId: number): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, caseData: Partial<Case>): Promise<Case>;
  
  // Evidence operations
  getEvidenceByCase(caseId: number): Promise<Evidence[]>;
  createEvidence(evidenceData: InsertEvidence): Promise<Evidence>;
  updateEvidence(id: number, evidenceData: Partial<Evidence>): Promise<Evidence>;
  
  // Hearing operations
  getHearingsByCase(caseId: number): Promise<Hearing[]>;
  createHearing(hearingData: InsertHearing): Promise<Hearing>;
  updateHearing(id: number, hearingData: Partial<Hearing>): Promise<Hearing>;
  
  // Seed data
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByCredentials(identifier: string, role: string): Promise<User | undefined> {
    // Try to find user by cnicOrBarIdOrJudgeCode first
    let user = await db
      .select()
      .from(users)
      .where(and(eq(users.cnicOrBarIdOrJudgeCode, identifier), eq(users.role, role)))
      .limit(1);
    
    // If not found, try by username for roles that use username
    if (user.length === 0) {
      user = await db
        .select()
        .from(users)
        .where(and(eq(users.username, identifier), eq(users.role, role)))
        .limit(1);
    }
    
    return user[0] || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getCases(): Promise<Case[]> {
    return await db.select().from(cases).orderBy(desc(cases.createdAt));
  }

  async getCaseById(id: number): Promise<Case | undefined> {
    const [case_] = await db.select().from(cases).where(eq(cases.id, id));
    return case_ || undefined;
  }

  async getCasesByUser(userId: number): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.filedBy, userId))
      .orderBy(desc(cases.createdAt));
  }

  async getCasesByJudge(judgeId: number): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.assignedJudge, judgeId))
      .orderBy(desc(cases.createdAt));
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const [case_] = await db.insert(cases).values(caseData).returning();
    return case_;
  }

  async updateCase(id: number, caseData: Partial<Case>): Promise<Case> {
    const [case_] = await db
      .update(cases)
      .set(caseData)
      .where(eq(cases.id, id))
      .returning();
    return case_;
  }

  async getEvidenceByCase(caseId: number): Promise<Evidence[]> {
    return await db
      .select()
      .from(evidence)
      .where(eq(evidence.caseId, caseId))
      .orderBy(desc(evidence.createdAt));
  }

  async createEvidence(evidenceData: InsertEvidence): Promise<Evidence> {
    const [evidence_] = await db.insert(evidence).values(evidenceData).returning();
    return evidence_;
  }

  async updateEvidence(id: number, evidenceData: Partial<Evidence>): Promise<Evidence> {
    const [evidence_] = await db
      .update(evidence)
      .set(evidenceData)
      .where(eq(evidence.id, id))
      .returning();
    return evidence_;
  }

  async getHearingsByCase(caseId: number): Promise<Hearing[]> {
    return await db
      .select()
      .from(hearings)
      .where(eq(hearings.caseId, caseId))
      .orderBy(desc(hearings.dateTime));
  }

  async createHearing(hearingData: InsertHearing): Promise<Hearing> {
    const [hearing] = await db.insert(hearings).values(hearingData).returning();
    return hearing;
  }

  async updateHearing(id: number, hearingData: Partial<Hearing>): Promise<Hearing> {
    const [hearing] = await db
      .update(hearings)
      .set(hearingData)
      .where(eq(hearings.id, id))
      .returning();
    return hearing;
  }

  async seedData(): Promise<void> {
    // Create users
    const sampleUsers = [
      // Citizens
      { role: "citizen", cnicOrBarIdOrJudgeCode: "12345-6789012-3", name: "Ahmad Ali Khan", phone: "+92-300-1234567" },
      { role: "citizen", cnicOrBarIdOrJudgeCode: "23456-7890123-4", name: "Fatima Sheikh", phone: "+92-301-2345678" },
      { role: "citizen", cnicOrBarIdOrJudgeCode: "34567-8901234-5", name: "Muhammad Hassan", phone: "+92-302-3456789" },
      
      // Advocates
      { role: "advocate", cnicOrBarIdOrJudgeCode: "ADV-001", name: "Barrister Fatima Sheikh", phone: "+92-321-1111111", username: "fatima.sheikh", password: "password123" },
      { role: "advocate", cnicOrBarIdOrJudgeCode: "ADV-002", name: "Advocate Tariq Mahmood", phone: "+92-322-2222222", username: "tariq.mahmood", password: "password123" },
      
      // Judges
      { role: "judge", cnicOrBarIdOrJudgeCode: "JDG-001", name: "Hon. Justice Sarah Khan", phone: "+92-333-3333333", username: "sarah.khan", password: "password123" },
      
      // Clerks
      { role: "clerk", cnicOrBarIdOrJudgeCode: "CLK-001", name: "Court Clerk Ali Ahmed", phone: "+92-344-4444444", username: "ali.ahmed", password: "password123" },
    ];

    const createdUsers = [];
    for (const userData of sampleUsers) {
      try {
        const user = await this.createUser(userData);
        createdUsers.push(user);
      } catch (error) {
        // User might already exist, skip
        const existingUser = await this.getUserByCredentials(userData.cnicOrBarIdOrJudgeCode, userData.role);
        if (existingUser) {
          createdUsers.push(existingUser);
        }
      }
    }

    // Create sample cases
    const sampleCases = [
      {
        title: "Property Dispute - Ahmed vs. Khan",
        type: "property",
        status: "in-hearing",
        filedBy: createdUsers[0].id,
        assignedJudge: createdUsers[5].id,
        nextHearing: new Date("2024-03-20T10:00:00Z"),
        summary: "Property ownership dispute regarding Plot No. 123, Block A, DHA Phase 2. Plaintiff claims rightful ownership through original purchase agreement dated 2010.",
        court: "District Court Lahore"
      },
      {
        title: "State vs. Rahman - Criminal Case",
        type: "criminal",
        status: "pending",
        filedBy: createdUsers[6].id,
        assignedJudge: createdUsers[5].id,
        nextHearing: new Date("2024-03-22T14:00:00Z"),
        summary: "Criminal case involving theft charges with witness testimonies and forensic evidence.",
        court: "Sessions Court"
      },
      {
        title: "Child Custody Case - Family Matter",
        type: "family",
        status: "filed",
        filedBy: createdUsers[1].id,
        assignedJudge: createdUsers[5].id,
        nextHearing: new Date("2024-03-25T11:00:00Z"),
        summary: "Child custody dispute following divorce proceedings.",
        court: "Family Court"
      },
      {
        title: "Corporate Contract Dispute",
        type: "corporate",
        status: "decided",
        filedBy: createdUsers[2].id,
        assignedJudge: createdUsers[5].id,
        summary: "Contract breach case between two companies regarding service delivery.",
        court: "Commercial Court"
      },
      {
        title: "Tax Assessment Appeal",
        type: "tax",
        status: "pending",
        filedBy: createdUsers[0].id,
        assignedJudge: createdUsers[5].id,
        nextHearing: new Date("2024-03-28T09:00:00Z"),
        summary: "Appeal against tax assessment by revenue authorities.",
        court: "Tax Tribunal"
      }
    ];

    const createdCases = [];
    for (const caseData of sampleCases) {
      try {
        const case_ = await this.createCase(caseData);
        createdCases.push(case_);
      } catch (error) {
        // Case might already exist, skip
      }
    }

    // Create sample evidence
    if (createdCases.length > 0) {
      const sampleEvidence = [
        {
          caseId: createdCases[0].id,
          filename: "Property_Deed_Original.pdf",
          hash: "sha256:abcd1234efgh5678",
          uploadedBy: createdUsers[3].id,
          evidenceType: "document",
          verified: true
        },
        {
          caseId: createdCases[0].id,
          filename: "Property_Photos.zip",
          hash: "sha256:ijkl9012mnop3456",
          uploadedBy: createdUsers[0].id,
          evidenceType: "image",
          verified: false
        }
      ];

      for (const evidenceData of sampleEvidence) {
        try {
          await this.createEvidence(evidenceData);
        } catch (error) {
          // Evidence might already exist, skip
        }
      }

      // Create comprehensive hearing timelines based on case types
      const sampleHearings = [];
      
      // Property Dispute Case (Case 0) - Complex timeline
      if (createdCases[0]) {
        sampleHearings.push(
          {
            caseId: createdCases[0].id,
            dateTime: new Date("2024-01-15T10:00:00Z"),
            location: "Court Room 3",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[0].id,
            remarks: "Case filing and preliminary hearing - Documents verified"
          },
          {
            caseId: createdCases[0].id,
            dateTime: new Date("2024-02-10T14:00:00Z"),
            location: "Court Room 3",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[0].id,
            remarks: "Evidence presentation - Property surveys and ownership documents"
          },
          {
            caseId: createdCases[0].id,
            dateTime: new Date("2024-03-05T11:00:00Z"),
            location: "Court Room 3",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[0].id,
            remarks: "Witness testimonies - Neighbors and property experts"
          },
          {
            caseId: createdCases[0].id,
            dateTime: new Date("2024-03-28T09:30:00Z"),
            location: "Court Room 3",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[0].id,
            remarks: "Final arguments and judgment reserved"
          }
        );
      }
      
      // Criminal Case (Case 1) - Urgent timeline
      if (createdCases[1]) {
        sampleHearings.push(
          {
            caseId: createdCases[1].id,
            dateTime: new Date("2024-01-20T09:00:00Z"),
            location: "Court Room 1",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[1].id,
            remarks: "First production - Charges read, bail application"
          },
          {
            caseId: createdCases[1].id,
            dateTime: new Date("2024-02-15T10:30:00Z"),
            location: "Court Room 1",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[1].id,
            remarks: "Evidence recording - Forensic reports and CCTV footage"
          },
          {
            caseId: createdCases[1].id,
            dateTime: new Date("2024-03-12T11:00:00Z"),
            location: "Court Room 1",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[1].id,
            remarks: "Victim and witness examination - Cross-examination"
          },
          {
            caseId: createdCases[1].id,
            dateTime: new Date("2024-04-02T14:00:00Z"),
            location: "Court Room 1",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[1].id,
            remarks: "Defense arguments and prosecution rebuttal"
          }
        );
      }
      
      // Family Case (Case 2) - Sensitive timeline
      if (createdCases[2]) {
        sampleHearings.push(
          {
            caseId: createdCases[2].id,
            dateTime: new Date("2024-02-01T15:00:00Z"),
            location: "Family Court Room",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[2].id,
            remarks: "Initial custody hearing - Best interest of child assessment"
          },
          {
            caseId: createdCases[2].id,
            dateTime: new Date("2024-02-25T16:00:00Z"),
            location: "Family Court Room",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[2].id,
            remarks: "Social worker reports and psychological evaluation"
          },
          {
            caseId: createdCases[2].id,
            dateTime: new Date("2024-03-25T11:00:00Z"),
            location: "Family Court Room",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[2].id,
            remarks: "Final custody determination hearing"
          }
        );
      }
      
      // Corporate Case (Case 3) - Commercial timeline
      if (createdCases[3]) {
        sampleHearings.push(
          {
            caseId: createdCases[3].id,
            dateTime: new Date("2024-01-10T10:00:00Z"),
            location: "Commercial Court",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[3].id,
            remarks: "Contract dispute - Initial pleadings and discovery orders"
          },
          {
            caseId: createdCases[3].id,
            dateTime: new Date("2024-02-20T13:00:00Z"),
            location: "Commercial Court",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[3].id,
            remarks: "Expert testimony on contract terms and damages"
          },
          {
            caseId: createdCases[3].id,
            dateTime: new Date("2024-03-15T14:30:00Z"),
            location: "Commercial Court",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[3].id,
            remarks: "Final judgment - Contract breach confirmed, damages awarded"
          }
        );
      }
      
      // Tax Case (Case 4) - Administrative timeline
      if (createdCases[4]) {
        sampleHearings.push(
          {
            caseId: createdCases[4].id,
            dateTime: new Date("2024-02-05T09:00:00Z"),
            location: "Tax Tribunal",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[4].id,
            remarks: "Appeal hearing - Tax assessment challenge filed"
          },
          {
            caseId: createdCases[4].id,
            dateTime: new Date("2024-03-01T10:30:00Z"),
            location: "Tax Tribunal",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[4].id,
            remarks: "Revenue authority response - Documentation review"
          },
          {
            caseId: createdCases[4].id,
            dateTime: new Date("2024-03-28T09:00:00Z"),
            location: "Tax Tribunal",
            videoUrl: "https://meet.jit.si/JudicialHearing-" + createdCases[4].id,
            remarks: "Final hearing - Appeal decision pending"
          }
        );
      }

      for (const hearingData of sampleHearings) {
        try {
          await this.createHearing(hearingData);
        } catch (error) {
          // Hearing might already exist, skip
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
