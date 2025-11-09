# Development Roadmap

## Project Timeline: 16 Weeks

This roadmap breaks down the Lindsay Precast Job Tracking System into manageable phases suitable for development with Cursor and Claude.

---

## Phase 1: Foundation & Setup (Week 1-2)

### Week 1: Project Setup

**Tasks**:
1. ✅ Initialize Next.js project with TypeScript
   ```bash
   npx create-next-app@latest lindsay-precast --typescript --tailwind --app
   cd lindsay-precast
   ```

2. ✅ Install core dependencies
   ```bash
   npm install mongoose next-auth bcryptjs zod zustand
   npm install @tanstack/react-table date-fns
   npm install -D @types/bcryptjs
   ```

3. ✅ Install Shadcn UI
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button table dialog dropdown-menu select input badge card tabs toast
   ```

4. ✅ Setup MongoDB Atlas
   - Create cluster
   - Create database user
   - Whitelist IPs
   - Get connection string

5. ✅ Configure environment variables
   - Create `.env.local`
   - Add MongoDB URI
   - Add NextAuth secrets

6. ✅ Setup project structure
   ```
   src/
   ├── app/
   │   ├── api/
   │   ├── (auth)/
   │   └── (dashboard)/
   ├── components/
   ├── lib/
   │   ├── mongodb.ts
   │   ├── models/
   │   └── validations/
   └── types/
   ```

**Deliverables**:
- ✅ Running Next.js app
- ✅ MongoDB connection working
- ✅ Basic folder structure
- ✅ Git repository initialized

---

### Week 2: Authentication & User Management

**Tasks**:
1. Create User model (`src/lib/models/User.ts`)
2. Setup NextAuth configuration (`src/app/api/auth/[...nextauth]/route.ts`)
3. Build login page (`src/app/(auth)/login/page.tsx`)
4. Create auth middleware (`src/middleware.ts`)
5. Build user management UI (admin only)
6. Create role-based permission system
7. Add user CRUD API endpoints

**Files to Create**:
- `src/lib/models/User.ts`
- `src/lib/validations/user.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/users/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/app/(auth)/login/page.tsx`
- `src/middleware.ts`
- `src/lib/permissions.ts`

**Test Cases**:
- User can login with valid credentials
- Invalid credentials show error
- Admin can create users
- Non-admin cannot access user management
- Passwords are hashed

**Deliverables**:
- ✅ Working authentication
- ✅ User management interface
- ✅ Role-based access control

---

## Phase 2: Core Data Models (Week 3-4)

### Week 3: Customer & Job Models

**Tasks**:
1. Create Customer model
2. Build customer CRUD API
3. Create customer management UI
4. Create Job model
5. Build job creation form
6. Create jobs list view (table)

**Files to Create**:
- `src/lib/models/Customer.ts`
- `src/lib/models/Job.ts`
- `src/lib/validations/customer.ts`
- `src/lib/validations/job.ts`
- `src/app/api/customers/route.ts`
- `src/app/api/customers/[id]/route.ts`
- `src/app/api/jobs/route.ts`
- `src/app/api/jobs/[id]/route.ts`
- `src/app/(dashboard)/customers/page.tsx`
- `src/app/(dashboard)/jobs/page.tsx`
- `src/components/jobs/JobsTable.tsx`
- `src/components/jobs/CreateJobDialog.tsx`

**Test Cases**:
- Customer can be created with valid data
- Duplicate customers prevented
- Job auto-generates job number
- Jobs list displays correctly
- Filters work (status, priority, customer)

---

### Week 4: Dashboard & Navigation

**Tasks**:
1. Build main dashboard layout
2. Create navigation sidebar
3. Add stats cards
4. Create job pipeline visualization
5. Add recent activity feed
6. Build search functionality

**Files to Create**:
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/page.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/components/dashboard/StatsCards.tsx`
- `src/components/dashboard/JobPipeline.tsx`
- `src/components/dashboard/ActivityFeed.tsx`
- `src/components/search/GlobalSearch.tsx`

**Deliverables**:
- ✅ Functional dashboard
- ✅ Navigation working
- ✅ Basic statistics showing

---

## Phase 3: Estimation Module (Week 5-6)

### Week 5: Estimate Model & API

**Tasks**:
1. Create Estimate model with embedded structures
2. Build estimate creation API
3. Create estimate versioning system
4. Build cost calculation logic
5. Add estimate approval workflow

**Files to Create**:
- `src/lib/models/Estimate.ts`
- `src/lib/validations/estimate.ts`
- `src/app/api/estimates/route.ts`
- `src/app/api/estimates/[id]/route.ts`
- `src/app/api/estimates/[id]/approve/route.ts`
- `src/lib/services/estimateService.ts`

---

### Week 6: Estimate UI

**Tasks**:
1. Build structure builder component
2. Create items to purchase list
3. Add cost calculator
4. Build estimate form
5. Create estimate history view
6. Add revision tracking

