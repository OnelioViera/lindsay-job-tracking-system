# Documentation Index

## 📚 Complete Documentation for Lindsay Precast Job Tracking System

This index provides quick access to all documentation files organized by category.

---

## 🚀 Getting Started

**Start here if you're new to the project:**

1. 📖 [README.md](./README.md) - Project overview and introduction
2. 🛠️ [Setup Guide](./development/setup-guide.md) - Step-by-step setup instructions
3. 🗺️ [Development Roadmap](./development/roadmap.md) - 16-week development plan

---

## 🏗️ Architecture

**Understanding the system design:**

| Document | Description |
|----------|-------------|
| [System Architecture](./architecture/system-architecture.md) | High-level architecture, data flow, layers |
| [Tech Stack](./architecture/tech-stack.md) | Technologies, dependencies, installation |

---

## 🗄️ Database

**Data models and schemas:**

| Document | Description |
|----------|-------------|
| [Database Overview](./database/overview.md) | Collections, relationships, indexing strategy |
| [Job Schema](./database/job-schema.md) | Core job tracking model |
| [Estimate Schema](./database/estimate-schema.md) | Cost estimation and structures |
| [Inventory Schema](./database/inventory-schema.md) | Materials and supplies tracking |
| [Customer & User Schemas](./database/customer-user-schemas.md) | Customers and system users |

### Additional Schemas (To Create)
- Drawing Schema
- Submittal Schema  
- Production Schema
- Delivery Schema

---

## 🔌 API

**Backend endpoints and integration:**

| Document | Description |
|----------|-------------|
| [API Overview](./api/overview.md) | All REST endpoints, authentication, examples |

### Detailed Endpoint Docs (To Create)
- Authentication Endpoints
- Jobs Endpoints
- Estimates Endpoints
- Inventory Endpoints
- Customers Endpoints

---

## 🎨 UI/UX Design

**User interface specifications:**

### To Create
- Design Principles
- Dashboard Design
- Jobs Table Design
- Job Detail Views
- Forms and Dialogs
- Component Library

---

## 👨‍💻 Development

**Development guides and workflows:**

| Document | Description |
|----------|-------------|
| [Setup Guide](./development/setup-guide.md) | Get started with development |
| [Development Roadmap](./development/roadmap.md) | 16-week phase-by-phase plan |

### Additional Dev Docs (To Create)
- Coding Standards
- Testing Strategy
- Git Workflow
- Code Review Guidelines

---

## 🔒 Security

**Security and deployment:**

### To Create
- Authentication & Authorization
- Data Security
- API Security
- Deployment Guide
- Environment Variables

---

## 📊 Business Logic

**Core workflows and processes:**

### Job Lifecycle
1. **Estimation Phase** → Estimator creates cost estimate
2. **Drafting Phase** → Drafter creates technical drawings
3. **PM Review** → PM reviews and prepares submission
4. **Submitted** → Sent to customer for approval
5. **Under Revision** → Changes requested
6. **Accepted** → Customer approved
7. **In Production** → Manufacturing structures
8. **Delivered** → Completed and shipped

### Key Workflows
- Job Creation → Assignment → Estimation
- Estimate Approval → Drafting Start
- Drawing Completion → PM Handover
- Submittal → Customer Response
- Acceptance → Production Queue
- Production → Delivery
- Inventory Usage → Reorder Alerts

---

## 🎯 Quick Reference by Role

### For Admins
- [Setup Guide](./development/setup-guide.md)
- [System Architecture](./architecture/system-architecture.md)
- [API Overview](./api/overview.md)
- [User Schema](./database/customer-user-schemas.md)

### For Developers
- [Development Roadmap](./development/roadmap.md)
- [Tech Stack](./architecture/tech-stack.md)
- [Database Overview](./database/overview.md)
- [Job Schema](./database/job-schema.md)
- [API Overview](./api/overview.md)

