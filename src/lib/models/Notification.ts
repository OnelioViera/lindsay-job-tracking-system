import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'job_assigned' | 'job_updated' | 'job_deleted' | 'job_completed' | 'customer_created' | 'job_created' | 'quote_created' | 'quote_assigned' | 'role_updated' | 'permissions_updated';
  title: string;
  message: string;
  jobId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  estimateId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['job_assigned', 'job_updated', 'job_deleted', 'job_completed', 'customer_created', 'job_created', 'quote_created', 'quote_assigned', 'role_updated', 'permissions_updated'],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      index: true,
    },
    estimateId: {
      type: Schema.Types.ObjectId,
      ref: 'Estimate',
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', notificationSchema);

