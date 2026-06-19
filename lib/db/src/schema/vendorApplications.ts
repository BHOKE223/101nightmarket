import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendorApplicationsTable = pgTable("vendor_applications", {
  id: serial("id").primaryKey(),

  businessName: text("business_name").notNull(),
  contactFirstName: text("contact_first_name").notNull(),
  contactLastName: text("contact_last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),

  location: text("location").notNull(),
  hollywoodWhySelected: text("hollywood_why_selected"),
  generalCategory: text("general_category").notNull(),
  categoryDetails: text("category_details").notNull(),
  boothType: text("booth_type").notNull(),

  businessDescription: text("business_description").notNull(),
  menuItems: text("menu_items"),
  photoUrls: text("photo_urls"),
  instagramUrl: text("instagram_url"),
  instagramFollowerCount: text("instagram_follower_count"),

  hasGenerator: boolean("has_generator"),
  hasParticipatedBefore: boolean("has_participated_before"),
  spaceRequirements: text("space_requirements"),
  preferredStartDate: text("preferred_start_date"),
  availableDays: text("available_days"),

  howHeard: text("how_heard"),
  agreedToRules: boolean("agreed_to_rules").notNull().default(false),

  status: text("status").notNull().default("pending_review"),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  rejectionReason: text("rejection_reason"),
  bookingToken: text("booking_token").unique(),
  bookingTokenExpiresAt: timestamp("booking_token_expires_at"),
  notifiedAt: timestamp("notified_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVendorApplicationSchema = createInsertSchema(vendorApplicationsTable)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVendorApplication = z.infer<typeof insertVendorApplicationSchema>;
export type VendorApplication = typeof vendorApplicationsTable.$inferSelect;
