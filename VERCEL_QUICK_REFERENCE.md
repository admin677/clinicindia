# Vercel Deployment Quick Reference

## One-Line Deployment

```bash
cd frontend && vercel --prod
```

---

## Essential Commands

### Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
cd frontend && vercel link

# Configure environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
# ... add all other vars
```

### Deployment
```bash
# Deploy to preview (for testing)
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# View deployment history
vercel deployments

# Rollback to previous deployment
vercel rollback
```

### Local Development
```bash
# Start local development server
npm run dev

# Test build locally
npm run build
npm start

# Pull environment variables
vercel env pull
```

---

## DNS Configuration (5 minutes)

1. **Get CNAME from Vercel:**
   - Vercel Dashboard → Project → Settings → Domains → Add Domain
   - Copy the CNAME value (usually `cname.vercel.com`)

2. **Update DNS at Registrar:**
   - For `www.clinicindia.fit`: Add CNAME record → `cname.vercel.com`
   - For `clinicindia.fit`: Add A record to IP Vercel provides

3. **Wait for Propagation:**
   - Usually 5-30 minutes
   - Check: `nslookup clinicindia.fit`

4. **SSL Certificate:**
   - Automatic! Vercel issues Let's Encrypt certificate
   - Check status in Vercel dashboard (green checkmark)

---

## Environment Variables Setup

### Get Values From:

**Stripe (Payments)**
- Go to https://dashboard.stripe.com/apikeys
- Copy Publishable and Secret keys

**Email (SMTP)**
- Gmail: Use "App Password" from Google Account
- Or use SendGrid/Mailgun API key

**JWT & NextAuth Secrets**
```bash
openssl rand -base64 32
```

**Database**
- Vercel Postgres: Created automatically
- External: Get connection string from provider

### Add to Vercel

```bash
# Via CLI (one at a time)
vercel env add VAR_NAME

# Or via Dashboard
# Project Settings → Environment Variables → Add
```

---

## Verification Checklist

After deployment:

```bash
# ✅ Check frontend loads
curl -I https://clinicindia.fit

# ✅ Check API health
curl https://clinicindia.fit/api/health

# ✅ Check SSL certificate
openssl s_client -connect clinicindia.fit:443 </dev/null

# ✅ Check DNS resolution
nslookup clinicindia.fit

# ✅ Test login endpoint
curl -X POST https://clinicindia.fit/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## Common Issues & Fixes

### "Cannot find module 'pg'"
```bash
cd frontend
npm install pg
npm run build
vercel --prod
```

### "DATABASE_URL not found"
```bash
# Check if variable is set
vercel env ls

# Add if missing
vercel env add DATABASE_URL

# Redeploy
vercel --prod
```

### "Build failed"
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run lint

# View Vercel logs for details
vercel logs --level error
```

### "SSL certificate not issuing"
1. Verify DNS is correct: `nslookup clinicindia.fit`
2. Wait 24-48 hours for full propagation
3. Force renewal in Vercel dashboard

### "API returning 404"
1. Verify route file is in `src/app/api/`
2. Check filename is `route.ts`
3. Ensure method is exported: `export async function POST()`
4. Redeploy: `vercel --prod`

---

## Database Setup Guides

### Use Vercel Postgres
```bash
vercel env add DATABASE_URL
# Follow Vercel prompts to create database
```

### Use AWS RDS
1. Create PostgreSQL database in AWS RDS
2. Get connection string
3. `vercel env add DATABASE_URL` and paste string

### Use Neon
1. Go to neon.tech
2. Create project
3. Copy connection string
4. `vercel env add DATABASE_URL` and paste string

---

## Performance Monitoring

### View Metrics
- Vercel Dashboard → Analytics
- Check: Response time, Edge requests, Bandwidth

### View Logs
```bash
vercel logs
vercel logs --level error
vercel logs --follow  # Real-time
```

### Web Vitals
- Vercel Dashboard → Web Vitals
- Monitor: LCP, FID, CLS

---

## Scaling & Costs

**Free Plan:**
- Unlimited deployments
- 100GB bandwidth/month
- Perfect for MVP/testing

**Pro Plan ($20/month):**
- 1TB bandwidth/month
- Unlimited functions
- Priority support

**Database Costs:**
- Vercel Postgres: $0/month (limited), then $15/month
- AWS RDS: Free tier (750 hours/month)
- Neon: Free tier (512MB), then $0.15/GB

---

## Backup & Disaster Recovery

### Backup Database
```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql.gz

# Schedule automated backups
# (Setup in database provider's dashboard)
```

### Rollback Deployment
```bash
# View deployments
vercel deployments

# Rollback with one command
vercel rollback
```

---

## Security Best Practices

- [ ] Never commit `.env` files to Git
- [ ] Use `vercel env add` for sensitive values
- [ ] Rotate JWT_SECRET every 90 days
- [ ] Enable 2FA on Vercel account
- [ ] Review environment variables monthly
- [ ] Monitor database access logs
- [ ] Enable CORS only for known domains

---

## Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Status:** https://www.vercelstatus.com

---

**Bookmark this for quick reference during deployment!**

Last Updated: February 2026
