# Customer & User Schemas

## Customer Schema

### Overview
Stores client information and contact details.

### Mongoose Model

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  contactPerson?: string;
  notes?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    contactPerson: String,
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
```

### Zod Validation

```typescript
export const customerCreateSchema = z.object({
  name: z.string().min(1).max(200),
  companyName: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2), // Two-letter state code
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  }),
  contactPerson: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});
```

---

## User Schema

### Overview
System users with role-based permissions.

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management |
| **Estimator** | Create/edit estimates, view all jobs |
| **Drafter** | Create/edit drawings, view assigned jobs |
| **Project Manager** | Manage jobs, submit to customers |
| **Production** | View production queue, update status |
| **Inventory Manager** | Manage inventory levels |
| **Viewer** | Read-only access |

### Mongoose Model

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Estimator' | 'Drafter' | 'Project Manager' | 'Production' | 'Inventory Manager' | 'Viewer';
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Estimator', 'Drafter', 'Project Manager', 'Production', 'Inventory Manager', 'Viewer'],
      default: 'Viewer',
    },
    phone: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
```

### Zod Validation

```typescript
export const userCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['Admin', 'Estimator', 'Drafter', 'Project Manager', 'Production', 'Inventory Manager', 'Viewer']),
  phone: z.string().min(10).max(20).optional(),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

### Role Permissions Matrix

```typescript
export const permissions = {
  Admin: ['*'], // All permissions
  Estimator: [
    'jobs:read',
    'jobs:create',
    'jobs:update',
    'estimates:create',
    'estimates:update',
    'customers:read',
  ],
  Drafter: [
    'jobs:read',
    'drawings:create',
    'drawings:update',
    'drawings:handover',
    'estimates:read',
  ],
  'Project Manager': [
    'jobs:read',
    'jobs:update',
    'estimates:read',
    'drawings:read',
    'submittals:create',
    'submittals:update',
  ],
  Production: [
    'jobs:read',
    'production:read',
    'production:update',
    'inventory:read',
  ],
  'Inventory Manager': [
    'inventory:*',
    'jobs:read',
  ],
  Viewer: [
    'jobs:read',
    'estimates:read',
    'inventory:read',
  ],
};
```

## Key Queries

### Find user by email
```typescript
const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
```

### Check permissions
```typescript
function hasPermission(user: IUser, permission: string): boolean {
  const userPermissions = permissions[user.role];
  return userPermissions.includes('*') || userPermissions.includes(permission);
}
```

### Get all active customers
```typescript
const customers = await Customer.find({ 
  deletedAt: null 
}).sort({ companyName: 1 });
```

### Search customers
```typescript
const results = await Customer.find({
  $text: { $search: searchTerm },
  deletedAt: null
});
```

## Best Practices

### Users
1. **Never store plain passwords** - Always hash with bcrypt
2. **Use email as unique identifier** - Lowercase and trim
3. **Track last login** - Update on successful authentication
4. **Disable instead of delete** - Set isActive = false
5. **Require strong passwords** - Minimum 8 characters

### Customers
1. **Validate email format** - Use regex or email validator
2. **Normalize phone numbers** - Strip formatting, store digits
3. **Soft delete** - Use deletedAt instead of removing
4. **Unique company names** - Prevent duplicates
5. **Complete address** - Require all address fields

## Related Collections

### Customer
- **jobs**: Referenced by `customerId` in jobs collection

### User
- **jobs**: Referenced by `estimatorId`, `drafterId`, `projectManagerId`
- **estimates**: Referenced by `estimatorId`
- **drawings**: Referenced by `drafterId`
- **activityLogs**: Track user actions