**Files to Create**:
- `src/app/(dashboard)/jobs/[id]/estimate/page.tsx`
- `src/components/estimates/StructureBuilder.tsx`
- `src/components/estimates/ItemsToPurchase.tsx`
- `src/components/estimates/CostCalculator.tsx`
- `src/components/estimates/EstimateForm.tsx`
- `src/components/estimates/EstimateHistory.tsx`

**Test Cases**:
- Structure can be added with specifications
- Costs calculate correctly
- Profit margin applies correctly
- Revisions create new version
- Estimate approval moves job to drafting

**Deliverables**:
- ✅ Working estimation module
- ✅ Cost calculations accurate
- ✅ Version control working

---

## Phase 4: Drafting Module (Week 7-8)

### Week 7: Drawing Management

**Tasks**:
1. Create Drawing model
2. Setup file upload (S3 or GridFS)
3. Build drawing upload API
4. Create revision tracking
5. Add PM handover workflow

**Files to Create**:
- `src/lib/models/Drawing.ts`
- `src/lib/validations/drawing.ts`
- `src/lib/s3.ts` or `src/lib/gridfs.ts`
- `src/app/api/drawings/route.ts`
- `src/app/api/drawings/[id]/upload/route.ts`
- `src/app/api/drawings/[id]/handover/route.ts`

---

### Week 8: Drawing UI

**Tasks**:
1. Build drawing upload component
2. Create drawing viewer
3. Add revision history
4. Build handover dialog
5. Add drawing status indicators

**Files to Create**:
- `src/app/(dashboard)/jobs/[id]/drawings/page.tsx`
- `src/components/drawings/DrawingUpload.tsx`
- `src/components/drawings/DrawingViewer.tsx`
- `src/components/drawings/RevisionHistory.tsx`
- `src/components/drawings/HandoverDialog.tsx`

**Test Cases**:
- Files upload successfully
- Supported formats: DWG, PDF
- File size limits enforced
- Revisions tracked correctly
- PM notified on handover

---

## Phase 5: Submittal & PM Module (Week 9-10)

### Week 9: Submittal System

**Tasks**:
1. Create Submittal model
2. Build submittal creation API
3. Add customer response tracking
4. Create quote/drawing revision workflow

**Files to Create**:
- `src/lib/models/Submittal.ts`
- `src/lib/validations/submittal.ts`
- `src/app/api/submittals/route.ts`
- `src/app/api/submittals/[id]/response/route.ts`

---

### Week 10: PM Interface

**Tasks**:
1. Build submittal creation form
2. Create customer submission tracking
3. Add revision request interface
4. Build acceptance workflow

**Files to Create**:
- `src/app/(dashboard)/jobs/[id]/submittals/page.tsx`
- `src/components/submittals/SubmittalForm.tsx`
- `src/components/submittals/CustomerResponse.tsx`
- `src/components/submittals/RevisionRequest.tsx`

**Deliverables**:
- ✅ Submittal workflow complete
- ✅ Revision tracking working
- ✅ Customer responses recorded

---

## Phase 6: Production & Delivery (Week 11-12)

### Week 11: Production Module

**Tasks**:
1. Create ProductionOrder model
2. Build production queue
3. Add progress tracking
4. Create quality control checks

**Files to Create**:
- `src/lib/models/ProductionOrder.ts`
- `src/lib/validations/production.ts`
- `src/app/api/production/route.ts`
- `src/app/api/production/[id]/progress/route.ts`
- `src/app/(dashboard)/production/page.tsx`
- `src/components/production/ProductionQueue.tsx`
- `src/components/production/ProgressTracker.tsx`

---

### Week 12: Delivery Module

**Tasks**:
1. Create Delivery model
2. Build delivery scheduling
3. Add delivery confirmation
4. Create delivery tracking

**Files to Create**:
- `src/lib/models/Delivery.ts`
- `src/lib/validations/delivery.ts`
- `src/app/api/deliveries/route.ts`
- `src/app/api/deliveries/[id]/confirm/route.ts`
- `src/app/(dashboard)/jobs/[id]/delivery/page.tsx`
- `src/components/deliveries/DeliveryScheduler.tsx`
- `src/components/deliveries/DeliveryConfirmation.tsx`

**Deliverables**:
- ✅ Production tracking functional
- ✅ Delivery scheduling working
- ✅ Confirmation system in place

---

## Phase 7: Inventory Module (Week 13-14)

### Week 13: Inventory System

**Tasks**:
1. Create Inventory model
2. Build stock tracking
3. Add reorder alerts
4. Create usage history

**Files to Create**:
- `src/lib/models/Inventory.ts`
- `src/lib/validations/inventory.ts`
- `src/app/api/inventory/route.ts`
- `src/app/api/inventory/[id]/adjust/route.ts`
- `src/app/api/inventory/low-stock/route.ts`

---

### Week 14: Inventory UI

**Tasks**:
1. Build inventory table
2. Create stock adjustment dialog
3. Add low stock alerts
4. Build usage reports

