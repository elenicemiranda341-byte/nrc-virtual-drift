import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  uid: text('uid').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const championshipSettings = pgTable('championship_settings', {
  id: integer('id').primaryKey(),
  isOpen: boolean('is_open').notNull().default(true),
  totalMaxSpots: integer('total_max_spots').notNull().default(32),
  proMaxSpots: integer('pro_max_spots').notNull().default(16),
  streetMaxSpots: integer('street_max_spots').notNull().default(16),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  pilotName: text('pilot_name').notNull(),
  nickname: text('nickname').notNull(),
  nicknameNormalized: text('nickname_normalized').notNull().unique(),
  frLegendsId: text('fr_legends_id').notNull(),
  frLegendsIdNormalized: text('fr_legends_id_normalized').notNull().unique(),
  carModel: text('car_model').notNull().default('Não informado'),
  category: text('category').notNull(),
  track: text('track').notNull(),
  userUid: text('user_uid').references(() => users.uid),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  registrations: many(registrations),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  user: one(users, {
    fields: [registrations.userUid],
    references: [users.uid],
  }),
}));
