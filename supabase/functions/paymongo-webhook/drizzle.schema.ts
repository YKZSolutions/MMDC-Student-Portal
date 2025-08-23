import {
  decimal,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const paymentTypeEnum = pgEnum("PaymentType", [
  "card",
  "paymaya",
  "gcash",
  "qrph",
  "manual",
]);

export const BillPayment = pgTable("BillPayment", {
  id: uuid("id").primaryKey(),
  billId: uuid("billId").notNull(),
  installmentId: uuid("installmentId"),

  installmentOrder: integer("installmentOrder").notNull(),
  amountPaid: decimal("amountPaid", { precision: 10, scale: 2 }).notNull(),
  paymentType: paymentTypeEnum("paymentType").notNull(),
  notes: text("notes").notNull(),

  paymongoData: json("paymongoData"),

  paymentDate: timestamp("paymentDate", { mode: "string" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
  deletedAt: timestamp("deletedAt", { mode: "string" }),
});
