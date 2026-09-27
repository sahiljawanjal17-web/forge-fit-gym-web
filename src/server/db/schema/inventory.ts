import { pgTable, uuid, varchar, text, timestamp, integer, boolean, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productVariants } from './products';
import { stockTransactionTypeEnum } from './enums';
import { users } from './users';

export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  contactPerson: varchar('contact_person', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull().unique(),
  quantityAvailable: integer('quantity_available').default(0).notNull(),
  quantityReserved: integer('quantity_reserved').default(0).notNull(),
  reorderLevel: integer('reorder_level').default(0).notNull(),
  reorderQuantity: integer('reorder_quantity').default(0).notNull(),
  supplierId: uuid('supplier_id').references(() => suppliers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const stockHistory = pgTable('stock_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryId: uuid('inventory_id').references(() => inventory.id, { onDelete: 'cascade' }).notNull(),
  transactionType: stockTransactionTypeEnum('transaction_type').notNull(),
  quantityChange: integer('quantity_change').notNull(),
  performedBy: uuid('performed_by').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lowStockAlerts = pgTable('low_stock_alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryId: uuid('inventory_id').references(() => inventory.id, { onDelete: 'cascade' }).notNull(),
  isResolved: boolean('is_resolved').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
  variant: one(productVariants, {
    fields: [inventory.variantId],
    references: [productVariants.id],
  }),
  supplier: one(suppliers, {
    fields: [inventory.supplierId],
    references: [suppliers.id],
  }),
  history: many(stockHistory),
  alerts: many(lowStockAlerts),
}));
