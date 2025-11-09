# Quick Setup Guide

## Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Git
- MongoDB Atlas account (free tier)
- Code editor (VS Code or Cursor recommended)

---

## Step 1: Project Initialization

### Create Next.js Project

```bash
npx create-next-app@latest lindsay-precast \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Answer prompts:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ✅ Import alias (@/*)

```bash
cd lindsay-precast
```

---

## Step 2: Install Dependencies

### Core Dependencies

```bash
npm install \
  mongoose \
  next-auth \
  bcryptjs \
  zod \
  zustand \
  @tanstack/react-table \
  date-fns \
  lucide-react
```

### Dev Dependencies

```bash
npm install -D \
  @types/node \
  @types/react \
  @types/react-dom \
  @types/bcryptjs \
  eslint \
  eslint-config-next \
  prettier \
  typescript
```

---

## Step 3: Setup Shadcn UI

### Initialize Shadcn

```bash
npx shadcn-ui@latest init
```

Configuration (select these options):
- Style: Default
- Base color: Slate
- CSS variables: Yes

### Install UI Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
```

---

## Step 4: MongoDB Atlas Setup

### Create Database

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create account
3. Create a new project: "Lindsay Precast"
4. Build a Database → Free (M0)
5. Choose cloud provider and region (closest to you)
6. Cluster Name: "lindsay-precast-cluster"

### Configure Security

1. **Database Access**:
   - Add Database User
   - Username: `lindsayprecast`
   - Password: Generate secure password (save it!)
   - Database User Privileges: Read and write to any database

2. **Network Access**:
   - Add IP Address
   - For development: `0.0.0.0/0` (allow from anywhere)
   - For production: Add specific IPs

### Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy connection string:
   ```
   mongodb+srv://lindsayprecast:<password>@lindsay-precast-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

---

## Step 5: Environment Variables

### Create .env.local

```bash
touch .env.local
```

### Add Environment Variables

```bash
# Database
MONGODB_URI=mongodb+srv://lindsayprecast:<password>@lindsay-precast-cluster.xxxxx.mongodb.net/lindsay-precast?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars-long

# Optional: File Upload (if using S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=lindsay-precast-files
AWS_REGION=us-east-1
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET`

---

## Step 6: Project Structure

### Create Folder Structure

```bash
mkdir -p src/lib/{models,validations,utils}
mkdir -p src/components/{ui,layout,jobs,estimates,inventory}
mkdir -p src/app/api/{auth,jobs,estimates,inventory,customers,users}
mkdir -p src/app/\(dashboard\)/{jobs,estimates,inventory,customers}
mkdir -p src/app/\(auth\)
mkdir -p src/types
```

### File Structure

```
lindsay-precast/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── jobs/
│   │   │   ├── estimates/
│   │   │   ├── inventory/
│   │   │   └── customers/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── jobs/
│   │   │   ├── estimates/
│   │   │   ├── inventory/
│   │   │   └── customers/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/ (Shadcn components)
│   │   ├── layout/
│   │   ├── jobs/
│   │   ├── estimates/
│   │   └── inventory/
│   ├── lib/
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Customer.ts
│   │   │   ├── Job.ts
│   │   │   ├── Estimate.ts
│   │   │   └── Inventory.ts
│   │   ├── validations/
│   │   │   ├── user.ts
│   │   │   ├── job.ts
│   │   │   └── estimate.ts
│   │   ├── utils/
│   │   │   └── permissions.ts
│   │   └── mongodb.ts
│   └── types/
│       └── index.ts
├── public/
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Step 7: Create MongoDB Connection

### src/lib/mongodb.ts

```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
```

---

## Step 8: Test Connection

### Create Test API Route

Create `src/app/api/test/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

### Test It

```bash
npm run dev
```

Visit: http://localhost:3000/api/test

Should see:
```json
{
  "success": true,
  "message": "Database connected successfully"
}
```

---

## Step 9: Setup Git

### Initialize Repository

```bash
git init
git add .
git commit -m "Initial commit: Project setup"
```

### Create .gitignore

Ensure these are in `.gitignore`:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### Push to GitHub

```bash
# Create repository on GitHub first
git remote add origin https://github.com/yourusername/lindsay-precast.git
git branch -M main
git push -u origin main
```

---

## Step 10: First Model - User

### Create User Model

Create `src/lib/models/User.ts`:

```typescript
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Estimator' | 'Drafter' | 'Project Manager' | 'Production' | 'Inventory Manager' | 'Viewer';
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      index: true 
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Admin', 'Estimator', 'Drafter', 'Project Manager', 'Production', 'Inventory Manager', 'Viewer'],
      default: 'Viewer'
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
```

---

## Step 11: Create First Admin User

### Create Seed Script

Create `scripts/seed.ts`:

```typescript
import dbConnect from '../src/lib/mongodb';
import { User } from '../src/lib/models/User';

async function seed() {
  await dbConnect();

  const adminExists = await User.findOne({ email: 'admin@lindsay.com' });
  
  if (!adminExists) {
    await User.create({
      name: 'Admin User',
      email: 'admin@lindsay.com',
      password: 'admin123', // Will be hashed
      role: 'Admin',
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  process.exit(0);
}

seed();
```

### Add Script to package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "ts-node scripts/seed.ts"
  }
}
```

### Install ts-node

```bash
npm install -D ts-node
```

### Run Seed

```bash
npm run seed
```

---

## Step 12: Development Workflow

### Start Development Server

```bash
npm run dev
```

App runs at: http://localhost:3000

### Using Cursor/Claude

1. Open project in Cursor
2. Use `@docs` to reference documentation files
3. Ask Claude to create components:
   ```
   @database/job-schema.md Create the Job model according to this schema
   ```

4. Ask Claude to create API routes:
   ```
   @api/overview.md Create the jobs API route with CRUD operations
   ```

5. Ask Claude to create UI:
   ```
   Create a jobs table component using TanStack Table and Shadcn UI
   ```

---

## Step 13: Next Steps

Follow the [Development Roadmap](./roadmap.md):

1. **Week 1-2**: Setup authentication (NextAuth)
2. **Week 3**: Create Customer and Job models
3. **Week 4**: Build dashboard
4. **Week 5-6**: Estimation module
5. Continue with roadmap...

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run seed         # Seed database

# Testing (after setup)
npm test             # Run tests
npm run test:e2e     # Run E2E tests
```

---

## Troubleshooting

### MongoDB Connection Fails

1. Check `.env.local` has correct MongoDB URI
2. Verify IP whitelist in MongoDB Atlas
3. Ensure password doesn't have special characters (or encode them)
4. Check network connectivity

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Shadcn UI**: https://ui.shadcn.com
- **NextAuth**: https://next-auth.js.org
- **TanStack Table**: https://tanstack.com/table

---

## Support

For issues or questions:
1. Check documentation in `/docs`
2. Review error messages carefully
3. Use Cursor/Claude for help
4. Check Stack Overflow
5. Contact development team
