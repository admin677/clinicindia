# 🚀 Vercel Deployment - Ready to Deploy

Your ClinicIndia healthcare system is now fully configured for Vercel deployment!

## What's Been Done ✅

### Backend to Next.js API Conversion
- ✅ **Auth Routes**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`, `/api/auth/refresh`
- ✅ **Patient Routes**: `/api/patients` (GET/POST)
- ✅ **Doctor Routes**: `/api/doctors` (GET/POST)
- ✅ **Appointment Routes**: `/api/appointments` (GET/POST)
- ✅ **Medical Records**: `/api/medical-records` (GET/POST)
- ✅ **Prescriptions**: `/api/prescriptions` (GET/POST)
- ✅ **Billing**: `/api/billing` (GET/POST)
- ✅ **Notifications**: `/api/notifications` (GET/POST)

### Configuration Files
- ✅ **vercel.json** - Production Vercel configuration with API timeouts
- ✅ **Database Module** - `src/lib/db.ts` with connection pooling for serverless
- ✅ **Health Check** - `/api/health` endpoint for monitoring
- ✅ **Auth Middleware** - JWT token verification for protected routes
- ✅ **.env files** - Production and example configurations

### Package Dependencies
Added to `package.json`:
- `pg` - PostgreSQL client with proper pooling
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `uuid` - UUID generation for IDs

---

## 🎯 Quick Start (4 Steps)

### Step 1: Local Setup (5 minutes)
```bash
cd frontend
npm install
npm run build
```

### Step 2: Deploy to Vercel (Choose One)

**Option A: Windows PowerShell**
```powershell
cd scripts
.\deploy-vercel.ps1
```

**Option B: macOS/Linux Bash**
```bash
chmod +x scripts/deploy-vercel.sh
bash scripts/deploy-vercel.sh
```

**Option C: Manual Steps**
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull
vercel --prod
```

### Step 3: Configure DNS (15 minutes)
1. Get CNAME from Vercel Dashboard → Domains
2. Update DNS at your registrar:
   - Add CNAME: `www.clinicindia.fit` → `cname.vercel.com`
   - Add A record: `clinicindia.fit` → Vercel IP
3. Wait 5-30 minutes for DNS propagation

### Step 4: Set Environment Variables (5 minutes)
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add these variables from `.env.production`:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

4. Click "Redeploy" button

---

## 🔧 Database Setup

Choose ONE:

### Option 1: Vercel Postgres (Easiest)
```bash
vercel env add DATABASE_URL
# Follow prompts to create database
# Vercel automatically creates it
```

### Option 2: AWS RDS
1. Create PostgreSQL on AWS RDS (free tier available)
2. Get connection string: `postgresql://user:pass@host:5432/clinicindia`
3. `vercel env add DATABASE_URL` and paste connection string

### Option 3: Neon (Free Tier)
1. Go to neon.tech
2. Create project
3. Copy connection string
4. `vercel env add DATABASE_URL` and paste

---

## 📋 What Each API Route Does

### Authentication (`/api/auth/*`)
- **POST `/api/auth/register`** - Create new user account
- **POST `/api/auth/login`** - Login and get JWT token
- **GET `/api/auth/profile`** - Get current user profile (requires auth)
- **POST `/api/auth/refresh`** - Refresh JWT token (requires auth)

### Patients (`/api/patients`)
- **GET** - Get all patients
- **POST** - Create new patient profile

### Doctors (`/api/doctors`)
- **GET** - Get all doctors
- **POST** - Add new doctor (admin only)

### Appointments (`/api/appointments`)
- **GET** - Get appointments (role-based filtering)
- **POST** - Create new appointment

### Medical Records (`/api/medical-records`)
- **GET** - Get medical records (role-based)
- **POST** - Add medical record (doctors only)

### Prescriptions (`/api/prescriptions`)
- **GET** - Get prescriptions (role-based)
- **POST** - Create prescription (doctors only)

### Billing (`/api/billing`)
- **GET** - Get invoices
- **POST** - Create invoice

