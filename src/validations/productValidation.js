import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Id must be valid");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must contain at least 2 characters")
  .max(120, "Name must contain at most 120 characters");

const descriptionSchema = z
  .string()
  .trim()
  .max(1000, "Description must contain at most 1000 characters")
  .optional();

const priceSchema = z.coerce
  .number()
  .min(0, "Price must be greater than or equal to 0");

const stockSchema = z.coerce
  .number()
  .int("Stock must be an integer")
  .min(0, "Stock must be greater than or equal to 0");

const imageUrlSchema = z
  .string()
  .trim()
  .url("Image URL must be valid")
  .optional();

export const createProductSchema = z.object({
  body: z.object({
    name: nameSchema,
    description: descriptionSchema,
    price: priceSchema,
    stock: stockSchema.default(0),
    category: objectIdSchema,
    imageUrl: imageUrlSchema,
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      description: descriptionSchema,
      price: priceSchema.optional(),
      stock: stockSchema.optional(),
      category: objectIdSchema.optional(),
      imageUrl: imageUrlSchema,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});

export const getProductsSchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),
      category: objectIdSchema.optional(),
      minPrice: priceSchema.optional(),
      maxPrice: priceSchema.optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(12),
      sort: z
        .enum(["price_asc", "price_desc", "createdAt_desc", "createdAt_asc"])
        .default("createdAt_desc"),
    })
    .refine(
      (query) =>
        query.minPrice === undefined ||
        query.maxPrice === undefined ||
        query.minPrice <= query.maxPrice,
      {
        message: "minPrice must be less than or equal to maxPrice",
        path: ["minPrice"],
      }
    ),
});
