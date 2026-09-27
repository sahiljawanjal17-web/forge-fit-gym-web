import { pgTable, uuid, varchar, text, timestamp, jsonb, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { modelTypeEnum, modelStatusEnum } from './enums';
import { users } from './users';
import { products } from './products';

export const aiModels = pgTable('ai_models', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: modelTypeEnum('type').notNull(),
  version: varchar('version', { length: 50 }).notNull(),
  status: modelStatusEnum('status').default('training').notNull(),
  hyperparameters: jsonb('hyperparameters'),
  metrics: jsonb('metrics'),
  trainedAt: timestamp('trained_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const aiPredictions = pgTable('ai_predictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  modelId: uuid('model_id').references(() => aiModels.id, { onDelete: 'cascade' }).notNull(),
  targetUserId: uuid('target_user_id').references(() => users.id),
  targetProductId: uuid('target_product_id').references(() => products.id),
  predictionValue: numeric('prediction_value', { precision: 10, scale: 4 }),
  predictionMetadata: jsonb('prediction_metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const analyticsSalesCache = pgTable('analytics_sales_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  totalSales: numeric('total_sales', { precision: 15, scale: 2 }).notNull(),
  totalOrders: numeric('total_orders').notNull(),
  categoryBreakdown: jsonb('category_breakdown'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const aiModelsRelations = relations(aiModels, ({ many }) => ({
  predictions: many(aiPredictions),
}));
