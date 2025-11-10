import mongoose, { Schema, Document } from 'mongoose';

interface IStructure {
  structureType: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  specifications: {
    diameter?: number;
    height?: number;
    wallThickness?: number;
    riserHeight?: number;
    shipLapJoint?: boolean;
    customDetails?: string;
  };
}

interface IItemToPurchase {
  itemName: string;
  category: string;
  supplier?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  inventoryId?: mongoose.Types.ObjectId;
  needsOrdering: boolean;
}

export interface IEstimate extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  version: number;
  estimatorId: mongoose.Types.ObjectId;
  status: 'draft' | 'submitted' | 'approved' | 'revised';
  
  structures: IStructure[];
  itemsToPurchase: IItemToPurchase[];
  
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  overheadCost: number;
  profitMargin: number;
  totalCost: number;
  quotedPrice: number;
  
  attachments?: string[];
  notes?: string;
  revisionReason?: string;
  
  // New fields for PM assignment
  assignedPMId?: mongoose.Types.ObjectId;
  assignedDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const structureSchema = new Schema<IStructure>({
  structureType: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  specifications: {
    diameter: Number,
    height: Number,
    wallThickness: Number,
    riserHeight: Number,
    shipLapJoint: Boolean,
    customDetails: String,
  },
}, { _id: false });

const itemToPurchaseSchema = new Schema<IItemToPurchase>({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  supplier: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  inventoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Inventory',
  },
  needsOrdering: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const estimateSchema = new Schema<IEstimate>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    estimatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'submitted', 'approved', 'revised'],
      default: 'draft',
      index: true,
    },
    structures: {
      type: [structureSchema],
      default: [],
    },
    itemsToPurchase: {
      type: [itemToPurchaseSchema],
      default: [],
    },
    laborCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    materialCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    equipmentCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    overheadCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    profitMargin: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 30, // 30% default margin
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    quotedPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    attachments: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    revisionReason: {
      type: String,
      maxlength: 500,
    },
    assignedPMId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding latest version
estimateSchema.index({ jobId: 1, version: -1 });

// Calculate total cost before saving
estimateSchema.pre('save', function (next) {
  // Calculate total cost from all components
  this.totalCost = 
    this.laborCost + 
    this.materialCost + 
    this.equipmentCost + 
    this.overheadCost;
  
  // Calculate quoted price with profit margin
  this.quotedPrice = this.totalCost * (1 + this.profitMargin / 100);
  
  next();
});

export const Estimate = mongoose.models.Estimate || mongoose.model<IEstimate>('Estimate', estimateSchema);

