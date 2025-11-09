# Job Schema

## Overview

The Job collection is the core of the system, representing a complete project from estimation through delivery.

## Schema Definition

### Mongoose Model

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  jobNumber: string;
  jobName: string;
  customerId: mongoose.Types.ObjectId;
  status: 'Estimation' | 'Drafting' | 'PM Review' | 'Submitted' | 'Under Revision' | 'Accepted' | 'In Production' | 'Delivered';
  currentPhase: 'estimation' | 'drafting' | 'pm_review' | 'submitted' | 'revision' | 'accepted' | 'production' | 'delivered';
  
  // Personnel
  estimatorId?: mongoose.Types.ObjectId;
  drafterId?: mongoose.Types.ObjectId;
  projectManagerId?: mongoose.Types.ObjectId;
  
  // Dates
  createdDate: Date;
  estimateDate?: Date;
  draftStartDate?: Date;
  draftCompletionDate?: Date;
  submissionDate?: Date;
  acceptanceDate?: Date;
  productionStartDate?: Date;
  deliveryDate?: Date;
  
  // Priority
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Metadata
  notes?: string;
  tags?: string[];
  
  // Soft delete
  deletedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    jobNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // Format: LP-YYYY-NNN (e.g., LP-2024-001)
    },
    jobName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Estimation',
        'Drafting',
        'PM Review',
        'Submitted',
        'Under Revision',
        'Accepted',
        'In Production',
        'Delivered',
      ],
      default: 'Estimation',
    },
    currentPhase: {
      type: String,
      required: true,
      enum: [
        'estimation',
        'drafting',
        'pm_review',
        'submitted',
        'revision',
        'accepted',
        'production',
        'delivered',
      ],
      default: 'estimation',
      index: true,
    },
    estimatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    drafterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    projectManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    estimateDate: {
      type: Date,
    },
    draftStartDate: {
      type: Date,
    },
    draftCompletionDate: {
      type: Date,
    },
    submissionDate: {
      type: Date,
    },
    acceptanceDate: {
      type: Date,
    },
    productionStartDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    tags: {
      type: [String],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ customerId: 1, createdAt: -1 });
jobSchema.index({ status: 1, priority: 1 });
jobSchema.index({ currentPhase: 1 });
jobSchema.index({ deletedAt: 1 }); // For soft delete queries

// Text search index
jobSchema.index({ jobName: 'text', jobNumber: 'text' });

