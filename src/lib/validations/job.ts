import { z } from 'zod';

export const jobCreateSchema = z.object({
  jobName: z
    .string()
    .min(1, 'Job name is required')
    .max(200, 'Job name must be less than 200 characters'),
  jobNumber: z
    .string()
    .min(1, 'Job number is required')
    .max(100, 'Job number must be less than 100 characters'),
  customerId: z
    .string()
    .min(1, 'Customer is required'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  quotedAmount: z
    .number()
    .min(0, 'Quoted amount must be 0 or greater')
    .optional(),
  quotePdfUrl: z
    .string()
    .optional(),
  estimatorId: z.string().optional(),
  drafterId: z.string().optional(),
  projectManagerId: z.string().optional(),
  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .nullable()
    .optional(),
  tags: z.array(z.string()).optional(),
});

export type JobCreateInput = z.infer<typeof jobCreateSchema>;

export const jobUpdateSchema = jobCreateSchema.partial();

export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;

export const jobStatusUpdateSchema = z.object({
  status: z.enum([
    'Estimation',
    'Drafting',
    'PM Review',
    'Submitted',
    'Under Revision',
    'Accepted',
    'In Production',
    'Delivered',
  ]),
  currentPhase: z.enum([
    'estimation',
    'drafting',
    'pm_review',
    'submitted',
    'revision',
    'accepted',
    'production',
    'delivered',
  ]),
});

export type JobStatusUpdateInput = z.infer<typeof jobStatusUpdateSchema>;

