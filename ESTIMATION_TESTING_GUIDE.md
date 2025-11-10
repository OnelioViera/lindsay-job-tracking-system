# Estimation Feature Testing Guide

## Quick Start

### Prerequisites
1. Ensure MongoDB is running and connected
2. Have at least one user of each role:
   - Admin
   - Estimator  
   - Project Manager
3. Have at least one customer and one job created

## Test Scenarios

### Scenario 1: Estimator Creates a Quote

**Steps:**
1. Log in as an **Estimator**
2. Click on "Estimations" in the sidebar (you should see a Calculator icon)
3. Click "New Estimate" button
4. Fill out the form:
   - Select a job from the dropdown
   - Add at least one structure (e.g., "Manhole", description, quantity, unit cost)
   - Add at least one item to purchase (e.g., "Rebar", category, quantity, unit cost)
   - Fill in cost fields (Labor, Material, Equipment, Overhead)
   - Adjust profit margin if desired
   - Add notes (optional)
5. Click "Save as Draft" or "Submit Estimate"

**Expected Results:**
- ✅ Estimate is created successfully
- ✅ Redirected to estimates list page
- ✅ New estimate appears in the table
- ✅ If submitted, notifications are sent to all PMs and Admins
- ✅ Cost calculations are accurate

### Scenario 2: Admin/PM Receives Quote Notification

**Steps:**
1. Log in as a **Project Manager** or **Admin**
2. Look for the notification icon (bell) in the header
3. Click to open notification panel

**Expected Results:**
- ✅ Notification appears: "New Quote Submitted" or "New Quote Available"
- ✅ Message includes estimator name, job name/number, and quoted price
- ✅ Notification is marked as unread (badge shows count)

### Scenario 3: Estimator Assigns Quote to PM

**Steps:**
1. Log in as an **Estimator**
2. Go to "Estimations" page
3. Click "View" on any estimate (preferably submitted one)
4. In the "Assign Project Manager" card (right sidebar):
   - Select a PM from dropdown
   - Click "Assign PM"

**Expected Results:**
- ✅ Success message appears
- ✅ Assigned PM is displayed on the estimate
- ✅ PM receives notification: "Quote Assigned to You"
- ✅ All Admins receive notification: "Quote Assigned to PM"
- ✅ Job's projectManagerId is updated

### Scenario 4: PM Views Assigned Quotes

**Steps:**
1. Log in as a **Project Manager** (one who was assigned)
2. Click "Estimations" in sidebar
3. View the estimates list

**Expected Results:**
- ✅ Only shows estimates assigned to this PM
- ✅ Can see all estimate details
- ✅ Can view full estimate by clicking "View"

### Scenario 5: Admin Views All Estimates

**Steps:**
1. Log in as an **Admin**
2. Click "Estimations" in sidebar
3. View the estimates list

**Expected Results:**
- ✅ Shows ALL estimates (from all estimators)
- ✅ Can filter by status (draft, submitted, approved, revised)
- ✅ Can search by job number, job name, or estimator name
- ✅ Stats cards show accurate counts

### Scenario 6: Estimator Accesses Customers and Inventory

**Steps:**
1. Log in as an **Estimator**
2. Go to "Estimations" page
3. Click on "Customers" tab
4. Click "Go to Customers" button
5. Verify you can see customer list
6. Go back to "Estimations"
7. Click on "Inventory" tab
8. Click "Go to Inventory" button

**Expected Results:**
- ✅ Estimator has access to Customers page
- ✅ Estimator has access to Inventory page
- ✅ Tabs work smoothly without errors
- ✅ Can navigate back to Estimations easily

### Scenario 7: Edit Draft Estimate

**Steps:**
1. Log in as an **Estimator**
2. Create a new estimate and save as "Draft"
3. View the draft estimate
4. Note the status is "Draft"
5. Click "Submit Estimate" button

**Expected Results:**
- ✅ Status changes to "Submitted"
- ✅ Notifications are sent to PMs and Admins
- ✅ Submit button is no longer visible

### Scenario 8: View Estimate Details

**Steps:**
1. Log in as any user with access to estimates
2. Click on any estimate to view details
3. Scroll through the page

**Expected Results:**
- ✅ All estimate information is displayed clearly
- ✅ Cost breakdown is accurate
- ✅ Structures list shows all added structures
- ✅ Items to purchase list shows all items
- ✅ Notes are visible (if added)
- ✅ Status badge is correctly colored
- ✅ Quick stats sidebar shows version and status

## Common Issues & Solutions

### Issue: "Not authorized" error when creating estimate
**Solution:** Ensure you're logged in as an Estimator or Admin

### Issue: No Project Managers in dropdown
**Solution:** Create at least one user with "Project Manager" role

### Issue: Notifications not appearing
**Solution:** 
- Ensure estimate status is "submitted" (not "draft")
- Check that users have isActive: true
- Verify notification panel is working

### Issue: Can't see Estimations tab
**Solution:** Ensure you're logged in as Estimator or Admin (not PM)

### Issue: Cost calculations incorrect
**Solution:** 
- Verify all cost fields are numbers (not empty)
- Check profit margin percentage
- Formula: Quoted Price = Total Cost × (1 + Profit Margin / 100)

## Test Data Suggestions

### Sample Structure:
- Type: "48-inch Manhole"
- Description: "Standard precast manhole with flat top"
- Quantity: 10
- Unit Cost: 1500
- Total: $15,000

### Sample Item to Purchase:
- Item: "Rebar #4"
- Category: "Materials"
- Supplier: "Steel Supply Co"
- Quantity: 200
- Unit Cost: 5.50
- Total: $1,100

### Sample Costs:
- Labor: $5,000
- Material: $8,000
- Equipment: $2,000
- Overhead: $1,500
- Total Cost: $16,500
- Profit Margin: 30%
- Quoted Price: $21,450

## Performance Testing

### Load Testing:
1. Create 50+ estimates with different statuses
2. Test filtering and search performance
3. Check notification load with multiple users

### Concurrent Users:
1. Have multiple estimators creating quotes simultaneously
2. Verify notifications are sent to all relevant users
3. Check for any race conditions

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)
- ✅ Mobile browsers (responsive design)

## Checklist Before Going Live

- [ ] All role permissions working correctly
- [ ] Notifications sent to correct users
- [ ] Cost calculations accurate
- [ ] PM assignment updates job correctly
- [ ] Search and filters working
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Database indexes created for performance
- [ ] All UI components rendering properly
- [ ] Error handling for API failures

## Support & Debugging

### Debug Mode:
Check browser console for:
- API request/response logs
- Any JavaScript errors
- Network tab for failed requests

### Database Queries:
```javascript
// Check estimates in MongoDB
db.estimates.find().pretty()

// Check notifications
db.notifications.find({ type: { $in: ['quote_created', 'quote_assigned'] } }).pretty()

// Check user roles
db.users.find({ role: { $in: ['Estimator', 'Project Manager', 'Admin'] } }).pretty()
```

## Success Criteria

✅ **Feature is successful when:**
1. Estimators can create and submit quotes easily
2. PMs receive timely notifications for new quotes
3. Admins have full visibility of all estimates
4. PM assignment workflow is smooth
5. Cost calculations are always accurate
6. UI is intuitive and responsive
7. No errors in production logs
8. Users provide positive feedback

---

**Happy Testing! 🚀**

For issues or questions, check the ESTIMATION_FEATURE_SUMMARY.md for technical details.

