import * as pg from "./pg";

export const usersTable = pg.usersTable;
export const sessionsTable = pg.sessionsTable;
export const itemsTable = pg.itemsTable;
export const itemImagesTable = pg.itemImagesTable;
export const ordersTable = pg.ordersTable;
export const orderEventsTable = pg.orderEventsTable;
export const conversationsTable = pg.conversationsTable;
export const messagesTable = pg.messagesTable;
export const likesTable = pg.likesTable;
export const reviewsTable = pg.reviewsTable;
export const rateLimitsTable = pg.rateLimitsTable;
export const authTokensTable = pg.authTokensTable;
export const notificationsTable = pg.notificationsTable;
export const walletsTable = pg.walletsTable;
export const walletWithdrawalsTable = pg.walletWithdrawalsTable;
export const supportTicketsTable = pg.supportTicketsTable;
export const conversationReportsTable = pg.conversationReportsTable;

export const insertUserSchema = pg.insertUserSchema;
export const selectUserSchema = pg.selectUserSchema;

export const insertItemSchema = pg.insertItemSchema;
export const selectItemSchema = pg.selectItemSchema;

export const insertOrderSchema = pg.insertOrderSchema;
export const insertOrderEventSchema = pg.insertOrderEventSchema;

export const insertConversationSchema = pg.insertConversationSchema;
export const insertMessageSchema = pg.insertMessageSchema;

export const drizzleSchemaBundle = {
  usersTable,
  sessionsTable,
  itemsTable,
  itemImagesTable,
  ordersTable,
  orderEventsTable,
  conversationsTable,
  messagesTable,
  likesTable,
  reviewsTable,
  rateLimitsTable,
  authTokensTable,
  notificationsTable,
  walletsTable,
  walletWithdrawalsTable,
  supportTicketsTable,
  conversationReportsTable,
};
