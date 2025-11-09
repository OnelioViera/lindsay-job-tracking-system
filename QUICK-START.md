# Quick Start Guide

## 🎯 You Are Here

✅ Project initialized  
✅ Dependencies installed  
✅ Project structure created  
✅ User model created  
⏭️ **Next: Setup MongoDB & Environment**

---

## 🚀 Get Started in 5 Minutes

### Step 1: Setup MongoDB Atlas (5 min)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login
3. Create new project: "Lindsay Precast"
4. Build Database → Free M0 tier
5. Create cluster named: `lindsay-precast-cluster`
6. **Add Database User**:
   - Username: `lindsayprecast`
   - Password: Create something secure (save it!)
   - Privileges: Read and write to any database
7. **Add Network Access**:
   - IP: `0.0.0.0/0` (for development)
8. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Node.js driver v5.5+
   - Copy the connection string
   - Replace `<password>` with your actual password

### Step 2: Create `.env.local` (1 min)

In the project root folder:

```bash
# Copy the example
copy .env.example .env.local

# OR create manually and add these:
```

Add to `.env.local`:

```
# Database (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://lindsayprecast:<password>@lindsay-precast-cluster.xxxxx.mongodb.net/lindsay-precast?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-character-secret-key-here-12345678
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or if on Windows:
```powershell
# Use online generator or this Python one-liner:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 3: Test Connection (1 min)

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

✅ **Success! Your database is connected!**

---

## 📖 What's Next

Follow the roadmap in this order:

### This Week (Week 1)
- [ ] MongoDB Atlas setup (👈 You are here)
- [ ] Environment configuration
- [ ] NextAuth setup
- [ ] Login page

### Next Week (Week 2-3)
- [ ] Customer model
- [ ] Job model
- [ ] Dashboard
- [ ] Jobs table

### Following (Week 4+)
- [ ] Estimation module
- [ ] Drawings/Drafting
- [ ] Production tracking
- [ ] Inventory management

---

## 🆘 Troubleshooting

### "Cannot find module 'mongoose'"
```bash
npm install
```

### "MONGODB_URI is not defined"
- Check `.env.local` exists
- Verify MONGODB_URI is set
- Restart dev server

### "Database connection failed"
1. Check MongoDB Atlas IP whitelist
2. Verify username/password in connection string
3. Check network connectivity
4. Try connection string in MongoDB Compass

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

---

## 📚 Documentation

In Cursor, use `@` to reference docs:

- `@README.md` - Project overview
- `@docs/development/setup-guide.md` - Full setup steps
- `@docs/architecture/tech-stack.md` - Technologies used
- `@docs/database/customer-user-schemas.md` - Data models

---

## 💡 Tips

1. **Keep `.env.local` secret** - Add to `.gitignore` ✅ (already done)
2. **Test connection early** - Don't wait until later
3. **Use the docs** - Reference them with `@` in Cursor
4. **Commit frequently** - After each feature
5. **Ask Claude** - Use Cursor AI for help

---

## 🎓 Learning Resources

- Next.js: https://nextjs.org/docs
- MongoDB: https://docs.mongodb.com
- Mongoose: https://mongoosejs.com
- Shadcn UI: https://ui.shadcn.com
- NextAuth: https://next-auth.js.org

---

**Ready to continue? Ask me:**
- "Help me setup NextAuth authentication"
- "Create the Customer model"
- "Build the login page"
- Or reference any documentation with `@`

Good luck! 🚀

