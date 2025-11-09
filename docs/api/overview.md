# API Documentation

## Overview

All API routes are RESTful and follow Next.js App Router conventions. All routes are located in `src/app/api/`.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://lindsay-precast.vercel.app/api`

## Authentication

All routes (except auth endpoints) require authentication via NextAuth session or JWT token.

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /api/auth/login

Login user and create session.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Smith",
      "email": "john@example.com",
      "role": "Estimator"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/logout

Logout current user.

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Jobs Endpoints

### GET /api/jobs

Get all jobs with optional filters.

**Query Parameters**:
- `status` - Filter by status
- `phase` - Filter by current phase
- `customerId` - Filter by customer
- `estimatorId` - Filter by estimator
- `priority` - Filter by priority
- `search` - Search by job number or name
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

**Example**: `/api/jobs?phase=production&priority=high&page=1&limit=25`

**Response**:
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "jobNumber": "LP-2024-001",
        "jobName": "72\" Wet Well - Downtown Project",
        "customer": {
          "_id": "507f191e810c19729de860ea",
          "companyName": "City Public Works"
        },
        "status": "In Production",
        "currentPhase": "production",
        "priority": "high",
        "createdDate": "2024-10-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 42,
      "pages": 2
    }
  }
}
```

### POST /api/jobs

Create a new job.

**Request Body**:
```json
{
  "jobName": "Air Vacuum Vault Project",
  "customerId": "507f191e810c19729de860ea",
  "estimatorId": "507f191e810c19729de860eb",
  "priority": "high",
  "notes": "Customer requested expedited timeline"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "jobNumber": "LP-2024-043",
    "jobName": "Air Vacuum Vault Project",
    "status": "Estimation",
    "currentPhase": "estimation",
    "createdDate": "2024-11-08T00:00:00.000Z"
  },
  "message": "Job created successfully"
}
```

### GET /api/jobs/:id

Get single job details.

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "jobNumber": "LP-2024-001",
    "jobName": "72\" Wet Well - Downtown Project",
    "customer": { ... },
    "estimator": { ... },
    "drafter": { ... },
    "projectManager": { ... },
    "status": "In Production",
    "priority": "high",
    "notes": "...",
    "createdDate": "2024-10-15T00:00:00.000Z",
    "createdAt": "2024-10-15T10:30:00.000Z",
    "updatedAt": "2024-11-01T14:20:00.000Z"
  }
}
```

### PUT /api/jobs/:id

Update job details.

**Request Body** (all fields optional):
```json
{
  "jobName": "Updated Name",
  "status": "Drafting",
  "currentPhase": "drafting",
  "drafterId": "507f191e810c19729de860ec",
  "priority": "urgent",
  "notes": "Priority changed per customer request"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Job updated successfully"
}
```

### DELETE /api/jobs/:id

Soft delete a job.

**Response**:
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

### PATCH /api/jobs/:id/status

Update job status/phase.

**Request Body**:
```json
{
  "status": "Submitted",
  "currentPhase": "submitted"
}
```

---

## Estimates Endpoints

### GET /api/estimates?jobId={jobId}

Get all estimates for a job.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "jobId": "507f1f77bcf86cd799439011",
      "version": 2,
      "status": "approved",
      "structures": [ ... ],
      "totalCost": 55000,
      "quotedPrice": 71500,
      "createdAt": "2024-10-28T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "version": 1,
      "status": "revised",
      ...
    }
  ]
}
```

### POST /api/estimates

Create new estimate.

**Request Body**:
```json
{
  "jobId": "507f1f77bcf86cd799439011",
  "estimatorId": "507f191e810c19729de860eb",
  "structures": [
    {
      "structureType": "Wet Well",
      "description": "72\" ID Wet Well",
      "quantity": 1,
      "unitCost": 35000,
      "totalCost": 35000,
      "specifications": {
        "diameter": 72,
        "height": 120,
        "wallThickness": 6
      }
    }
  ],
  "itemsToPurchase": [
    {
      "itemName": "Rebar #5",
      "category": "Rebar",
      "quantity": 500,
      "unitCost": 15,
      "totalCost": 7500
    }
  ],
  "laborCost": 8000,
  "equipmentCost": 2000,
  "overheadCost": 1600,
  "profitMargin": 30
}
```

### PUT /api/estimates/:id

Update estimate.

### POST /api/estimates/:id/approve

Approve an estimate and move job to drafting phase.

---

## Inventory Endpoints

### GET /api/inventory

Get all inventory items.

**Query Parameters**:
- `category` - Filter by category
- `lowStock` - Show only low stock items (true/false)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "itemName": "Rebar #5",
      "category": "Rebar",
      "currentStock": 2500,
      "unit": "linear feet",
      "reorderLevel": 1000,
      "stockStatus": "good",
      "needsReorder": false
    }
  ]
}
```

