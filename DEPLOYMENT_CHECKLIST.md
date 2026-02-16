# 🚀 VERCEL DOMAIN CONNECTION - STEP BY STEP GUIDE

**Status: Your site isn't connecting because we haven't deployed yet**

This guide will take you through ACTUAL deployment in the exact order needed.

---

## ⏱️ Timeline
- **Step 1-3**: 5 minutes (deployment)
- **Step 4-5**: 24-48 hours (DNS propagation)
- **Step 6**: 5-30 minutes (SSL certificate)
- **Step 7**: Verify everything works

---

## 🔍 **STEP 1: Check Prerequisites (2 minutes)**

### On Your Computer:

**Check Node.js:**
```powershell
node --version  # Should be 18+
npm --version   # Should be 9+
git --version   # Should exist
```

**If any are missing**, install from:
- Node.js: https://nodejs.org (LTS version)
- Git: https://git-scm.com

### ✅ Verify all installed before proceeding to Step 2!

---

## 📝 **STEP 2: Install Dependencies (2 minutes)**

Go to your project folder and run:

```powershell
cd frontend
npm install
```

**Wait for completion** (should take 1-2 minutes)

### ✅ When done, proceed to Step 3

---

## 🔐 **STEP 3: Create Vercel Account & Deploy (3 minutes)**

### Option A: Deploy with Automated Script

**Windows PowerShell:**
```powershell
cd ..
cd scripts
.\deploy-vercel.ps1
```

**Follow these steps in the script:**
1. Vercel CLI will install
2. You'll be asked to log in (opens browser)
3. Create free Vercel account if you don't have one
4. Authorize the CLI
5. Link project to Vercel
6. Build and deploy automatically

### Option B: Deploy Manually

If the script doesn't work:

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Go to frontend folder
cd frontend

# Link project
vercel link

# Deploy to production
vercel --prod
```

**SAVE THE DEPLOYMENT URL** (looks like: `https://clinicindia-fit.vercel.app`)

### ✅ After deployment, you'll get a URL. Keep it for Step 5!

---

## 🌐 **STEP 4: Configure DNS at Your Registrar (5 minutes)**

**IMPORTANT: Do this BEFORE you get SSL certificate**

### Where is your domain registered?
- GoDaddy
- Namecheap
- Google Domains
- Other registrar

### For example, **if GoDaddy:**

1. Login to GoDaddy
2. Go to My Products → Domains
3. Click on `clinicindia.fit`
4. Go to "Manage DNS"
5. Find or create these records:

#### Record 1: www subdomain
```
Type: CNAME
Name: www
Value: cname.vercel.com
TTL: 3600
```

#### Record 2: Root domain (clinicindia.fit)
```
Type: A
Name: @ (or leave blank)
Value: 76.76.19.89 (or IP that Vercel gives you)
TTL: 3600
```

**Note:** Vercel will give you the exact IP to use. Check in:
- Vercel Dashboard → Your Project → Settings → Domains

### 🕐 **DNS takes 24-48 hours to propagate fully**
- Can start showing up in 5-15 minutes
- Check status: `nslookup clinicindia.fit`

### ✅ DNS is set, but wait for propagation before Step 5

---

## 🔑 **STEP 5: Add Environment Variables (3 minutes)**

While DNS is propagating, set up your secrets in Vercel:

### Go to Vercel Dashboard:
1. https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**

### Add these variables (REQUIRED):

```
DATABASE_URL = postgresql://user:password@host:5432/clinicindia
JWT_SECRET = [generate-random-key-below]
NEXTAUTH_SECRET = [generate-random-key-below]
NEXTAUTH_URL = https://clinicindia.fit
NEXT_PUBLIC_API_URL = https://clinicindia.fit/api
NODE_ENV = production
```

### 🔐 Generate Random Secrets:

**Option 1: Online Generator**
https://www.random.org/strings/

**Option 2: Using Node.js:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output and paste into Vercel for both JWT_SECRET and NEXTAUTH_SECRET**

### Optional Variables (for payments, email, etc.):
```
STRIPE_PUBLIC_KEY = pk_live_xxxxx
STRIPE_SECRET_KEY = sk_live_xxxxx
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASSWORD = your-app-password
AWS_ACCESS_KEY_ID = xxxxx
AWS_SECRET_ACCESS_KEY = xxxxx
AWS_S3_BUCKET = xxxxx
AWS_REGION = us-east-1
```

### 🔄 **AFTER adding variables: REDEPLOY**

In Vercel Dashboard:
1. Go to Deployments
2. Find the latest deployment
3. Click the 3-dots menu
4. Select "Redeploy"

### ✅ Environment variables are now set and live

---

## ✅ **STEP 6: Verify DNS Propagation (Wait & Check)**

### Check if DNS is working:

