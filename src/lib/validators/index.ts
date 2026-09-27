import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  brand: z.string(),
  categoryId: z.string(),
  price: z.number().positive(),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).optional(),
});

export const membershipPlanSchema = z.object({
  name: z.string(),
  tier: z.string(),
  billingCycle: z.enum(["monthly", "yearly"]),
  basePrice: z.number().positive(),
  features: z.array(z.string()),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    variantId: z.string().optional(),
  })),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.string(),
});

export const chatMessageSchema = z.object({
  conversationId: z.string(),
  body: z.string(),
  messageType: z.enum(["text", "image", "system"]),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.string().optional(),
  category: z.string().optional(),
});