// Middleware: Generate job number before saving
jobSchema.pre('save', async function (next) {
  if (this.isNew && !this.jobNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Job').countDocuments({
      jobNumber: new RegExp(`^LP-${year}-`),
    });
    this.jobNumber = `LP-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Virtual for populated customer
jobSchema.virtual('customer', {
  ref: 'Customer',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for populated estimator
jobSchema.virtual('estimator', {
  ref: 'User',
  localField: 'estimatorId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for populated drafter
jobSchema.virtual('drafter', {
  ref: 'User',
  localField: 'drafterId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for populated project manager
jobSchema.virtual('projectManager', {
  ref: 'User',
  localField: 'projectManagerId',
  foreignField: '_id',
  justOne: true,
});

// Enable virtuals in JSON
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);
```

## Zod Validation Schema

```typescript
import { z } from 'zod';

export const jobCreateSchema = z.object({
  jobName: z.string().min(1).max(200),
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  estimatorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export const jobUpdateSchema = z.object({
  jobName: z.string().min(1).max(200).optional(),
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  status: z.enum([
    'Estimation',
    'Drafting',
    'PM Review',
    'Submitted',
    'Under Revision',
    'Accepted',
    'In Production',
    'Delivered',
  ]).optional(),
  currentPhase: z.enum([
    'estimation',
    'drafting',
    'pm_review',
    'submitted',
    'revision',
    'accepted',
    'production',
    'delivered',
  ]).optional(),
  estimatorId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  drafterId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  projectManagerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB unique identifier |
| `jobNumber` | String | Yes | Auto-generated (LP-YYYY-NNN) |
| `jobName` | String | Yes | Descriptive name of the job |
| `customerId` | ObjectId | Yes | Reference to Customer |
| `status` | String | Yes | Human-readable status |
| `currentPhase` | String | Yes | Machine-readable phase |
| `estimatorId` | ObjectId | No | Reference to User (estimator) |
| `drafterId` | ObjectId | No | Reference to User (drafter) |
| `projectManagerId` | ObjectId | No | Reference to User (PM) |
| `createdDate` | Date | Yes | When job was created |
| `estimateDate` | Date | No | When estimate was completed |
| `draftStartDate` | Date | No | When drafting began |
| `draftCompletionDate` | Date | No | When drafting completed |
| `submissionDate` | Date | No | When submitted to customer |
| `acceptanceDate` | Date | No | When customer accepted |
| `productionStartDate` | Date | No | When production began |
| `deliveryDate` | Date | No | When delivered |
| `priority` | String | Yes | Job priority level |
| `notes` | String | No | General notes |
| `tags` | Array | No | Custom tags for filtering |
| `deletedAt` | Date | No | Soft delete timestamp |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

## Status vs Phase

### Status (Display)
Human-readable status shown in UI:
- "Estimation"
- "Drafting"
- "PM Review"
- "Submitted"
- "Under Revision"
- "Accepted"
- "In Production"
- "Delivered"

### Current Phase (Logic)
Machine-readable phase for backend logic:
- `estimation`
- `drafting`
- `pm_review`
- `submitted`
- `revision`
- `accepted`
- `production`
- `delivered`

## Job Number Format

**Format**: `LP-YYYY-NNN`
- **LP**: Lindsay Precast prefix
- **YYYY**: 4-digit year
- **NNN**: 3-digit sequential number (zero-padded)

**Examples**:
- `LP-2024-001`
- `LP-2024-042`
- `LP-2025-001`

**Auto-generation**: Pre-save middleware generates number if not provided

## Queries

### Find all active jobs
```typescript
const activeJobs = await Job.find({ 
  deletedAt: null,
  currentPhase: { $nin: ['delivered'] }
})
.populate('customer estimator drafter projectManager')
.sort({ priority: -1, createdAt: -1 });
```

### Find jobs by customer
```typescript
const customerJobs = await Job.find({
  customerId: customerId,
  deletedAt: null
})
.sort({ createdAt: -1 });
```

### Find jobs by status
```typescript
const inProductionJobs = await Job.find({
  currentPhase: 'production',
  deletedAt: null
})
.populate('projectManager');
```

### Find overdue jobs
```typescript
const overdueJobs = await Job.find({
  deliveryDate: { $lt: new Date() },
  currentPhase: { $nin: ['delivered'] },
  deletedAt: null
});
```

### Search jobs by name or number
```typescript
const searchResults = await Job.find({
  $text: { $search: searchTerm },
  deletedAt: null
})
.populate('customer');
```

## Best Practices

1. **Always filter out soft-deleted records**:
   ```typescript
   { deletedAt: null }
   ```

2. **Use population sparingly**: Only populate when needed
   ```typescript
   .populate('customer', 'name companyName') // Only specific fields
   ```

3. **Update phase and status together**:
   ```typescript
   job.currentPhase = 'production';
   job.status = 'In Production';
   job.productionStartDate = new Date();
   ```

4. **Set timestamps when phase changes**:
   ```typescript
   if (newPhase === 'drafting' && !job.draftStartDate) {
     job.draftStartDate = new Date();
   }
   ```

5. **Use transactions for critical updates**:
   ```typescript
   const session = await mongoose.startSession();
   session.startTransaction();
   try {
     await job.save({ session });
     await activityLog.save({ session });
     await session.commitTransaction();
   } catch (error) {
     await session.abortTransaction();
     throw error;
   } finally {
     session.endSession();
   }
   ```

## Related Collections

- **customers**: Foreign key `customerId`
- **users**: Foreign keys `estimatorId`, `drafterId`, `projectManagerId`
- **estimates**: Linked via `jobId` in estimates collection
- **drawings**: Linked via `jobId` in drawings collection
- **submittals**: Linked via `jobId` in submittals collection
- **productionOrders**: Linked via `jobId` in production orders collection
- **deliveries**: Linked via `jobId` in deliveries collection