### For Project Managers
- [README](./README.md)
- [Development Roadmap](./development/roadmap.md)
- [Job Lifecycle](#job-lifecycle)

---

## 💡 Using This Documentation with Cursor

### Referencing Docs in Prompts

Use `@docs` to reference specific documentation:

```
@database/job-schema.md Create the Job model with this exact schema
```

```
@api/overview.md Implement the jobs API endpoints as specified here
```

```
@development/roadmap.md What tasks should I focus on in Week 3?
```

### Common Prompt Patterns

**Creating Models**:
```
@database/[schema-name].md Create this Mongoose model with TypeScript
```

**Creating API Routes**:
```
@api/overview.md Create the [resource] API route with all CRUD operations
```

**Creating Components**:
```
Create a [component-name] component using Shadcn UI and TanStack Table for [purpose]
```

**Following Roadmap**:
```
@development/roadmap.md Show me the tasks for Phase [X] Week [Y]
```

---

## 📝 Documentation Status

### ✅ Complete
- README
- System Architecture
- Tech Stack
- Database Overview
- Job Schema
- Estimate Schema
- Inventory Schema
- Customer & User Schemas
- API Overview
- Development Roadmap
- Setup Guide

### 🚧 To Create
- Drawing Schema
- Submittal Schema
- Production Schema
- Delivery Schema
- Detailed API endpoint docs
- UI/UX design specs
- Security documentation
- Testing documentation
- Deployment guide

---

## 🔄 Update Process

### When to Update Documentation

1. **Before Development**: Review relevant docs
2. **During Development**: Update if implementation differs
3. **After Completion**: Document any changes made
4. **Weekly**: Review and update roadmap progress

### How to Update

1. Edit markdown files directly
2. Commit with descriptive message:
   ```bash
   git commit -m "docs: update job schema with new fields"
   ```
3. Keep changelog in README if needed

---

## 📞 Getting Help

### Documentation Issues
- Check if doc exists in index
- Use Cursor/Claude to explain
- Create new doc if needed

### Code Issues
- Reference architecture docs
- Check schema definitions
- Review API specifications
- Follow roadmap phases

### Setup Issues
- Review [Setup Guide](./development/setup-guide.md)
- Check prerequisites
- Verify environment variables
- Test database connection

---

## 🗂️ File Structure

```
lindsay-precast-docs/
├── README.md                          # Project overview
├── DOCUMENTATION-INDEX.md            # This file
│
├── architecture/
│   ├── system-architecture.md        # System design
│   └── tech-stack.md                 # Technologies
│
├── database/
│   ├── overview.md                   # Database structure
│   ├── job-schema.md                 # Job model
│   ├── estimate-schema.md            # Estimate model
│   ├── inventory-schema.md           # Inventory model
│   └── customer-user-schemas.md      # Customer & User models
│
├── api/
│   └── overview.md                   # API endpoints
│
├── ui-design/                        # To be created
│   ├── design-principles.md
│   ├── dashboard.md
│   └── components.md
│
├── development/
│   ├── setup-guide.md                # Getting started
│   ├── roadmap.md                    # Development plan
│   └── testing-strategy.md           # To be created
│
└── security/                         # To be created
    ├── authentication.md
    └── deployment.md
```

---

## 🎓 Learning Path

### Day 1: Understanding the System
1. Read [README](./README.md)
2. Review [System Architecture](./architecture/system-architecture.md)
3. Understand [Job Lifecycle](#job-lifecycle)

### Day 2: Setup Development
1. Follow [Setup Guide](./development/setup-guide.md)
2. Create first admin user
3. Test database connection

### Day 3: Learn the Data
1. Study [Database Overview](./database/overview.md)
2. Review [Job Schema](./database/job-schema.md)
3. Understand relationships

### Week 1: Start Building
1. Follow [Roadmap Phase 1](./development/roadmap.md#phase-1-foundation--setup-week-1-2)
2. Implement authentication
3. Create basic UI layout

---

## 🏆 Best Practices

### Documentation
- ✅ Keep docs up to date
- ✅ Use clear examples
- ✅ Include code snippets
- ✅ Link related docs

### Development
- ✅ Follow the roadmap
- ✅ Reference schemas exactly
- ✅ Test as you build
- ✅ Commit frequently

### Code Quality
- ✅ TypeScript for everything
- ✅ Validate with Zod
- ✅ Handle errors properly
- ✅ Write tests

---

## 📈 Project Progress Tracking

Use this checklist to track overall progress:

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup complete
- [ ] MongoDB connected
- [ ] Authentication working
- [ ] User management built

### Phase 2: Core Data (Weeks 3-4)
- [ ] Customer model created
- [ ] Job model created
- [ ] Dashboard built
- [ ] Jobs list working

### Phase 3: Estimation (Weeks 5-6)
- [ ] Estimate model created
- [ ] Structure builder working
- [ ] Cost calculator accurate
- [ ] Revisions tracking

### Phase 4: Drafting (Weeks 7-8)
- [ ] Drawing model created
- [ ] File upload working
- [ ] Revision tracking
- [ ] PM handover

### Phase 5: Submittal (Weeks 9-10)
- [ ] Submittal model created
- [ ] Customer response tracking
- [ ] Revision workflow

### Phase 6: Production/Delivery (Weeks 11-12)
- [ ] Production model created
- [ ] Delivery model created
- [ ] Progress tracking
- [ ] Confirmation system

### Phase 7: Inventory (Weeks 13-14)
- [ ] Inventory model created
- [ ] Stock tracking
- [ ] Reorder alerts
- [ ] Usage history

### Phase 8: Polish (Weeks 15-16)
- [ ] Real-time updates
- [ ] Testing complete
- [ ] Deployed to production
- [ ] Documentation complete

---

## 🔗 External Resources

### Official Docs
- [Next.js](https://nextjs.org/docs)
- [MongoDB](https://docs.mongodb.com)
- [Mongoose](https://mongoosejs.com/docs)
- [NextAuth](https://next-auth.js.org)
- [Shadcn UI](https://ui.shadcn.com)
- [TanStack Table](https://tanstack.com/table)
- [Zod](https://zod.dev)

### Tutorials
- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)

---

## 📋 Document Templates

### New Schema Template
```markdown
# [Resource] Schema

## Overview
Brief description

## Schema Definition
Mongoose model code

## Zod Validation
Validation schemas

## Field Descriptions
Table of fields

## Queries
Common query examples

## Best Practices
Tips and guidelines

## Related Collections
Links to related schemas
```

### New API Endpoint Template
```markdown
# [Resource] Endpoints

## GET /api/[resource]
Description, params, response

## POST /api/[resource]
Description, body, response

## GET /api/[resource]/:id
Description, response

## PUT /api/[resource]/:id
Description, body, response

## DELETE /api/[resource]/:id
Description, response
```

---

## 🎯 Next Steps

1. **If you haven't started**: Begin with [Setup Guide](./development/setup-guide.md)
2. **If setup is complete**: Follow [Week 1 tasks](./development/roadmap.md#week-1-project-setup)
3. **If you're mid-development**: Check current phase in [Roadmap](./development/roadmap.md)
4. **If you need specific info**: Use this index to find relevant docs

---

**Last Updated**: November 8, 2024  
**Version**: 1.0  
**Maintained By**: Development Team