### Notifications (`/api/notifications`)
- **GET** - Get user notifications
- **POST** - Create notification (admin/system)

---

## ✅ Verification Checklist

After deployment, verify everything works:

```bash
# 1. Check frontend loads
curl -I https://clinicindia.fit

# 2. Check API health
curl https://clinicindia.fit/api/health

# 3. Check SSL certificate
openssl s_client -connect clinicindia.fit:443 </dev/null 2>&1 | grep "Verify return code"

# 4. Test user registration
curl -X POST https://clinicindia.fit/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123456",
    "firstName":"Test",
    "lastName":"User",
    "role":"patient"
  }'

# 5. Test login
curl -X POST https://clinicindia.fit/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test123456"
  }'
```

---

## 🛠️ Useful Vercel Commands

```bash
# View all deployments
vercel deployments

# View deployment logs (real-time)
vercel logs -f

# View specific service logs
vercel logs -f backend

# Rollback to previous deployment
vercel rollback

# List environment variables
vercel env ls

# Redeploy current code
vercel --prod

# Check project status
vercel status
```

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a random 32+ character string
- [ ] Change `NEXTAUTH_SECRET` to a random 32+ character string
- [ ] Update Stripe keys to production keys
- [ ] Configure SMTP with your email provider
- [ ] Enable 2FA on Vercel account
- [ ] Review environment variables monthly
- [ ] Never commit `.env.local` file
- [ ] Use strong database password
- [ ] Enable database backups
- [ ] Monitor API rate limiting

---

## 🚨 Troubleshooting

### API Routes Return 404
```bash
# Check route files are in correct location
ls frontend/src/app/api/auth/
# Should see: register, login, profile, refresh folders with route.ts files

# Rebuild if needed
cd frontend && npm run build
```

### Database Connection Error
```bash
# Test connection string locally
DATABASE_URL="your-string" npx psql -c "SELECT 1"

# Check it's added to Vercel
vercel env ls

# Re-add if missing
vercel env add DATABASE_URL
vercel --prod  # Redeploy
```

### SSL Certificate Not Issuing
1. Verify DNS is correctly configured
   ```bash
   nslookup clinicindia.fit
   ```
2. Wait 24-48 hours for propagation
3. Check Vercel dashboard for certificate status
4. Force renewal in dashboard if needed

### Build Fails
```bash
# Check TypeScript errors
npm run build

# Check linting errors
npm run lint

# View Vercel build logs
vercel logs --level error
```

---

## 📚 Documentation Files

- **VERCEL_DEPLOYMENT_GUIDE.md** - Detailed setup with all options
- **VERCEL_QUICK_REFERENCE.md** - Quick command reference
- **vercel.json** - Production configuration
- **frontend/.env.production** - Production environment template
- **frontend/.env.local.example** - Development environment template

---

## 💡 Pro Tips

1. **Test Locally First**
   ```bash
   npm run build
   npm run start
   # Visit http://localhost:3000
   ```

2. **Use Preview Deployments**
   - Every pull request gets automatic preview deployment
   - Perfect for testing before production

3. **Enable Analytics**
   - Vercel dashboard shows real-time metrics
   - Monitor performance and errors

4. **Set Up Alerts**
   - Vercel can notify you of deployment failures
   - Configure in Team Settings

5. **Monitor Costs**
   - Free tier: 100GB bandwidth/month
   - Check usage regularly to avoid overages

---

## 🎉 You're Ready!

Your application is production-ready with:
- ✅ Serverless backend (no server management)
- ✅ Auto-scaling (handles traffic spikes)
- ✅ Global CDN (fast for users worldwide)
- ✅ Automatic SSL/TLS certificates
- ✅ Zero-downtime deployments
- ✅ Instant rollbacks
- ✅ GitHub integration (auto-deploy on push)

**Next: Run the deployment script!**

```bash
# Windows
.\scripts\deploy-vercel.ps1

# macOS/Linux
bash scripts/deploy-vercel.sh
```

---

**Questions?** Check:
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Support](https://vercel.com/support)

**Last Updated:** February 2026
