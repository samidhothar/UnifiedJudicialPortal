import { pgTable, text, serial, integer, boolean, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 20 }).notNull(), // citizen, advocate, judge, clerk
  cnicOrBarIdOrJudgeCode: varchar("cnic_or_bar_id_or_judge_code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  username: varchar("username", { length: 100 }),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cases table
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // tax, property, family, corporate, criminal
  status: varchar("status", { length: 50 }).notNull().default("filed"), // filed, pending, in-hearing, decided
  filedBy: integer("filed_by").notNull(),
  assignedJudge: integer("assigned_judge"),
  nextHearing: timestamp("next_hearing"),
  createdAt: timestamp("created_at").defaultNow(),
  summary: text("summary"),
  court: varchar("court", { length: 255 }).default("District Court"),
});

// Evidence table
export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  hash: varchar("hash", { length: 64 }).notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  evidenceType: varchar("evidence_type", { length: 100 }).notNull(), // document, image, video, audio
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hearings table
export const hearings = pgTable("hearings", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  dateTime: timestamp("date_time").notNull(),
  location: varchar("location", { length: 255 }),
  videoUrl: varchar("video_url", { length: 500 }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  filedCases: many(cases, { relationName: "filed_by_user" }),
  assignedCases: many(cases, { relationName: "assigned_judge_user" }),
  uploadedEvidence: many(evidence),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  filedByUser: one(users, {
    fields: [cases.filedBy],
    references: [users.id],
    relationName: "filed_by_user",
  }),
  assignedJudgeUser: one(users, {
    fields: [cases.assignedJudge],
    references: [users.id],
    relationName: "assigned_judge_user",
  }),
  evidence: many(evidence),
  hearings: many(hearings),
}));

export const evidenceRelations = relations(evidence, ({ one }) => ({
  case: one(cases, {
    fields: [evidence.caseId],
    references: [cases.id],
  }),
  uploadedByUser: one(users, {
    fields: [evidence.uploadedBy],
    references: [users.id],
  }),
}));

export const hearingsRelations = relations(hearings, ({ one }) => ({
  case: one(cases, {
    fields: [hearings.caseId],
    references: [cases.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
});

export const insertEvidenceSchema = createInsertSchema(evidence).omit({
  id: true,
  createdAt: true,
});

export const insertHearingSchema = createInsertSchema(hearings).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type Hearing = typeof hearings.$inferSelect;
export type InsertHearing = z.infer<typeof insertHearingSchema>;
