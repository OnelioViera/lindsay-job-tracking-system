# Using These Docs with Cursor & Claude

## Overview

This guide shows you how to effectively use these documentation files with Cursor and Claude to build the Lindsay Precast Job Tracking System.

---

## 🎯 Quick Start

### 1. Open Project in Cursor

```bash
# Open the documentation folder
cursor lindsay-precast-docs/

# Or open your development project
cursor your-project-folder/
```

### 2. Reference Docs in Chat

Use the `@` symbol to reference documentation files:

```
@DOCUMENTATION-INDEX.md Show me all available documentation
```

```
@database/job-schema.md Create this Job model exactly as specified
```

```
@development/roadmap.md What are the Week 1 tasks?
```

---

## 📚 Most Useful Documents

### For Starting Development

1. **@development/setup-guide.md** - Complete setup instructions
2. **@development/roadmap.md** - Week-by-week plan
3. **@architecture/tech-stack.md** - What to install

### For Creating Models

1. **@database/overview.md** - Understand data structure
2. **@database/job-schema.md** - Job model example
3. **@database/estimate-schema.md** - Complex nested model example

### For Building APIs

1. **@api/overview.md** - All endpoints and examples
2. **@database/[resource]-schema.md** - Data validation rules

### For UI Development

1. **@ui-prototype.jsx** - Working prototype to reference
2. **@architecture/tech-stack.md** - UI libraries and setup

---

## 💬 Example Prompts

### Setting Up Project

```
I want to start building the Lindsay Precast system. 
@development/setup-guide.md Walk me through the initial setup step by step.
```

### Creating Database Models

```
@database/job-schema.md Create the Job model file with this exact schema. 
Include all fields, validations, indexes, and middleware.
```

```
@database/estimate-schema.md Create the Estimate model. 
Make sure to include the embedded structures and items arrays.
```

```
@database/inventory-schema.md Create the Inventory model with the adjustStock method.
```

### Building API Routes

```
@api/overview.md Create the complete jobs API route at /api/jobs/route.ts 
with GET (list) and POST (create) operations.
```

```
@api/overview.md Create the job detail API at /api/jobs/[id]/route.ts 
with GET, PUT, and DELETE operations.
```

```
@database/estimate-schema.md 
@api/overview.md 
Create the estimates API endpoints with proper validation.
```

### Creating UI Components

```
@ui-prototype.jsx Create a JobsTable component similar to this prototype 
using TanStack Table and Shadcn UI.
```

```
Create a job creation form with fields for:
- Job name
- Customer selection (dropdown)
- Estimator selection
- Priority
- Notes
Use Shadcn form components and Zod validation.
```

```
@database/job-schema.md Create a job detail page that shows all job 
information with tabs for Estimate, Drawings, Submittals, etc.
```

### Following the Roadmap

```
@development/roadmap.md I've completed Week 1. Show me the Week 2 tasks 
and what files I need to create.
```

```
@development/roadmap.md What's in Phase 3 (Estimation Module)? 
Break down the tasks for me.
```

### Debugging & Understanding

```
@architecture/system-architecture.md Explain how authentication works 
in this system and what middleware I need.
```

```
@database/overview.md Explain the relationship between Jobs, Estimates, 
and Drawings. How should I query them together?
```

```
I'm getting a MongoDB connection error. 
@development/setup-guide.md What should I check?
```

---

## 🎨 UI Development Strategy

### Using the Prototype

The `ui-prototype.jsx` file is a working React component demonstrating:
- Dashboard layout
- Jobs table with filters
- Expandable rows
- Inventory management
- Color-coded statuses

**Prompt Pattern**:
```
@ui-prototype.jsx I want to create the [specific component]. 
Show me how it's implemented in the prototype and adapt it for my needs.
```

### Examples

```
@ui-prototype.jsx Show me how the jobs table with expandable rows works. 
Create a similar component but add a column for target delivery date.
```

