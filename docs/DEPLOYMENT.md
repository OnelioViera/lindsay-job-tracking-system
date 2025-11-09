# Vercel Deployment Guide

## ✅ What's Ready

- ✅ Build passes (`npm run build` successful)
- ✅ TypeScript compiles with 0 errors
- ✅ Next.js 16 configured properly
- ✅ MongoDB connection setup
- ✅ NextAuth authentication configured
- ✅ All features tested locally

## ⚠️ Critical: File Upload Issue

**Current Issue:** The app saves uploaded quote files to `public/uploads/quotes/` which won't work on Vercel (read-only filesystem).

**Solutions:**

### Option 1: Vercel Blob Storage (Recommended)
```bash
npm install @vercel/blob
```

Then update `src/app/api/jobs/route.ts`:
```typescript
import { put } from '@vercel/blob';

// Replace the file write code with:
const blob = await put(filename, buffer, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

// Save blob.url to database instead of local path
```

### Option 2: Deploy Without File Uploads
Temporarily remove file upload functionality and deploy. Add cloud storage later.

---

## 📋 Environment Variables Required

Create these in your Vercel project settings:

### 1. Database
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```
- **Get from:** MongoDB Atlas (atlas.mongodb.com)
- **Required:** Yes

### 2. Authentication
```
NEXTAUTH_SECRET=your-random-secret-here
```
- **Generate with:** `openssl rand -base64 32`
- **Required:** Yes

```
NEXTAUTH_URL=https://your-app.vercel.app
```
- **Note:** Vercel sets this automatically, but you can override
- **Required:** Yes (auto-set by Vercel)

### 3. File Storage (if using Vercel Blob)
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```
- **Get from:** Vercel Dashboard > Storage > Blob
- **Required:** Only if using file uploads

---

## 🚀 Deployment Steps

### Step 1: Set Up MongoDB Atlas (Production Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create database user with password
4. Add IP: `0.0.0.0/0` (allow from anywhere - required for Vercel)
5. Get connection string (replace `<password>` with actual password)

### Step 2: Seed Production Database (Optional)

If you want to deploy with initial data:
```bash
# Set production MongoDB URI temporarily
MONGODB_URI=your-production-uri node scripts/seed.js
```

### Step 3: Deploy to Vercel

#### Option A: Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
5. Click "Deploy"

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET

# Deploy to production
vercel --prod
```

### Step 4: Post-Deployment

1. **Test authentication:** Try logging in with your seeded users
2. **Create a test job:** Verify job creation works
3. **Check notifications:** Ensure PM notifications work
4. **Test all roles:** Login as Admin, PM, and User

---

## 🔧 Configuration Files

### next.config.ts ✅
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```
- Already configured correctly for Vercel

### package.json ✅
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```
- Build and start scripts are correct

---

## 🐛 Common Issues

### Issue: "Failed to connect to database"
- **Solution:** Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- **Solution:** Verify connection string has correct password (URL encoded)

### Issue: NextAuth callback URL error
- **Solution:** Set `NEXTAUTH_URL` to your Vercel domain
- **Solution:** Check Vercel environment variables are set correctly

### Issue: File uploads fail
- **Solution:** Implement Vercel Blob Storage (see above)
- **Solution:** Or remove file upload feature temporarily

### Issue: Build fails on Vercel
- **Solution:** Run `npm run build` locally first to identify issues
- **Solution:** Check all imports are correct (case-sensitive on Linux)

---

## 📊 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Ready | NextAuth configured |
| Database | ✅ Ready | MongoDB connection works |
| Dashboard | ✅ Ready | Stats and cards working |
| Jobs CRUD | ✅ Ready | Create, read, update, delete |
| Notifications | ✅ Ready | PM notifications working |
| File Uploads | ⚠️ Needs Fix | Use Vercel Blob or remove |
| Role-Based Access | ✅ Ready | Admin/PM/User roles work |
| TypeScript | ✅ Ready | 0 errors |
| Build | ✅ Ready | Production build passes |

---

## 🔐 Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens used for sessions
- ✅ API routes protected with role checks
- ✅ Environment variables not committed
- ✅ CORS handled by Next.js
- ⚠️ Consider rate limiting for production (optional)

---

## 💰 Estimated Costs

- **Vercel Hobby (Free):** Includes hosting, SSL, analytics
- **MongoDB Atlas M0 (Free):** 512MB storage, shared cluster
- **Vercel Blob Storage:** ~$0.15/GB if you add file uploads

**Total:** $0/month to start (free tier)

---

## 📝 Next Steps After Deployment

1. **Custom Domain:** Add your own domain in Vercel settings
2. **Analytics:** Enable Vercel Analytics for insights
3. **Monitoring:** Set up error tracking (Sentry, LogRocket)
4. **Backups:** Schedule MongoDB Atlas backups
5. **File Storage:** Implement cloud storage for quotes
6. **Email Notifications:** Add SendGrid/Resend for email alerts

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/

