# Database Overview

## Database Structure

The Lindsay Precast Job Tracking System uses MongoDB Atlas as the database. MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents.

## Collections

The database consists of the following main collections:

1. **users** - System users and authentication
2. **customers** - Client companies and contacts
3. **jobs** - Core job tracking records
4. **estimates** - Cost estimates and structure planning
5. **drawings** - Technical drawings and revisions
6. **submittals** - Customer submissions and responses
7. **productionOrders** - Manufacturing tracking
8. **deliveries** - Shipping and delivery records
9. **inventory** - Materials and supplies tracking
10. **activityLogs** - Audit trail of all actions

## Relationships

```
customers ──┐
            ├──> jobs ──┬──> estimates
users ──────┤           ├──> drawings
            │           ├──> submittals
            │           ├──> productionOrders
            │           └──> deliveries
            │
            └──> inventory (usage tracking)
```

## Data Modeling Approach

### Embedded Documents
For data that:
- Is always accessed together with parent
- Has 1-to-1 or 1-to-few relationships
- Doesn't grow unbounded

**Examples**:
- Job structure specifications embedded in estimates
- Delivery address embedded in deliveries
- Customer address embedded in customers

### Referenced Documents
For data that:
- Is accessed independently
- Has many-to-many relationships
- May grow large

**Examples**:
- Jobs reference customers (ObjectId)
- Jobs reference users (estimator, drafter, PM)
- Production orders reference jobs

## Indexing Strategy

### Single Field Indexes
- **jobs.jobNumber** (unique): Fast job lookups
- **jobs.status**: Filter by status
- **jobs.customerId**: Find customer jobs
- **users.email** (unique): User authentication
- **inventory.itemName**: Search inventory

### Compound Indexes
- **jobs**: { customerId: 1, createdAt: -1 } - Customer jobs sorted by date
- **jobs**: { status: 1, priority: 1 } - Filter and sort
- **estimates**: { jobId: 1, version: -1 } - Latest estimate per job
- **drawings**: { jobId: 1, version: -1 } - Latest drawing per job

### Text Indexes
- **jobs**: { jobName: 'text', jobNumber: 'text' } - Full-text search
- **customers**: { name: 'text', companyName: 'text' } - Customer search

## Database Naming Conventions

### Collections
- Use camelCase
- Plural nouns (users, jobs, estimates)

### Fields
- Use camelCase
- Descriptive names (createdAt, estimatorId)
- Boolean fields start with "is" or "has" (isActive, hasRevisions)

### IDs
- MongoDB's default `_id` for primary keys
- Foreign keys end with "Id" (customerId, jobId)

## Data Types

### Common Field Types
```typescript
_id: ObjectId               // MongoDB's unique identifier
String: string              // Text data
Number: number              // Numeric values
Date: Date                  // Timestamps
Boolean: boolean            // True/false flags
Array: []                   // Lists
Object: {}                  // Nested documents
ObjectId: ObjectId          // References to other documents
```

## Timestamps

All documents include automatic timestamps:
- **createdAt**: When document was created
- **updatedAt**: When document was last modified

Mongoose automatically manages these with:
```typescript
{ timestamps: true }
```

## Soft Deletes

Instead of hard deletes, we use soft deletes for important records:
- Add `deletedAt: Date` field (null by default)
- Set date when "deleting"
- Filter out deleted records in queries

**Applied to**: Jobs, Estimates, Customers

## Data Validation

### Schema Level
Mongoose schemas enforce:
- Required fields
- Data types
- Enums for specific values
- Min/max lengths
- Custom validators

### Application Level
Zod schemas provide:
- Input validation
- Type transformation
- Error messages
- Type inference for TypeScript

## Connection Management

### Connection Pooling
MongoDB driver maintains connection pool:
- Minimum pool size: 10
- Maximum pool size: 100
- Connection timeout: 30 seconds

### Connection String Options
```
mongodb+srv://user:pass@cluster.mongodb.net/lindsay-precast?
  retryWrites=true
  &w=majority
  &maxPoolSize=100
  &minPoolSize=10
```

## Backup Strategy

### Automated Backups (MongoDB Atlas)
- **Frequency**: Daily at 2 AM UTC
- **Retention**: 7 days of daily backups
- **Point-in-time Recovery**: Available for last 7 days

### Manual Backups
- Before major deployments
- Before schema migrations
- Monthly archive of completed jobs

### Backup Testing
- Monthly restore test to staging environment
- Verify data integrity
- Document restore procedures

## Performance Considerations

### Query Optimization
1. Use indexes for frequent queries
2. Limit fields returned (projection)
3. Use aggregation pipeline for complex queries
4. Implement pagination for large result sets

### Write Optimization
1. Batch inserts when possible
2. Use bulk write operations
3. Avoid large documents (>16MB limit)
4. Use appropriate write concerns

### Monitoring
- Slow query log (queries >100ms)
- Index usage statistics
- Collection statistics (size, documents)
- Connection pool metrics

## Schema Versioning

### Version Tracking
Each document includes:
```typescript
schemaVersion: number  // Current: 1
```

### Migration Strategy
1. Add new fields (backward compatible)
2. Deprecate old fields (don't remove immediately)
3. Run migration scripts for data transformation
4. Update application code
5. Remove deprecated fields after transition period

## Data Privacy

### Sensitive Data
- Passwords: Bcrypt hashed (never plain text)
- Tokens: Encrypted or hashed
- Personal information: Encrypted at rest (MongoDB Atlas)

### Data Access
- Role-based access control in application
- Separate database users for different services
- Audit logging of data access

## Database Size Estimates

### Initial Deployment
- **Total Size**: ~1 GB
- **Jobs**: ~50 MB (1000 jobs)
- **Estimates**: ~100 MB (detailed specs)
- **Drawings**: Metadata only (~10 MB), files in S3
- **Inventory**: ~5 MB (500 items)

### After 1 Year
- **Total Size**: ~10-20 GB
- **Jobs**: ~500 MB (10,000 jobs)
- **Activity Logs**: ~200 MB
- **Archive Old Data**: Jobs older than 2 years

## Monitoring Queries

### Find Jobs by Status
```javascript
db.jobs.find({ status: 'In Production' })
  .sort({ priority: -1, createdAt: -1 })
```

### Get Latest Estimate for Job
```javascript
db.estimates.find({ jobId: ObjectId('...') })
  .sort({ version: -1 })
  .limit(1)
```

### Low Stock Inventory
```javascript
db.inventory.find({
  $expr: { $lte: ['$currentStock', '$reorderLevel'] }
})
```

### Jobs by Customer with Estimates
```javascript
db.jobs.aggregate([
  { $match: { customerId: ObjectId('...') } },
  { $lookup: {
      from: 'estimates',
      localField: '_id',
      foreignField: 'jobId',
      as: 'estimates'
    }
  }
])
```

## References

- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)
