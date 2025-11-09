import { z } from 'zod';

export const customerCreateSchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  name: z.string().max(200).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.object({
    street: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    zip: z.string().nullable().optional(),
  }).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;

export const customerUpdateSchema = customerCreateSchema.partial();

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;

