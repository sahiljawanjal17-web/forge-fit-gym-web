import { pgTable, uuid, text, timestamp, varchar, index, numeric, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { subscriptionTierEnum, billingCycleEnum, membershipStatusEnum, cancellationReasonEnum } from './enums';

export const facilities = pgTable('facilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  capacity: integer('capacity'),
  address: jsonb('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const membershipPlans = pgTable('membership_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  tier: subscriptionTierEnum('tier').notNull(),
  billingCycle: billingCycleEnum('billing_cycle').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  setupFee: numeric('setup_fee', { precision: 10, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const planFacilities = pgTable('plan_facilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').references(() => membershipPlans.id, { onDelete: 'cascade' }).notNull(),
  facilityId: uuid('facility_id').references(() => facilities.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userMemberships = pgTable('user_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: uuid('plan_id').references(() => membershipPlans.id).notNull(),
  status: membershipStatusEnum('status').default('pending').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  autoRenew: boolean('auto_renew').default(true).notNull(),
  cancellationReason: cancellationReasonEnum('cancellation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userPlanIdx: index('user_memberships_user_plan_idx').on(table.userId, table.planId),
  statusIdx: index('user_memberships_status_idx').on(table.status),
}));

export const membershipHistory = pgTable('membership_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  membershipId: uuid('membership_id').references(() => userMemberships.id, { onDelete: 'cascade' }).notNull(),
  oldStatus: membershipStatusEnum('old_status'),
  newStatus: membershipStatusEnum('new_status').notNull(),
  changedBy: uuid('changed_by').references(() => users.id), // Could be user themselves or an admin
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const facilityCheckIns = pgTable('facility_check_ins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  facilityId: uuid('facility_id').references(() => facilities.id).notNull(),
  checkInTime: timestamp('check_in_time', { withTimezone: true }).defaultNow().notNull(),
  checkOutTime: timestamp('check_out_time', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const membershipRelations = relations(userMemberships, ({ one, many }) => ({
  user: one(users, {
    fields: [userMemberships.userId],
    references: [users.id],
  }),
  plan: one(membershipPlans, {
    fields: [userMemberships.planId],
    references: [membershipPlans.id],
  }),
  history: many(membershipHistory),
}));

export const planRelations = relations(membershipPlans, ({ many }) => ({
  facilities: many(planFacilities),
  memberships: many(userMemberships),
}));

export const facilityRelations = relations(facilities, ({ many }) => ({
  plans: many(planFacilities),
  checkIns: many(facilityCheckIns),
}));
