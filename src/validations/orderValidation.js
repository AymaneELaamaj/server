import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Id must be valid");

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          product: objectIdSchema,
          quantity: z.coerce.number().int().min(1),
        })
      )
      .min(1, "Order must contain at least one item"),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
