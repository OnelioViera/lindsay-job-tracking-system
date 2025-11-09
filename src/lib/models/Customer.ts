import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  companyName: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Text search index
customerSchema.index({ name: 'text', companyName: 'text' });

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);

