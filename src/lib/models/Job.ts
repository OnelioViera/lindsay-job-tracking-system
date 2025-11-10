import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  jobNumber: string;
  jobName: string;
  customerId: mongoose.Types.ObjectId;
  status:
    | 'Estimation'
    | 'Drafting'
    | 'PM Review'
    | 'Submitted'
    | 'Under Revision'
    | 'Accepted'
    | 'In Production'
    | 'Delivered';
  currentPhase:
    | 'estimation'
    | 'drafting'
    | 'pm_review'
    | 'submitted'
    | 'revision'
    | 'accepted'
    | 'production'
    | 'delivered';

  // Personnel
  estimatorId?: mongoose.Types.ObjectId;
  drafterId?: mongoose.Types.ObjectId;
  projectManagerId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;

  // Dates
  createdDate: Date;
  estimateDate?: Date;
  estimateDueDate?: Date;
  draftStartDate?: Date;
  draftCompletionDate?: Date;
  submissionDate?: Date;
  acceptanceDate?: Date;
  productionStartDate?: Date;
  deliveryDate?: Date;

  // Priority
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Financials
  quotedAmount?: number;
  quotePdfUrl?: string;

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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    estimateDate: Date,
  estimateDueDate: Date,
    draftStartDate: Date,
    draftCompletionDate: Date,
    submissionDate: Date,
    acceptanceDate: Date,
    productionStartDate: Date,
    deliveryDate: Date,
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    quotedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    quotePdfUrl: {
      type: String,
    },
    notes: {
      type: String,
      maxlength: 5000,
    },
    tags: [String],
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ customerId: 1, createdDate: -1 });
jobSchema.index({ status: 1 });
jobSchema.index({ priority: 1 });

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

