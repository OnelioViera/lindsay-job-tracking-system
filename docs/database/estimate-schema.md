# Estimate Schema

## Overview

The Estimate collection stores cost calculations, structure specifications, and items to purchase for each job. Multiple versions can exist for revision tracking.

## Schema Definition

### Mongoose Model

```typescript
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
  
  createdAt: Date;
  updatedAt: Date;
}

const structureSchema = new Schema<IStructure>({
  structureType: {
    type: String,
    required: true,
    enum: [
      'Sanitary Manhole',
      'Wet Well',
      'Box Space Manhole',
      'Vault',
      'Miter Pit',
      'Air Vacuum Vault',
      'Custom',
    ],
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
    diameter: { type: Number },
    height: { type: Number },
    wallThickness: { type: Number },
    riserHeight: { type: Number },
    shipLapJoint: { type: Boolean, default: false },
    customDetails: { type: String, maxlength: 1000 },
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
    enum: ['Rebar', 'Access Lids', 'Hatches', 'Hardware', 'Concrete', 'Steel', 'Other'],
  },
  supplier: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
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
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'submitted', 'approved', 'revised'],
      default: 'draft',
    },
    structures: {
      type: [structureSchema],
      default: [],
      validate: {
        validator: function(v: IStructure[]) {
          return v.length > 0;
        },
        message: 'At least one structure is required',
      },
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
  },
  {
    timestamps: true,
  }
);

// Compound index for finding latest version
estimateSchema.index({ jobId: 1, version: -1 });

// Calculate total cost before saving
estimateSchema.pre('save', function (next) {
  // Calculate material cost from structures
  const structureCost = this.structures.reduce((sum, s) => sum + s.totalCost, 0);
  const itemsCost = this.itemsToPurchase.reduce((sum, i) => sum + i.totalCost, 0);
  
  this.materialCost = structureCost + itemsCost;
  
  // Calculate total cost
  this.totalCost = 
    this.laborCost + 
    this.materialCost + 
    this.equipmentCost + 
    this.overheadCost;
  
  // Calculate quoted price with profit margin
  this.quotedPrice = this.totalCost * (1 + this.profitMargin / 100);
  
  next();
});

// Virtual for populated job
estimateSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for populated estimator
estimateSchema.virtual('estimator', {
  ref: 'User',
  localField: 'estimatorId',
  foreignField: '_id',
  justOne: true,
});

// Enable virtuals in JSON
estimateSchema.set('toJSON', { virtuals: true });
estimateSchema.set('toObject', { virtuals: true });

export const Estimate = mongoose.models.Estimate || mongoose.model<IEstimate>('Estimate', estimateSchema);
```

## Zod Validation Schema

```typescript
import { z } from 'zod';

const structureSchema = z.object({
  structureType: z.enum([
    'Sanitary Manhole',
    'Wet Well',
    'Box Space Manhole',
    'Vault',
    'Miter Pit',
    'Air Vacuum Vault',
    'Custom',
  ]),
  description: z.string().min(1).max(500),
  quantity: z.number().int().min(1),
  unitCost: z.number().min(0),
  totalCost: z.number().min(0),
  specifications: z.object({
    diameter: z.number().positive().optional(),
    height: z.number().positive().optional(),
    wallThickness: z.number().positive().optional(),
    riserHeight: z.number().positive().optional(),
    shipLapJoint: z.boolean().optional(),
    customDetails: z.string().max(1000).optional(),
  }).optional(),
});

const itemToPurchaseSchema = z.object({
  itemName: z.string().min(1).max(200),
  category: z.enum(['Rebar', 'Access Lids', 'Hatches', 'Hardware', 'Concrete', 'Steel', 'Other']),
  supplier: z.string().max(200).optional(),
  quantity: z.number().min(0),
  unitCost: z.number().min(0),
  totalCost: z.number().min(0),
  inventoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  needsOrdering: z.boolean().default(true),
});

export const estimateCreateSchema = z.object({
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  estimatorId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  structures: z.array(structureSchema).min(1, 'At least one structure required'),
  itemsToPurchase: z.array(itemToPurchaseSchema).default([]),
  laborCost: z.number().min(0).default(0),
  equipmentCost: z.number().min(0).default(0),
  overheadCost: z.number().min(0).default(0),
  profitMargin: z.number().min(0).max(100).default(30),
  notes: z.string().max(2000).optional(),
});

export const estimateUpdateSchema = estimateCreateSchema.partial();

export type EstimateCreateInput = z.infer<typeof estimateCreateSchema>;
export type EstimateUpdateInput = z.infer<typeof estimateUpdateSchema>;
```