**Files to Create**:
- `src/app/(dashboard)/inventory/page.tsx`
- `src/components/inventory/InventoryTable.tsx`
- `src/components/inventory/StockAdjustment.tsx`
- `src/components/inventory/LowStockAlerts.tsx`
- `src/components/inventory/UsageReport.tsx`

**Test Cases**:
- Stock adjusts correctly
- Alerts trigger at reorder level
- Usage tracked per job
- Reorder recommendations accurate

**Deliverables**:
- ✅ Inventory management complete
- ✅ Alerts working
- ✅ Usage tracking functional

---

## Phase 8: Real-time & Polish (Week 15-16)

### Week 15: Real-time Updates

**Tasks**:
1. Setup Socket.io or Pusher
2. Implement real-time job updates
3. Add live notifications
4. Create activity broadcasting

**Files to Create**:
- `src/lib/socket.ts`
- `src/app/api/socket/route.ts`
- `src/components/providers/SocketProvider.tsx`
- `src/hooks/useRealtime.ts`
- `src/lib/events.ts`

**Test Cases**:
- Updates broadcast to all users
- Notifications appear instantly
- Connection handles interruptions
- Events properly namespaced

---

### Week 16: Testing, Polish & Deployment

**Tasks**:
1. Comprehensive testing
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests for critical flows

2. UI/UX improvements
   - Loading states
   - Error boundaries
   - Accessibility audit
   - Mobile responsiveness

3. Performance optimization
   - Database indexes
   - Query optimization
   - Code splitting
   - Image optimization

4. Documentation
   - User guide
   - Admin documentation
   - API documentation

5. Deployment
   - Vercel setup
   - Environment variables
   - MongoDB production cluster
   - Domain configuration

**Files to Create**:
- `tests/unit/` - Unit tests
- `tests/integration/` - API tests
- `tests/e2e/` - Playwright tests
- `docs/user-guide.md`
- `docs/admin-guide.md`

**Deliverables**:
- ✅ All tests passing
- ✅ App deployed to production
- ✅ Documentation complete
- ✅ Training materials ready

---

## Development Best Practices

### Version Control

```bash
# Feature branch workflow
git checkout -b feature/job-management
# ... make changes
git commit -m "feat: add job listing page"
git push origin feature/job-management
# Create pull request
```

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

### Code Review Checklist

- [ ] Code follows TypeScript best practices
- [ ] All functions have type definitions
- [ ] Error handling implemented
- [ ] Input validation with Zod
- [ ] Database queries optimized
- [ ] UI components accessible
- [ ] Tests written and passing
- [ ] Documentation updated

### Testing Strategy

1. **Unit Tests**: Business logic, utilities
2. **Integration Tests**: API endpoints
3. **E2E Tests**: Critical user flows
   - Login
   - Create job
   - Create estimate
   - Submit to customer
   - Complete delivery

---

## Key Milestones

- **Week 2**: ✅ Authentication working
- **Week 4**: ✅ Dashboard functional
- **Week 6**: ✅ Estimation module complete
- **Week 8**: ✅ Drafting module complete
- **Week 10**: ✅ PM/Submittal module complete
- **Week 12**: ✅ Production/Delivery complete
- **Week 14**: ✅ Inventory module complete
- **Week 16**: ✅ Production deployment

---

## Risk Management

### Technical Risks

1. **File Upload Size**: Large DWG files
   - **Mitigation**: Implement chunked uploads

2. **Real-time Performance**: Many concurrent users
   - **Mitigation**: Use Redis for pub/sub

3. **Database Growth**: Large job history
   - **Mitigation**: Archive old jobs, implement pagination

### Schedule Risks

1. **Feature Creep**: Additional requirements
   - **Mitigation**: Strict scope control, future phase

2. **Technical Debt**: Rush to deadline
   - **Mitigation**: Maintain code quality, automated tests

---

## Post-Launch Tasks

### Month 1
- Monitor performance metrics
- Gather user feedback
- Fix critical bugs
- Performance optimizations

### Month 2-3
- Implement user-requested features
- Email notifications
- Advanced reporting
- Mobile responsiveness improvements

### Month 4-6
- Mobile app (React Native)
- QuickBooks integration
- Advanced analytics
- Customer portal

---

## Success Metrics

- **User Adoption**: 100% of estimators using system within 2 weeks
- **Performance**: < 3 second page load
- **Reliability**: 99.9% uptime
- **Efficiency**: 50% reduction in job tracking time
- **Data Accuracy**: Zero lost jobs or estimates

---

## Support Plan

### Training
- Week 16: Admin training (2 hours)
- Week 17: User training (1 hour per role)
- Week 18: Office hours for questions

### Documentation
- User guide with screenshots
- Video tutorials for each module
- FAQ document
- Quick reference cards

### Ongoing Support
- Dedicated support channel (Slack/Email)
- Monthly check-ins
- Quarterly feature reviews
- Annual system audit