```
@ui-prototype.jsx Create a dashboard similar to this with stats cards 
showing active jobs, in production, and overdue.
```

---

## 🔄 Workflow Examples

### Complete Feature Implementation

**Example: Building the Job Management Feature**

#### Step 1: Understand Requirements
```
@development/roadmap.md What does Week 3 (Job Management) include?
```

#### Step 2: Create Database Model
```
@database/job-schema.md Create the Job model with all fields, 
validations, and middleware.
```

#### Step 3: Create Validation
```
@database/job-schema.md Create the Zod validation schemas 
for creating and updating jobs.
```

#### Step 4: Build API
```
@api/overview.md Create the jobs API with GET (list), POST (create), 
GET by ID, PUT (update), and DELETE operations.
```

#### Step 5: Create UI Components
```
@ui-prototype.jsx Create a JobsTable component that displays jobs 
in a table with sorting, filtering, and expandable rows.
```

```
Create a CreateJobDialog using Shadcn dialog and form components 
with customer and estimator selection.
```

#### Step 6: Create Page
```
Create the jobs list page at app/(dashboard)/jobs/page.tsx that uses 
the JobsTable component and includes filters and search.
```

---

### Debugging Workflow

**Example: MongoDB Connection Issues**

```
@development/setup-guide.md I'm getting "MongooseError: Operation 
`users.findOne()` buffering timed out". What should I check?
```

**Example: Validation Errors**

```
@database/job-schema.md My job creation is failing validation. 
Here's my data: [paste data]. What's wrong?
```

**Example: API Errors**

```
@api/overview.md My POST /api/jobs returns 500 error. Here's my code: 
[paste code]. What's the issue?
```

---

## 📋 Checklists with Docs

### Before Starting a New Feature

