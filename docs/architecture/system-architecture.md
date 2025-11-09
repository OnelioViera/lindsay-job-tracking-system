# System Architecture

## Overview

Lindsay Precast Job Tracking System is built as a modern, full-stack web application using Next.js with a MongoDB database backend. The system follows a modular architecture with clear separation of concerns.

## Architecture Layers

### 1. Presentation Layer (Frontend)
- **Next.js App Router**: Server-side rendering and client components
- **React Components**: Modular, reusable UI components
- **Shadcn UI**: Pre-built accessible components
- **Tailwind CSS**: Utility-first styling
- **TanStack Table**: Advanced data grid functionality

### 2. API Layer
- **Next.js API Routes**: RESTful endpoints
- **Server Actions**: Direct server functions for mutations
- **Middleware**: Authentication, validation, error handling
- **Rate Limiting**: Protect against abuse

### 3. Business Logic Layer
- **Service Functions**: Reusable business logic
- **Validation Schemas**: Zod for type-safe validation
- **State Management**: React Context/Zustand for client state
- **Real-time Service**: Socket.io/Pusher integration

### 4. Data Layer
- **MongoDB Atlas**: Cloud-hosted database
- **Mongoose ODM**: Schema definition and validation
- **Indexes**: Optimized query performance
- **Aggregation Pipelines**: Complex data queries

### 5. File Storage Layer
- **AWS S3 / GridFS**: Drawing and document storage
- **CDN**: Fast file delivery
- **Image Optimization**: Next.js Image component

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Jobs Table  │  │  Inventory   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          React Components (Shadcn UI)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER (Vercel)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              App Router / API Routes                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Auth        │  │  Jobs API    │  │  Inventory   │     │
│  │  Middleware  │  │  Service     │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   MONGODB ATLAS (Cloud)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Jobs    │ │ Estimates│ │ Drawings │ │Inventory │      │
│  │Collection│ │Collection│ │Collection│ │Collection│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    FILE STORAGE (S3/GridFS)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Drawings (DWG, PDF) • Photos • Documents          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Example: Creating a New Job

1. **User Action**: User clicks "New Job" and fills form
2. **Client Validation**: Zod schema validates input
3. **API Request**: POST to `/api/jobs`
4. **Authentication**: Middleware verifies user token
5. **Authorization**: Check user has "create_job" permission
6. **Business Logic**: Validate job data, assign job number
7. **Database**: Insert job document to MongoDB
8. **Real-time Event**: Broadcast "job_created" via Socket.io
9. **Response**: Return job data to client
10. **UI Update**: Update jobs table and show notification
11. **Other Clients**: Receive real-time update and refresh view

## Real-time Architecture

### WebSocket Connection Flow

```
Client A                    Server                    Client B
   │                          │                          │
   │──── Connect ────────────>│                          │
   │<─── Connected ───────────│                          │
   │                          │<──── Connect ────────────│
   │                          │───── Connected ──────────>│
   │                          │                          │
   │─ Update Job Status ─────>│                          │
   │                          │─ Broadcast Update ──────>│
   │                          │                          │
   │<─ Confirmation ──────────│                          │
   │                          │                          │
```

### Real-time Events

- `job:created` - New job added
- `job:updated` - Job details changed
- `job:status_changed` - Status/phase changed
- `estimate:created` - New estimate
- `drawing:uploaded` - Drawing file added
- `submittal:submitted` - Submittal sent to customer
- `production:progress` - Production update
- `inventory:low_stock` - Stock below reorder level
- `user:action` - User activity log

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. NextAuth validates against MongoDB
3. Generate JWT token (access + refresh)
4. Store session in database
5. Return tokens to client
6. Client stores in httpOnly cookies
7. Include token in all API requests
8. Middleware validates token on each request
9. Refresh token before expiry
```

### Authorization Layers

1. **Route Protection**: Middleware checks authentication
2. **Role-Based Access Control (RBAC)**: User roles determine permissions
3. **Resource-Level Authorization**: Check ownership/assignment
4. **Field-Level Security**: Hide sensitive data based on role

## Performance Optimization

### Database Optimization

- **Indexes**: On frequently queried fields
  - jobNumber (unique)
  - customerId
  - status/phase
  - estimatorId, drafterId, pmId
  - createdAt, updatedAt
  
- **Aggregation Pipelines**: For complex queries
- **Projection**: Select only needed fields
- **Pagination**: Limit query results

### Caching Strategy

- **Next.js Cache**: Static pages and API routes
- **Redis** (optional): Session storage and frequently accessed data
- **Browser Cache**: Static assets via CDN

### Code Splitting

- Route-based splitting with Next.js App Router
- Component lazy loading
- Dynamic imports for heavy components

## Scalability Considerations

### Horizontal Scaling
- **Vercel**: Automatic scaling based on traffic
- **MongoDB Atlas**: Auto-scaling cluster
- **CDN**: Distributed content delivery

### Database Scaling
- **Read Replicas**: For read-heavy operations
- **Sharding**: If data grows beyond single server
- **Archive Old Data**: Move completed jobs to archive collection

## Monitoring & Logging

### Application Monitoring
- **Vercel Analytics**: Performance metrics
- **Sentry**: Error tracking and reporting
- **Custom Logging**: Important business events

### Database Monitoring
- **MongoDB Atlas Monitoring**: Query performance, slow queries
- **Alerts**: Database connection issues, high memory usage

### User Activity Logging
- All CRUD operations logged with:
  - User ID
  - Action type
  - Resource affected
  - Timestamp
  - Changes made

## Backup & Recovery

### Database Backups
- **Automated Daily Backups**: MongoDB Atlas
- **Point-in-time Recovery**: Last 7 days
- **Backup Testing**: Monthly restore tests

### File Backups
- **S3 Versioning**: Keep file history
- **Cross-region Replication**: Disaster recovery

## Development Environment

### Local Setup
```bash
# Clone repository
git clone [repo-url]

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables
```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
AWS_S3_BUCKET=...
SOCKET_SERVER_URL=...
```

## Deployment Pipeline

```
Developer → Git Push → GitHub
                ↓
          GitHub Actions
        (Run Tests, Lint)
                ↓
            Vercel Deploy
        (Automatic Production)
                ↓
          MongoDB Atlas
        (Production Database)
```

## Technology Decisions

### Why Next.js?
- Server-side rendering for performance
- Built-in API routes (no separate backend)
- Excellent TypeScript support
- Vercel deployment integration
- Strong ecosystem and community

### Why MongoDB?
- Flexible schema for evolving requirements
- Excellent performance for document-based data
- Easy to model job relationships
- Atlas cloud hosting simplifies ops
- Good aggregation pipeline support

### Why Shadcn UI?
- Accessible components out of the box
- Full customization with Tailwind
- Copy-paste components (no dependencies)
- Modern, professional design
- Great TypeScript support

### Why Socket.io/Pusher?
- Real-time updates essential for team collaboration
- Reliable WebSocket implementation
- Fallback to long-polling if needed
- Room-based messaging for targeted updates

## Best Practices

1. **Type Safety**: Use TypeScript everywhere
2. **Validation**: Validate all inputs with Zod
3. **Error Handling**: Consistent error responses
4. **Testing**: Unit tests for business logic, E2E for critical flows
5. **Documentation**: JSDoc comments for complex functions
6. **Code Review**: All PRs require review
7. **Git Flow**: Feature branches, no direct commits to main
8. **Security**: Regular dependency updates, security audits
