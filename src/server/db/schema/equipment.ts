import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { equipmentConditionEnum, mediaTypeEnum } from './enums';
import { facilities } from './memberships';

export const equipmentCategories = pgTable('equipment_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const gymEquipment = pgTable('gym_equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => equipmentCategories.id),
  facilityId: uuid('facility_id').references(() => facilities.id),
  name: varchar('name', { length: 255 }).notNull(),
  manufacturer: varchar('manufacturer', { length: 255 }),
  model: varchar('model', { length: 255 }),
  serialNumber: varchar('serial_number', { length: 255 }),
  condition: equipmentConditionEnum('condition').default('good').notNull(),
  targetMuscleGroups: text('target_muscle_groups').array(),
  purchaseDate: timestamp('purchase_date', { withTimezone: true }),
  lastMaintenanceDate: timestamp('last_maintenance_date', { withTimezone: true }),
  nextMaintenanceDate: timestamp('next_maintenance_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const equipmentUsageGuides = pgTable('equipment_usage_guides', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentId: uuid('equipment_id').references(() => gymEquipment.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  stepByStepInstructions: jsonb('step_by_step_instructions'),
  safetyWarnings: text('safety_warnings'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const equipmentMedia = pgTable('equipment_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentId: uuid('equipment_id').references(() => gymEquipment.id, { onDelete: 'cascade' }).notNull(),
  mediaType: mediaTypeEnum('media_type').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const gymEquipmentRelations = relations(gymEquipment, ({ one, many }) => ({
  category: one(equipmentCategories, {
    fields: [gymEquipment.categoryId],
    references: [equipmentCategories.id],
  }),
  facility: one(facilities, {
    fields: [gymEquipment.facilityId],
    references: [facilities.id],
  }),
  guides: many(equipmentUsageGuides),
  media: many(equipmentMedia),
}));

export const equipmentUsageGuidesRelations = relations(equipmentUsageGuides, ({ one }) => ({
  equipment: one(gymEquipment, {
    fields: [equipmentUsageGuides.equipmentId],
    references: [gymEquipment.id],
  }),
}));

export const equipmentMediaRelations = relations(equipmentMedia, ({ one }) => ({
  equipment: one(gymEquipment, {
    fields: [equipmentMedia.equipmentId],
    references: [gymEquipment.id],
  }),
}));