- [ ] Read relevant section in **@development/roadmap.md**
- [ ] Review schema in **@database/** folder
- [ ] Check API spec in **@api/overview.md**
- [ ] Look at UI prototype if applicable

### When Creating a Model

- [ ] Reference **@database/[resource]-schema.md**
- [ ] Include all fields from schema
- [ ] Add indexes as specified
- [ ] Implement methods/virtuals
- [ ] Create Zod validation schemas

### When Building an API

- [ ] Reference **@api/overview.md**
- [ ] Implement all CRUD operations
- [ ] Add authentication middleware
- [ ] Validate with Zod schemas
- [ ] Return consistent response format
- [ ] Handle errors properly

### When Creating UI

- [ ] Check **@ui-prototype.jsx** for patterns
- [ ] Use Shadcn UI components
- [ ] Implement loading states
- [ ] Add error handling
- [ ] Make it responsive

---

## 🎯 Phase-by-Phase Guide

### Phase 1: Foundation (Weeks 1-2)

**Prompts**:
```
@development/setup-guide.md Set up the project from scratch
```
```
@database/customer-user-schemas.md Create User model with authentication
```
```
@api/overview.md Create authentication endpoints
```
```
Create a login page with NextAuth
```

### Phase 2: Core Data (Weeks 3-4)

**Prompts**:
```
@database/customer-user-schemas.md Create Customer model
```
```
@database/job-schema.md Create Job model
```
```
@api/overview.md Create customers and jobs APIs
```
```
@ui-prototype.jsx Create jobs table and dashboard
```

### Phase 3: Estimation (Weeks 5-6)

**Prompts**:
```
@database/estimate-schema.md Create Estimate model
```
```
@api/overview.md Create estimates API
```
```
Create structure builder UI component
```
```
Create cost calculator component
```

---

## 💡 Pro Tips

### 1. Multiple Doc References

You can reference multiple docs in one prompt:

```
@database/job-schema.md 
@database/estimate-schema.md 
@api/overview.md 
Create the jobs API with endpoints to also fetch related estimates for each job.
```

### 2. Incremental Development

Break large tasks into smaller prompts:

```
@database/job-schema.md First, create just the Job schema structure
```

Then:
```
Now add the indexes and middleware
```

Then:
```
Now create the Zod validation schemas
```

### 3. Verify Against Docs

After Claude generates code:

```
@database/job-schema.md Does this generated code match the schema exactly? 
What's missing?
```

### 4. Ask for Explanations

```
@architecture/system-architecture.md Explain how real-time updates 
work in this system
```

### 5. Implementation Checks

```
@development/roadmap.md I just finished Phase 1. 
What should I verify before moving to Phase 2?
```

---

## ⚠️ Common Pitfalls

### ❌ Don't Do This

```
Create a job tracking system
```
**Too vague, doesn't use docs**

### ✅ Do This

```
@database/job-schema.md 
@development/roadmap.md Week 3
Create the Job model exactly as specified in the schema for the Week 3 tasks
```

---

### ❌ Don't Do This

```
Build a jobs table
```
**No reference to existing patterns**

### ✅ Do This

```
@ui-prototype.jsx 
Create a jobs table similar to the one in the prototype, 
using TanStack Table and Shadcn UI components
```

---

### ❌ Don't Do This

```
My code doesn't work
```
**No context or docs reference**

### ✅ Do This

```
@api/overview.md 
My POST /api/jobs endpoint returns 400. Here's my code: [paste code]
According to the API spec, what's wrong?
```

---

## 🎓 Learning Path

### Day 1: Read & Understand
```
@DOCUMENTATION-INDEX.md Show me what documentation is available
```
```
@README.md Explain the project overview
```
```
@architecture/system-architecture.md Explain the high-level architecture
```

### Day 2: Setup
```
@development/setup-guide.md Walk me through setup step by step
```

### Day 3: First Model
```
@database/job-schema.md Create the Job model
```

### Week 1: Authentication
```
@development/roadmap.md Guide me through Week 1 tasks
```

### Ongoing: Follow Roadmap
```
@development/roadmap.md What's next after I complete [current phase]?
```

---

## 📊 Progress Tracking

Keep track of your progress by checking off completed sections:

```
@development/roadmap.md Mark Phase 1 Week 1 as complete. 
What verification should I do before proceeding?
```

```
@development/roadmap.md Show me my progress. I've completed [list tasks]. 
What percentage complete is that?
```

---

## 🆘 Getting Unstuck

### When Confused About Architecture
```
@architecture/system-architecture.md Explain [specific concept]
```

### When Model Relationships Unclear
```
@database/overview.md How do [Resource A] and [Resource B] relate?
```

### When API Structure Unclear
```
@api/overview.md Show me example request/response for [endpoint]
```

### When UI Pattern Unclear
```
@ui-prototype.jsx How is [specific feature] implemented in the prototype?
```

---

## 🚀 Ready to Start?

### Absolute Beginner

1. Start with: `@development/setup-guide.md`
2. Then: `@development/roadmap.md Week 1`
3. Follow week by week

### Experienced Developer

1. Quick review: `@DOCUMENTATION-INDEX.md`
2. Jump to: `@development/roadmap.md` at your skill level
3. Reference schemas as needed

### Specific Feature Focus

1. Find feature in: `@DOCUMENTATION-INDEX.md`
2. Read related docs
3. Start building with doc references

---

## 📞 Best Practices Summary

✅ **Always reference docs** with @ symbol  
✅ **Be specific** about what you want  
✅ **Include context** when debugging  
✅ **Follow the roadmap** sequentially  
✅ **Verify against schemas** after generation  
✅ **Ask for explanations** when unclear  
✅ **Use multiple docs** for complex features  
✅ **Check prototypes** for UI patterns  

---

**Happy Coding! 🎉**

The documentation is comprehensive and designed to work seamlessly with Cursor and Claude. Use it liberally, reference it often, and you'll build the system efficiently and correctly.