## Field Descriptions

### Main Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `jobId` | ObjectId | Yes | Reference to Job |
| `version` | Number | Yes | Version number (1, 2, 3...) |
| `estimatorId` | ObjectId | Yes | Reference to User |
| `status` | String | Yes | draft, submitted, approved, revised |
| `structures` | Array | Yes | Array of structure objects |
| `itemsToPurchase` | Array | No | Array of items to order |
| `laborCost` | Number | Yes | Labor cost in dollars |
| `materialCost` | Number | Yes | Auto-calculated from structures |
| `equipmentCost` | Number | Yes | Equipment cost in dollars |
| `overheadCost` | Number | Yes | Overhead cost in dollars |
| `profitMargin` | Number | Yes | Profit margin percentage |
| `totalCost` | Number | Yes | Auto-calculated total |
| `quotedPrice` | Number | Yes | Auto-calculated with margin |
| `attachments` | Array | No | URLs to supporting documents |
| `notes` | String | No | General notes |
| `revisionReason` | String | No | Why this revision was created |

### Structure Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `structureType` | String | Yes | Type of precast structure |
| `description` | String | Yes | Detailed description |
| `quantity` | Number | Yes | Number of units |
| `unitCost` | Number | Yes | Cost per unit |
| `totalCost` | Number | Yes | quantity × unitCost |
| `specifications` | Object | No | Technical specifications |
| `specifications.diameter` | Number | No | Diameter in inches |
| `specifications.height` | Number | No | Height in inches |
| `specifications.wallThickness` | Number | No | Wall thickness in inches |
| `specifications.riserHeight` | Number | No | Riser height in inches |
| `specifications.shipLapJoint` | Boolean | No | Has ship lap joint |
| `specifications.customDetails` | String | No | Custom specifications |

### Item to Purchase Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `itemName` | String | Yes | Name of item |
| `category` | String | Yes | Category (Rebar, Lids, etc.) |
| `supplier` | String | No | Preferred supplier |
| `quantity` | Number | Yes | Quantity needed |
| `unitCost` | Number | Yes | Cost per unit |
| `totalCost` | Number | Yes | quantity × unitCost |
| `inventoryId` | ObjectId | No | Link to inventory if stocked |
| `needsOrdering` | Boolean | Yes | True if needs to be ordered |

## Structure Types

Lindsay Precast specializes in:

1. **Sanitary Manhole** - Standard sewer manholes
2. **Wet Well** - Water collection chambers (e.g., 72" ID)
3. **Box Space Manhole** - Large access manholes
4. **Vault** - Storage vaults
5. **Miter Pit** - Directional change structures
6. **Air Vacuum Vault** - Vacuum release structures
7. **Custom** - Special designs

## Item Categories

1. **Rebar** - Reinforcement bars
2. **Access Lids** - Manhole covers and lids
3. **Hatches** - Access hatches
4. **Hardware** - Bolts, fasteners, etc.
5. **Concrete** - Concrete mix
6. **Steel** - Steel components
7. **Other** - Miscellaneous items

## Cost Calculations

### Material Cost (Auto-calculated)
```typescript
materialCost = sum(structures.totalCost) + sum(itemsToPurchase.totalCost)
```

### Total Cost (Auto-calculated)
```typescript
totalCost = laborCost + materialCost + equipmentCost + overheadCost
```

### Quoted Price (Auto-calculated)
```typescript
quotedPrice = totalCost × (1 + profitMargin / 100)
```

**Example**:
- Total Cost: $45,000
- Profit Margin: 30%
- Quoted Price: $45,000 × 1.30 = $58,500

## Versioning

Each revision creates a new estimate document with incremented version:

```typescript
// Get latest version
const latestEstimate = await Estimate
  .findOne({ jobId })
  .sort({ version: -1 });

// Create new version
const newEstimate = new Estimate({
  jobId,
  version: latestEstimate ? latestEstimate.version + 1 : 1,
  // ... other fields
});
```

## Queries

### Get latest estimate for job
```typescript
const estimate = await Estimate
  .findOne({ jobId: jobId })
  .sort({ version: -1 })
  .populate('estimator', 'name email');
```

### Get all estimates for job (history)
```typescript
const estimates = await Estimate
  .find({ jobId: jobId })
  .sort({ version: -1 })
  .populate('estimator', 'name');
```

### Get estimates by estimator
```typescript
const estimates = await Estimate
  .find({ estimatorId: userId })
  .populate('job', 'jobNumber jobName')
  .sort({ createdAt: -1 });
```

### Get approved estimates
```typescript
const approvedEstimates = await Estimate
  .find({ status: 'approved' })
  .populate('job customer');
```

## Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "jobId": "507f191e810c19729de860ea",
  "version": 2,
  "estimatorId": "507f191e810c19729de860eb",
  "status": "approved",
  "structures": [
    {
      "structureType": "Wet Well",
      "description": "72\" ID Wet Well with 60\" riser height",
      "quantity": 1,
      "unitCost": 35000,
      "totalCost": 35000,
      "specifications": {
        "diameter": 72,
        "height": 120,
        "wallThickness": 6,
        "riserHeight": 60,
        "shipLapJoint": true,
        "customDetails": "Reduced from 84\" per customer request"
      }
    }
  ],
  "itemsToPurchase": [
    {
      "itemName": "Rebar #5",
      "category": "Rebar",
      "supplier": "Colorado Steel Supply",
      "quantity": 500,
      "unitCost": 15,
      "totalCost": 7500,
      "needsOrdering": true
    },
    {
      "itemName": "Access Lid 24\"",
      "category": "Access Lids",
      "quantity": 2,
      "unitCost": 450,
      "totalCost": 900,
      "inventoryId": "507f191e810c19729de860ff",
      "needsOrdering": false
    }
  ],
  "laborCost": 8000,
  "materialCost": 43400,
  "equipmentCost": 2000,
  "overheadCost": 1600,
  "profitMargin": 30,
  "totalCost": 55000,
  "quotedPrice": 71500,
  "notes": "Revised per customer request to reduce diameter",
  "revisionReason": "Customer requested 72\" instead of 84\"",
  "createdAt": "2024-10-28T10:30:00.000Z",
  "updatedAt": "2024-10-28T10:30:00.000Z"
}
```

## Best Practices

1. **Always create new version for revisions**: Don't modify existing estimates
   
2. **Calculate costs on save**: Use pre-save middleware
   
3. **Link inventory items**: Connect itemsToPurchase to inventory when possible
   
4. **Document revisions**: Always include revisionReason for version > 1
   
5. **Validate quantities**: Ensure all quantities and costs are positive
   
6. **Track what needs ordering**: Use needsOrdering flag for procurement

7. **Update job when estimate approved**:
   ```typescript
   if (estimate.status === 'approved') {
     await Job.findByIdAndUpdate(jobId, {
       estimateDate: new Date(),
       currentPhase: 'drafting'
     });
   }
   ```

## Related Collections

- **jobs**: Foreign key `jobId`
- **users**: Foreign key `estimatorId`
- **inventory**: Foreign key `inventoryId` in itemsToPurchase
- **drawings**: Next phase after estimate approval