**Windows PowerShell:**
```powershell
nslookup clinicindia.fit
```

**Expected output:**
```
Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name: clinicindia.fit
Address: 76.76.19.89
```

**If you see an address (76.76.x.x), DNS is working!**

### Check in Vercel Dashboard:
1. Your Project → Settings → Domains
2. Should show "Valid Configuration" with green checkmark
3. SSL certificate should show "Valid" (may take 5-30 minutes)

### ⏳ **If showing error:**
- Wait another 5-10 minutes and refresh
- DNS can take up to 48 hours
- Check your registrar settings are correct

### ✅ DNS is working, now check SSL certificate

---

## 🔒 **STEP 7: Test Everything (5 minutes)**

### Test 1: Check if site loads
```powershell
# Open in browser
Start-Process "https://clinicindia.fit"
```

**Expected:** Site loads with your app

### Test 2: Check API endpoint
```powershell
curl https://clinicindia.fit/api/health
```

**Expected output:**
```json
{
  "status": "healthy",
  "message": "API is operational",
  "database": "connected"
}
```

### Test 3: Check SSL certificate
```powershell
openssl s_client -connect clinicindia.fit:443 -servername clinicindia.fit
```

**Expected:** Shows "Verify return code: 0 (ok)"

### Test 4: Try registration endpoint
```powershell
$body = @{
    email = "test@example.com"
    password = "TestPassword123"
    firstName = "Test"
    lastName = "User"
    role = "patient"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://clinicindia.fit/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected:** Should return user data and token (or error if user exists)

### ✅ All tests passing? YOU'RE LIVE! 🎉

---

## 🆘 **Troubleshooting**

### "Site not loading" / "Connection refused"

**Cause 1: DNS not yet propagated**
- **Solution:** Wait 24-48 hours
- Check: `nslookup clinicindia.fit`
- Should show Vercel IP (76.76.x.x)

**Cause 2: Environment variables not set**
- **Solution:** Go to Vercel Dashboard → Settings → Environment Variables
- Add DATABASE_URL with valid connection string
- Redeploy with "Redeploy" button

**Cause 3: Database connection failing**
- **Solution:** Test DATABASE_URL connection manually
- Make sure it's: `postgresql://user:password@host:port/dbname`
- Verify database is running and accessible

### "SSL certificate error"

**Cause:** Let's Encrypt certificate not yet issued
- **Solution:** Wait 5-30 minutes
- Check Vercel Dashboard → Domains → see certificate status
- Click "Force SSL" if available

### "API returning 500 error"

**Cause:** Environment variables or database issue
- **Solution:** Check Vercel logs
  ```powershell
  vercel logs
  ```
- Make sure DATABASE_URL is correct
- Verify JWT_SECRET is set

### "Cannot connect to database"

**Cause:** Database URL or network access
- **Solution:**
  1. Verify DATABASE_URL is correct
  2. Check database allows connections from Vercel IPs
  3. If using AWS RDS: Add Vercel security group
  4. If using Vercel Postgres: It's managed automatically

---

## 📋 **Complete Checklist**

- [ ] Node.js and npm installed
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Deployed to Vercel (`vercel --prod`)
- [ ] Got deployment URL from Vercel
- [ ] DNS records updated at registrar
- [ ] Environment variables set in Vercel
- [ ] Redeployed after adding variables
- [ ] DNS propagation verified (`nslookup`)
- [ ] SSL certificate issued (green in Vercel)
- [ ] Site loads at https://clinicindia.fit
- [ ] API health check works
- [ ] Registration endpoint works

---

## 🎯 **Expected Timeline**

| Step | Duration | Status |
|------|----------|--------|
| Prerequisites check | 2 min | ⏳ |
| Install dependencies | 2 min | ⏳ |
| Deploy to Vercel | 3 min | ⏳ |
| Configure DNS | 5 min | ⏳ |
| DNS propagation | 5 min - 48 hrs | ⏳ |
| Set env variables | 3 min | ⏳ |
| SSL certificate | 5-30 min | ⏳ |
| **Total** | **1-3 hours** | ⏳ |

---

## 📞 **Support**

If stuck on any step:

1. **Check Vercel logs:**
   ```powershell
   vercel logs
   vercel logs --level error
   ```

2. **Check DNS propagation:**
   - https://mxtoolbox.com/mxlookup.aspx (enter clinicindia.fit)
   - https://dns.google/query (search clinicindia.fit)

3. **Vercel Status Page:**
   - https://www.vercelstatus.com

4. **Documentation:**
   - https://vercel.com/docs
   - https://nextjs.org/docs

---

## 🚀 **Next Action**

**NOW: Follow Step 1-3 above to deploy**

Once deployed, come back and follow Step 4-7 to connect your domain.

**You're very close! Just need to execute the deployment.** ✨