### POST /api/inventory

Add new inventory item.

### PATCH /api/inventory/:id/adjust

Adjust stock levels.

**Request Body**:
```json
{
  "quantity": -50,
  "type": "usage",
  "jobId": "507f1f77bcf86cd799439011",
  "notes": "Used in wet well construction"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "currentStock": 2450,
    "stockStatus": "good"
  },
  "message": "Stock adjusted successfully"
}
```

### GET /api/inventory/low-stock

Get items below reorder level.

---

## Customers Endpoints

### GET /api/customers

Get all customers.

**Query Parameters**:
- `search` - Search by name or company

### POST /api/customers

Create new customer.

**Request Body**:
```json
{
  "name": "Jane Doe",
  "companyName": "Metro Construction",
  "email": "jane@metro.com",
  "phone": "555-0123",
  "address": {
    "street": "123 Main St",
    "city": "Denver",
    "state": "CO",
    "zip": "80202"
  },
  "contactPerson": "Jane Doe",
  "notes": "Preferred customer"
}
```

### GET /api/customers/:id

Get customer details.

### PUT /api/customers/:id

Update customer.

### DELETE /api/customers/:id

Soft delete customer.

---

## Users Endpoints (Admin Only)

### GET /api/users

Get all users.

### POST /api/users

Create new user.

**Request Body**:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securePassword123",
  "role": "Estimator",
  "phone": "555-0124"
}
```

### PUT /api/users/:id

Update user.

### DELETE /api/users/:id

Deactivate user (set isActive = false).

---

## Drawings Endpoints

### GET /api/drawings?jobId={jobId}

Get drawings for a job.

### POST /api/drawings

Create drawing record.

### POST /api/drawings/:id/upload

Upload drawing file.

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file` - Drawing file (DWG, PDF)

### POST /api/drawings/:id/handover

Hand drawing to PM.

---

## Submittals Endpoints

### GET /api/submittals?jobId={jobId}

Get submittals for a job.

### POST /api/submittals

Create submittal.

### PATCH /api/submittals/:id/response

Record customer response.

**Request Body**:
```json
{
  "decision": "accepted",
  "feedback": "Approved with minor notes"
}
```

---

## Production Endpoints

### GET /api/production

Get production orders.

**Query Parameters**:
- `status` - Filter by status

### POST /api/production

Create production order.

### PATCH /api/production/:id/progress

Update production progress.

---

## Delivery Endpoints

### GET /api/deliveries?jobId={jobId}

Get deliveries for a job.

### POST /api/deliveries

Schedule delivery.

### PATCH /api/deliveries/:id/confirm

Confirm delivery.

---

## Middleware

### Authentication Middleware

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: Request) {
  const token = await getToken({ req: request });
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Permission Check

```typescript
export function requirePermission(permission: string) {
  return async (req: Request) => {
    const user = req.user; // From auth middleware
    
    if (!hasPermission(user, permission)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
  };
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Response**: 429 Too Many Requests

---

## Error Handling

All errors return consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `DUPLICATE_ERROR` - Unique constraint violation
- `SERVER_ERROR` - Internal server error

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50, max: 100)

**Response**:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

---

## Sorting

Use `sort` query parameter:

- `sort=createdAt` - Ascending
- `sort=-createdAt` - Descending (prefix with -)
- `sort=priority,-createdAt` - Multiple fields

---

## Testing

### Example with curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lindsay.com","password":"password"}'

# Get jobs
curl http://localhost:3000/api/jobs?phase=production \
  -H "Authorization: Bearer {token}"

# Create job
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"jobName":"New Job","customerId":"...","priority":"high"}'
```

### Example with JavaScript

```javascript
// Login
const login = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { data: { token } } = await login.json();

// Get jobs
const response = await fetch('/api/jobs?phase=production', {
  headers: { 'Authorization': `Bearer ${token}` },
});

const { data: { jobs } } = await response.json();
```
