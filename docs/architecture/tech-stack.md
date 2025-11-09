# Technology Stack

## Frontend Technologies

### Next.js 14+
**Purpose**: React framework for production
**Why**: 
- App Router for modern routing
- Server components for performance
- Built-in API routes
- Image optimization
- Automatic code splitting

**Installation**:
```bash
npx create-next-app@latest lindsay-precast --typescript --tailwind --app
```

### TypeScript
**Purpose**: Type-safe JavaScript
**Why**:
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Easier refactoring

**Configuration**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Shadcn UI
**Purpose**: UI component library
**Why**:
- Accessible by default (ARIA compliant)
- Fully customizable with Tailwind
- Copy-paste components (no package bloat)
- Built on Radix UI primitives

**Installation**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add card
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
```

### Tailwind CSS
**Purpose**: Utility-first CSS framework
**Why**:
- Rapid UI development
- Consistent design system
- No CSS conflicts
- Small production bundle

**Configuration**: `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

### TanStack Table (React Table v8)
**Purpose**: Headless table/data grid library
**Why**:
- Powerful sorting, filtering, pagination
- Virtual scrolling for large datasets
- Column resizing and reordering
- Inline editing support

**Installation**:
```bash
npm install @tanstack/react-table
```

### Zustand (State Management)
**Purpose**: Client-side state management
**Why**:
- Simple API, minimal boilerplate
- No providers needed
- TypeScript support
- DevTools integration

**Installation**:
```bash
npm install zustand
```

---

## Backend Technologies

### Next.js API Routes
**Purpose**: Backend API endpoints
**Why**:
- Same codebase as frontend
- Serverless by default
- TypeScript throughout
- Easy deployment

**Example Structure**:
```
src/app/api/
├── auth/
│   ├── login/route.ts
│   └── logout/route.ts
├── jobs/
│   ├── route.ts
│   └── [id]/route.ts
├── estimates/
│   └── route.ts
└── inventory/
    └── route.ts
```

### NextAuth.js
**Purpose**: Authentication library
**Why**:
- Built for Next.js
- Multiple providers support
- Session management
- CSRF protection

**Installation**:
```bash
npm install next-auth
```

**Configuration**: `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials against MongoDB
        return user
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Mongoose
**Purpose**: MongoDB ODM (Object Document Mapper)
**Why**:
- Schema definition and validation
- Middleware (hooks)
- Type casting
- Query building

**Installation**:
```bash
npm install mongoose
```

**Connection**: `src/lib/mongodb.ts`
```typescript
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect
```

### Zod
**Purpose**: Schema validation
**Why**:
- Type-safe validation
- Parse and transform data
- Excellent error messages
- Works with TypeScript

**Installation**:
```bash
npm install zod
```

**Example**:
```typescript
import { z } from 'zod'

export const jobSchema = z.object({
  jobName: z.string().min(1).max(200),
  customerId: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatorId: z.string(),
})

export type JobInput = z.infer<typeof jobSchema>
```

---

## Database

### MongoDB Atlas
**Purpose**: Cloud-hosted MongoDB
**Why**:
- Fully managed service
- Automatic backups
- Scaling on demand
- Global distribution
- Free tier for development

**Setup**:
1. Create account at mongodb.com
2. Create new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string

**Connection String**:
```
mongodb+srv://username:password@cluster.mongodb.net/lindsay-precast?retryWrites=true&w=majority
```

---

## Real-time Communication

### Socket.io (Recommended)
**Purpose**: Real-time bidirectional communication
**Why**:
- WebSocket with fallbacks
- Room-based messaging
- Automatic reconnection
- Event-based architecture

**Installation**:
```bash
npm install socket.io socket.io-client
```

### Pusher (Alternative)
**Purpose**: Managed real-time service
**Why**:
- No infrastructure to manage
- Presence channels
- Private channels
- Generous free tier

**Installation**:
```bash
npm install pusher pusher-js
```

---

## File Storage

### AWS S3
**Purpose**: Cloud file storage
**Why**:
- Scalable and reliable
- Direct uploads from browser
- Presigned URLs for security
- CDN integration

**Installation**:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### MongoDB GridFS (Alternative)
**Purpose**: Store files in MongoDB
**Why**:
- Keep everything in one database
- Simpler architecture
- No additional service needed

**Installation**: Built into Mongoose

---

## Development Tools

### ESLint
**Purpose**: Code linting
```bash
npm install --save-dev eslint eslint-config-next
```

### Prettier
**Purpose**: Code formatting
```bash
npm install --save-dev prettier eslint-config-prettier
```

### Husky
**Purpose**: Git hooks
```bash
npm install --save-dev husky
```

### Jest
**Purpose**: Unit testing
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Playwright
**Purpose**: E2E testing
```bash
npm install --save-dev @playwright/test
```

---

## Deployment

### Vercel
**Purpose**: Next.js hosting platform
**Why**:
- Made by Next.js creators
- Automatic deployments
- Preview deployments
- Edge network
- Free tier for small projects

**Setup**:
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

---

## Optional Enhancements

### React Hook Form
**Purpose**: Form state management
```bash
npm install react-hook-form
```

### date-fns
**Purpose**: Date manipulation
```bash
npm install date-fns
```

### recharts
**Purpose**: Charts and graphs
```bash
npm install recharts
```

### jsPDF
**Purpose**: PDF generation
```bash
npm install jspdf
```

### xlsx
**Purpose**: Excel file generation
```bash
npm install xlsx
```

---

## Development Dependencies

### Complete package.json

```json
{
  "name": "lindsay-precast",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "@tanstack/react-table": "^8.10.0",
    "next-auth": "^4.24.0",
    "mongoose": "^8.0.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "socket.io": "^4.6.0",
    "socket.io-client": "^4.6.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.0",
    "@playwright/test": "^1.40.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## Environment Variables

Create `.env.local`:
```bash
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=lindsay-precast-files
AWS_REGION=us-east-1

# Socket.io (if using)
SOCKET_SERVER_URL=http://localhost:3001

# Pusher (if using)
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_APP_ID=...
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Performance Targets

- **Initial Load**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: > 90
- **API Response Time**: < 500ms
- **Real-time Latency**: < 200ms

---

## Version Requirements

- Node.js: 18.17.0 or higher
- npm: 9.0.0 or higher
- MongoDB: 6.0 or higher
