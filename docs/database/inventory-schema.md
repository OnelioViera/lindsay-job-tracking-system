# Inventory Schema

## Overview

The Inventory collection tracks materials and supplies used in production, with automatic reorder alerts.

## Schema Definition

```typescript
import mongoose, { Schema, Document } from 'mongoose';

interface IUsageHistory {
  date: Date;
  quantity: number;
  jobId?: mongoose.Types.ObjectId;
  type: 'usage' | 'restock' | 'adjustment';
  notes?: string;
}

export interface IInventory extends Document {
  itemName: string;
  category: string;
  sku?: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  lastPurchasePrice?: number;
  lastPurchaseDate?: Date;
  preferredSupplier?: string;
  supplierSKU?: string;
  warehouseLocation?: string;
  usageHistory: IUsageHistory[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const usageHistorySchema = new Schema<IUsageHistory>({
  date: { type: Date, required: true, default: Date.now },
  quantity: { type: Number, required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  type: { 
    type: String, 
    required: true,
    enum: ['usage', 'restock', 'adjustment']
  },
  notes: { type: String, maxlength: 500 },
}, { _id: false });

const inventorySchema = new Schema<IInventory>(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Rebar', 'Access Lids', 'Hatches', 'Hardware', 'Concrete', 'Steel', 'Other'],
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ['pieces', 'tons', 'linear feet', 'cubic yards', 'pounds', 'each'],
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    lastPurchasePrice: Number,
    lastPurchaseDate: Date,
    preferredSupplier: String,
    supplierSKU: String,
    warehouseLocation: String,
    usageHistory: {
      type: [usageHistorySchema],
      default: [],
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
inventorySchema.index({ currentStock: 1, reorderLevel: 1 }); // For low stock queries

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'out_of_stock';
  if (this.currentStock <= this.reorderLevel) return 'low';
  if (this.currentStock <= this.reorderLevel * 1.5) return 'medium';
  return 'good';
});

// Virtual for needs reorder
inventorySchema.virtual('needsReorder').get(function() {
  return this.currentStock <= this.reorderLevel;
});

// Method to adjust stock
inventorySchema.methods.adjustStock = function(
  quantity: number,
  type: 'usage' | 'restock' | 'adjustment',
  jobId?: mongoose.Types.ObjectId,
  notes?: string
) {
  this.currentStock += quantity;
  this.usageHistory.push({
    date: new Date(),
    quantity,
    jobId,
    type,
    notes,
  });
  return this.save();
};

// Enable virtuals in JSON
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

export const Inventory = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', inventorySchema);
```

## Zod Validation

```typescript
import { z } from 'zod';

export const inventoryCreateSchema = z.object({
  itemName: z.string().min(1).max(200),
  category: z.enum(['Rebar', 'Access Lids', 'Hatches', 'Hardware', 'Concrete', 'Steel', 'Other']),
  sku: z.string().max(50).optional(),
  currentStock: z.number().min(0).default(0),
  unit: z.enum(['pieces', 'tons', 'linear feet', 'cubic yards', 'pounds', 'each']),
  reorderLevel: z.number().min(0),
  reorderQuantity: z.number().min(1),
  unitCost: z.number().min(0),
  preferredSupplier: z.string().max(200).optional(),
  supplierSKU: z.string().max(100).optional(),
  warehouseLocation: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const inventoryAdjustSchema = z.object({
  quantity: z.number(), // Can be negative for usage
  type: z.enum(['usage', 'restock', 'adjustment']),
  jobId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  notes: z.string().max(500).optional(),
});
```

## Key Queries

### Get low stock items
```typescript
const lowStockItems = await Inventory.find({
  $expr: { $lte: ['$currentStock', '$reorderLevel'] }
}).sort({ currentStock: 1 });
```

### Get items by category
```typescript
const rebarItems = await Inventory.find({ 
  category: 'Rebar' 
}).sort({ itemName: 1 });
```

### Adjust stock after job usage
```typescript
await inventory.adjustStock(
  -50,  // negative for usage
  'usage',
  jobId,
  'Used in wet well construction'
);
```

### Restock item
```typescript
await inventory.adjustStock(
  500,  // positive for restock
  'restock',
  undefined,
  'Received from supplier'
);

inventory.lastPurchasePrice = 15.50;
inventory.lastPurchaseDate = new Date();
await inventory.save();
```

## Stock Status Levels

- **out_of_stock**: currentStock = 0
- **low**: currentStock ≤ reorderLevel
- **medium**: currentStock ≤ reorderLevel × 1.5
- **good**: currentStock > reorderLevel × 1.5

## Best Practices

1. **Always use adjustStock method** for stock changes
2. **Track job associations** when possible
3. **Set realistic reorder levels** based on usage patterns
4. **Regular inventory audits** to verify physical stock
5. **Update last purchase info** when restocking

## Related Collections

- **estimates**: Reference inventory items in itemsToPurchase
- **jobs**: Track usage via usageHistory
