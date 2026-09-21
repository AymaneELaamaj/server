import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Category id must be valid");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must contain at least 2 characters")
  .max(80, "Name must contain at most 80 characters");

const descriptionSchema = z
  .string()
  .trim()
  .max(500, "Description must contain at most 500 characters")
  .optional();

export const createCategorySchema = z.object({
  body: z.object({
    name: nameSchema,
    description: descriptionSchema,
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      description: descriptionSchema,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});
