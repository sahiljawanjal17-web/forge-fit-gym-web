import { pgTable, uuid, varchar, timestamp, numeric, jsonb, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { orders } from './orders';
import { userMemberships } from './memberships';
import { paymentMethodTypeEnum, paymentStatusEnum, paymentGatewayEnum, emiStatusEnum, invoiceStatusEnum, refundStatusEnum } from './enums';

export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: paymentMethodTypeEnum('type').notNull(),
  provider: varchar('provider', { length: 100 }), // e.g., 'stripe', 'paypal'
  providerToken: varchar('provider_token', { length: 255 }),
  lastFour: varchar('last_four', { length: 4 }),
  isDefault: boolean('is_default').default(false).notNull(),
  expiryMonth: numeric('expiry_month'),
  expiryYear: numeric('expiry_year'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const paymentTransactions = pgTable('payment_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  orderId: uuid('order_id').references(() => orders.id),
  membershipId: uuid('membership_id').references(() => userMemberships.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: paymentStatusEnum('status').notNull(),
  gateway: paymentGatewayEnum('gateway').notNull(),
  gatewayTransactionId: varchar('gateway_transaction_id', { length: 255 }),
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const emiPlans = pgTable('emi_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }).notNull(),
  months: numeric('months').notNull(),
  status: emiStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const emiInstallments = pgTable('emi_installments', {
  id: uuid('id').defaultRandom().primaryKey(),
  emiPlanId: uuid('emi_plan_id').references(() => emiPlans.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  transactionId: uuid('transaction_id').references(() => paymentTransactions.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  membershipId: uuid('membership_id').references(() => userMemberships.id),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  url: varchar('url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const paymentRefunds = pgTable('payment_refunds', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => paymentTransactions.id).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  reason: varchar('reason', { length: 255 }),
  status: refundStatusEnum('status').default('pending').notNull(),
  gatewayRefundId: varchar('gateway_refund_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [paymentTransactions.orderId],
    references: [orders.id],
  }),
}));
