# 🚀 Vercel Deployment Guide for ClinicIndia.fit

**Complete guide to deploy ClinicIndia on Vercel with PostgreSQL database.**

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Project Preparation](#project-preparation)
5. [Vercel Configuration](#vercel-configuration)
6. [Deployment Steps](#deployment-steps)
7. [Environment Variables](#environment-variables)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Vercel?
- ✅ Built for Next.js (auto-optimization, preview deploys, edge network)
- ✅ Serverless backend (no server management)
- ✅ Automatic SSL/TLS certificates
- ✅ Global CDN for fast content delivery
- ✅ Built-in CI/CD with GitHub integration
- ✅ Instant rollbacks and zero-downtime deployments
- ✅ Free tier available for getting started

### Architecture
```
GitHub → Vercel (Frontend + Backend API Routes)
         ↓
      PostgreSQL Database (Vercel Postgres or External)
```

---

## Prerequisites

### 1. Accounts You Need
- [ ] GitHub account (for code hosting)
- [ ] Vercel account (free at vercel.com)
- [ ] Domain registered (clinicindia.fit)
- [ ] Email for SSL certificates (admin@clinicindia.fit)

### 2. Tools Required
```bash
npm install -g vercel
```

### 3. Verify Node.js Version
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

---

## Database Setup

### Option 1: Vercel Postgres (Recommended for Simplicity)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Create PostgreSQL database
vercel env add DATABASE_URL
# Follow prompts to create Vercel Postgres database
```

**Pros:**
- Automatic backups
- Built into Vercel dashboard
- No separate account needed

**Cons:**
- Limited free tier (up to 3 databases, 256 MB each)

### Option 2: AWS RDS PostgreSQL
```
1. Go to AWS RDS console
2. Create PostgreSQL database (db.t3.micro free tier)
3. Enable public accessibility
4. Create security group allowing port 5432
5. Get connection string: postgresql://user:password@endpoint:5432/dbname
```

**Pros:**
- More scalable
- 12 months free tier (750 hours/month)

**Cons:**
- Requires AWS account setup

### Option 3: Neon PostgreSQL (Alternative)
```
1. Go to neon.tech
2. Create project
3. Get connection string
4. Use in Vercel environment
```

**Pros:**
- Free tier: 512 MB storage, unlimited projects
- Branching support

---

## Project Preparation

### Step 1: Restructure Backend Routes as API Routes

Convert Express routes to Next.js API routes:

```bash
# Create API route structure
mkdir -p frontend/src/app/api/auth
mkdir -p frontend/src/app/api/patients
mkdir -p frontend/src/app/api/doctors
mkdir -p frontend/src/app/api/appointments
mkdir -p frontend/src/app/api/medical-records
mkdir -p frontend/src/app/api/prescriptions
mkdir -p frontend/src/app/api/billing
mkdir -p frontend/src/app/api/notifications
```

**Example: Convert auth route to API route**

**From:** `backend/src/routes/auth.js`
```javascript
router.post('/register', async (req, res) => {
  // validation, hashing, database
  res.json({ token });
});
```

**To:** `frontend/src/app/api/auth/register/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Insert into database
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
      [email, hashedPassword, name, 'patient']
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      { user: result.rows[0], token },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### Step 2: Create Database Connection Module

Create `frontend/src/lib/db.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
```

### Step 3: Install PostgreSQL Client

```bash
cd frontend
npm install pg
```

### Step 4: Update Frontend Environment

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://user:password@localhost:5432/clinicindia
JWT_SECRET=your-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret
STRIPE_PUBLIC_KEY=your-stripe-public-key
```

### Step 5: Create vercel.json Configuration

Create `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "nodeVersion": "18.x",
  "env": {
    "DATABASE_URL": "@DATABASE_URL",
    "JWT_SECRET": "@JWT_SECRET",
    "NEXTAUTH_SECRET": "@NEXTAUTH_SECRET"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "redirects": [
    {
      "source": "/api/health",
      "destination": "/api/system/health",
      "permanent": false
    }
  ]
}
```

---

## Vercel Configuration

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Link Project to Vercel

```bash
cd frontend
vercel link
# Follow prompts to create/link to Vercel project
```

### Step 3: Set Environment Variables

**Option A: Via CLI**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add STRIPE_PUBLIC_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
```

**Option B: Via Dashboard**
1. Go to vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all required variables

### Step 4: Connect Custom Domain

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add domain: `clinicindia.fit`
3. Add subdomain: `www.clinicindia.fit`
4. Follow Vercel's DNS instructions:
   - Add CNAME: `www.clinicindia.fit → cname.vercel.com`
   - Update A records as shown
5. Wait for SSL certificate (automatic, usually 5-30 minutes)

---

## Deployment Steps

### Step 1: Prepare Repository

```bash
# Make sure all code is committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Automatic (Recommended)**
1. Connect GitHub to Vercel (if not already connected)
2. Every push to `main` automatically deploys

**Option B: Manual**
```bash
cd frontend
vercel --prod
```

### Step 3: Set Database

If using Vercel Postgres:
```bash
vercel env pull  # Pull env from Vercel to local
```

If using external database, update environment variables in Vercel dashboard.

### Step 4: Run Database Migrations

```bash
# Create migration script: frontend/src/scripts/migrate.ts
vercel env add DATABASE_URL
node scripts/migrate.ts
```

Or add to `package.json`:
```json
{
  "scripts": {
    "db:migrate": "node scripts/migrate.ts"
  }
}
```

---

## Environment Variables

### Required Variables for Production

```bash
# Database
DATABASE_URL=postgresql://user:password@db-host:5432/clinicindia

# Authentication
JWT_SECRET=your-super-secret-random-string-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
NEXTAUTH_URL=https://clinicindia.fit

# Email/SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Stripe (Payments)
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional: Third-party integrations
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://clinicindia.fit/api
```

### Generate Secure Secrets

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

---

## Post-Deployment

### Step 1: Verify Deployment

```bash
# Test frontend
curl https://clinicindia.fit

# Test API health
curl https://clinicindia.fit/api/health

# Test login endpoint
curl -X POST https://clinicindia.fit/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Step 2: Setup Custom Domain

1. Update DNS at registrar:
   - A record: `@ → Vercel IP`
   - CNAME record: `www → cname.vercel.com`

2. Verify in Vercel dashboard (should show "Valid Configuration")

3. Wait for SSL certificate (shows green checkmark)

### Step 3: Setup Continuous Deployment

1. GitHub → Vercel integration automatically deploys on push
2. Enable "Preview Deployments" for pull requests
3. Set environment for each deployment type

### Step 4: Configure Monitoring

```bash
# Monitor deployments
vercel logs

# View error logs
vercel logs --level error

# Real-time logs
vercel logs --follow
```

---

## Troubleshooting

### Issue: "DATABASE_URL not found"
**Solution:**
```bash
# Verify environment variable is set
vercel env ls

# Re-add if missing
vercel env add DATABASE_URL

# Redeploy
vercel --prod
```

### Issue: SSL Certificate not issuing
**Solution:**
1. Verify DNS is correctly configured: `nslookup clinicindia.fit`
2. Wait 24-48 hours for full propagation
3. Check Vercel dashboard for status
4. Force renewal: Go to Domains → Advanced → Force SSL

### Issue: API routes returning 404
**Solution:**
1. Verify file is in `src/app/api/` directory
2. Check filename follows Next.js convention: `route.ts`
3. Ensure method is exported: `export async function POST()`
4. Redeploy: `vercel --prod`

### Issue: Database connection timeout
**Solution:**
```bash
# Check connection string format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Verify network allows connections
# Check firewall/security groups
```

### Issue: Build failing
**Solution:**
```bash
# Check build locally first
npm run build

# View build logs in Vercel dashboard
# Settings → Deployments → Failed deployment → Logs

# Common causes:
# - TypeScript errors: npm run lint
# - Missing dependencies: npm install
# - Environment variables not set: vercel env ls
```

### Issue: Functions timing out (>60 seconds)
**Solution:**
- Set custom timeout in `vercel.json`:
```json
{
  "functions": {
    "src/app/api/long-running/**/*.ts": {
      "maxDuration": 300
    }
  }
}
```

### Issue: High costs/overages
**Solution:**
- Use serverless function optimization
- Implement caching headers
- Use Vercel Analytics to identify slow routes
- Consider database connection pooling

---

## Performance Optimization

### 1. Enable Caching Headers

Add to `frontend/vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, s-maxage=60, stale-while-revalidate=120" }
      ]
    }
  ]
}
```

### 2. Use Incremental Static Generation

```typescript
// frontend/src/app/doctors/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function DoctorsPage() {
  const doctors = await fetch('https://clinicindia.fit/api/doctors', {
    next: { revalidate: 3600 }
  }).then(r => r.json());
  
  return (/* render doctors */);
}
```

### 3. Implement API Response Caching

```typescript
// frontend/src/app/api/doctors/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.json(doctors);
  response.headers.set('Cache-Control', 'public, s-maxage=300');
  return response;
}
```

### 4. Monitor Performance

1. Vercel Analytics Dashboard
2. Web Vitals monitoring
3. Real User Monitoring (RUM)

---

## Scaling on Vercel

### Free Plan
- Unlimited deployments
- 100GB bandwidth/month
- 12 serverless functions
- Good for: MVP, testing, small production sites

### Pro Plan ($20/month)
- 1TB bandwidth/month
- Unlimited serverless functions
- Priority support
- Good for: Growing applications

### Enterprise Plan
- Custom pricing
- Dedicated support
- SLA guarantees
- Good for: Healthcare/compliance requirements

---

## Database Scaling Options

### For Vercel Postgres (limited free tier)
- Upgrade to paid plan for more storage
- Or use external database provider

### For AWS RDS
- Start with db.t3.micro (free tier)
- Scale to db.t3.small ($40/month)
- Use read replicas for scaling

### For Neon
- Free tier: 512 MB
- Paid tier: 3 GB + $0.15/GB overage
- Auto-scaling available

---

## Security Checklist

- [ ] Enable 2FA on GitHub & Vercel accounts
- [ ] Rotate JWT_SECRET and NEXTAUTH_SECRET every 90 days
- [ ] Use separate environment variables for production
- [ ] Enable audit logging in Vercel dashboard
- [ ] Setup branch protection on main branch
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Implement rate limiting on API routes
- [ ] Setup DDoS protection (included with Vercel)
- [ ] Regular security audits: `npm audit fix`
- [ ] Enable database encryption at rest

---

## Rollback Procedure

```bash
# View deployment history
vercel deployments

# Rollback to previous deployment
vercel rollback

# Or use Vercel dashboard:
# Deployments → Click on previous version → Promote to Production
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: Tag with `vercel` for quick help

---

**Your application is now ready for production on Vercel! 🚀**

Last Updated: February 2026
