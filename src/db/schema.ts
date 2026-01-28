import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================
export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "contract",
  "part_time",
  "freelance",
  "intern",
]);

export const workPolicyEnum = pgEnum("work_policy", [
  "remote",
  "onsite",
  "hybrid",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "interview",
  "test",
  "reject",
  "offer",
  "closed",
  "unresponded",
  "none",
]);

export const stageEnum = pgEnum("stage", [
  "cv_screening",
  "hr_interview",
  "user_interview",
  "technical_test",
  "psikotes",
  "final_interview",
  "offering",
  "rejected",
  "accepted",
  "none",
]);

// ==================== AUTH TABLES (NextAuth) ====================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  password: varchar("password", { length: 255 }), // For credentials auth
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: timestamp("expires_at", { mode: "date" }),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ==================== REFERENCE TABLES ====================
export const platforms = pgTable("platforms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 255 }), // optional icon/logo URL
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ==================== JOB APPLICATIONS ====================
export const jobApplications = pgTable("job_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Company & Position Info
  companyName: varchar("company_name", { length: 255 }),
  position: varchar("position", { length: 255 }).notNull(),

  // Job Details
  jobType: jobTypeEnum("job_type").notNull(),
  workPolicy: workPolicyEnum("work_policy").notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  jobDescription: text("job_description"),

  // Application Info
  appliedDate: timestamp("applied_date", { mode: "date" }).notNull(),
  platformId: uuid("platform_id").references(() => platforms.id, {
    onDelete: "set null",
  }),
  hrContact: varchar("hr_contact", { length: 255 }),

  // Status & Stage
  status: applicationStatusEnum("status").notNull().default("applied"),
  currentStage: stageEnum("current_stage").notNull().default("none"),

  // Links & Documents
  cvLink: text("cv_link"),
  jobLink: text("job_link"),

  // Location
  location: varchar("location", { length: 255 }),
  locationMapLink: text("location_map_link"),

  // Notes
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// ==================== RELATIONS ====================
export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
  platform: one(platforms, {
    fields: [jobApplications.platformId],
    references: [platforms.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  jobApplications: many(jobApplications),
}));

export const platformsRelations = relations(platforms, ({ many }) => ({
  jobApplications: many(jobApplications),
}));
