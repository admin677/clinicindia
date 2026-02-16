# 🚀 LIVE DEPLOYMENT & WEBSITE LAUNCH GUIDE

## Overview

Your **clinicindia.fit** healthcare management system is ready to go live! This guide walks you through the complete process of deploying the application and making it accessible worldwide.

---

## 📋 Pre-Deployment Checklist

- [ ] Domain **clinicindia.fit** registered
- [ ] Server/VPS selected (AWS, DigitalOcean, Azure, GCP, etc.)
- [ ] Server IP address obtained
- [ ] SSH access configured
- [ ] All secrets and API keys ready
- [ ] SSL certificate plan decided (we'll use free Let's Encrypt)

---

## 🌐 STEP 1: Domain DNS Configuration

### Update DNS Records at Your Registrar

Login to where you bought **clinicindia.fit** and add these DNS records:

#### Required A Records
```
Record 1:
  Type: A
  Name: @ (or leave blank)
  Value: YOUR_SERVER_IP_ADDRESS
  TTL: 3600

Record 2:
  Type: A
  Name: www
  Value: YOUR_SERVER_IP_ADDRESS
  TTL: 3600
```

#### Optional CNAME Records
```
Record 3 (Optional):
  Type: CNAME
  Name: api
  Value: clinicindia.fit
  TTL: 3600
```

### Verify DNS Changes
```bash
# Check if DNS is resolving (may take 24-48 hours)
nslookup clinicindia.fit
dig clinicindia.fit

# Should show your server IP
```

---

## 🖥️ STEP 2: Server Setup

### Choose Your Cloud Provider

**Recommended Options:**

| Provider | Monthly Cost | Setup | Docs |
|----------|-------------|-------|------|
| **AWS EC2** | $10-20 | ⭐⭐ Easy | [Link](https://aws.amazon.com/ec2/) |
| **DigitalOcean** | $12-24 | ⭐ Very Easy | [Link](https://www.digitalocean.com/) |
| **Azure** | $15-30 | ⭐⭐ Easy | [Link](https://azure.microsoft.com/) |
| **Google Cloud** | $10-25 | ⭐⭐ Easy | [Link](https://cloud.google.com/) |
| **Linode** | $12-24 | ⭐ Very Easy | [Link](https://www.linode.com/) |

### Minimum Server Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 20.04 LTS or 22.04 LTS
- **Bandwidth**: Unlimited (typically)

### Launch Your Server

**AWS EC2 Example:**
```bash
1. Go to AWS Console > EC2
2. Click "Launch Instance"
3. Select Ubuntu 22.04 LTS
4. Choose t3.small instance
5. Configure: 50GB storage, security group allow ports 22, 80, 443
6. Launch and download .pem key file
```

**DigitalOcean Example:**
```bash
1. Go to digitalocean.com/register
2. Click "Create" > "Droplets"
3. Select Ubuntu 22.04
4. Choose $12/month (4GB RAM)
5. Select your region (closest to users)
6. Add SSH key or use password
7. Create Droplet
```

### Connect to Your Server
```bash
# AWS/GCP/Others with .pem key
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# DigitalOcean/Simple password
ssh root@YOUR_SERVER_IP

# First time, accept the fingerprint
```

---

## 🔧 STEP 3: Automated Server Setup

Once connected to your server:

```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/your-username/clinicindia.fit.git
cd clinicindia.fit

# Make scripts executable
sudo chmod +x scripts/*.sh

# Run setup (takes 10-15 minutes)
sudo bash scripts/setup-production.sh
```

This script automatically installs:
- ✅ Node.js & npm
- ✅ PostgreSQL database
- ✅ Docker & Docker Compose
- ✅ Nginx web server
- ✅ Certbot for SSL certificates
- ✅ PM2 for process management
- ✅ Firewall rules

---

## 📝 STEP 4: Configure Environment Variables

### Create Production Configuration
```bash
# Copy production environment file
sudo cp .env.production .env

# Edit with your values
sudo nano .env
```

### Generate Secure Secrets
```bash
# Generate JWT Secret (use this in .env)
openssl rand -base64 32

# Generate NextAuth Secret (use this in .env)
openssl rand -base64 32

# Generate Bcrypt rounds (typically 12 for production)
```

### Update Critical Values
```env
# Database
DB_PASSWORD=YOUR_SECURE_DATABASE_PASSWORD
DB_HOST=postgres
DB_USER=postgres
DB_NAME=clinicindia

# JWT & Auth
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
NEXTAUTH_SECRET=YOUR_GENERATED_NEXTAUTH_SECRET_HERE

# Email (Optional - Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_KEY
STRIPE_PUBLIC_KEY=pk_live_YOUR_STRIPE_KEY

# Domain
CORS_ORIGIN=https://clinicindia.fit
NEXT_PUBLIC_API_URL=https://clinicindia.fit/api
NEXTAUTH_URL=https://clinicindia.fit
```

---

## 🚀 STEP 5: Deploy Application

### Start All Services with Docker
```bash
# Navigate to app directory
cd /var/www/clinicindia.fit

# Deploy
sudo docker-compose -f docker-compose.yml up -d

# Wait 30 seconds for services to start
sleep 30

# Check status
sudo docker-compose ps
```

### Verify All Containers Running
```bash
# Should see all containers in "Up" state:
# - postgres
# - backend
# - frontend
# - redis
# - nginx
# - certbot
```

---

## 🔒 STEP 6: Setup SSL Certificate

### Request SSL Certificate from Let's Encrypt

```bash
# Make certbot directories
sudo mkdir -p /var/www/certbot
sudo mkdir -p /var/www/certbot/conf

# Request certificate (DNS must already be pointing to server)
sudo docker-compose exec certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d clinicindia.fit \
  -d www.clinicindia.fit \
  --email admin@clinicindia.fit \
  --agree-tos \
  --non-interactive
```

### Verify Certificate
```bash
sudo docker-compose exec certbot certbot certificates

# Should show:
# - Valid certificate for clinicindia.fit
# - Expires in ~90 days
# - Auto-renewal configured
```

### Test HTTPS
```bash
# Should return 200 with valid certificate
curl https://clinicindia.fit

# Check certificate details
openssl s_client -connect clinicindia.fit:443 </dev/null
```

---

## ✅ STEP 7: Verification & Testing

### Health Checks

```bash
# 1. Check Frontend
curl -I https://clinicindia.fit
# Expected: HTTP/1.1 200 OK or 301 Redirect

# 2. Check Backend
curl https://clinicindia.fit/api/health
# Expected: {"status":"OK","timestamp":"...","service":"clinicindia-backend"}

# 3. Check Database
sudo docker-compose exec postgres pg_isready -U postgres
# Expected: accepting connections

# 4. Check SSL
echo | openssl s_client -servername clinicindia.fit -connect clinicindia.fit:443
# Should show valid certificate
```

### Browse Your Website
```
Open in browser: https://clinicindia.fit
```

### Useful Monitoring Commands
```bash
# View all logs
sudo docker-compose logs -f

# View specific service
sudo docker-compose logs -f backend
sudo docker-compose logs -f frontend
sudo docker-compose logs -f postgres

# Container status
sudo docker-compose ps

# System resources
sudo docker stats
top
```

---

## 🎯 After Going Live

### 1. Setup Automated Backups
```bash
# Edit crontab
sudo crontab -e

# Add daily backup at 2 AM:
0 2 * * * cd /var/www/clinicindia.fit && sudo docker-compose exec -T postgres pg_dump -U postgres clinicindia | gzip > /var/backups/clinicindia/backup_$(date +\%Y\%m\%d).sql.gz
```

### 2. Monitor Application
```bash
# Keep logs running
sudo docker-compose logs -f --tail=100

# Or use monitoring service (NewRelic, DataDog, etc.)
```

### 3. Setup Email Notifications
Edit `.env` with your SMTP settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-clinic-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 4. Setup Payment Processing (Optional)
Add Stripe keys to `.env`:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
```

### 5. Configure Admin Account
```bash
# Access PostgreSQL
sudo docker-compose exec postgres psql -U postgres clinicindia

# Create admin user (via API)
curl -X POST https://clinicindia.fit/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinicindia.fit",
    "password": "SecurePassword123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

---

## 🔧 Maintenance & Updates

### Regular Maintenance
```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Check disk space
df -h

# Check memory
free -h

# Database maintenance
sudo docker-compose exec postgres psql -U postgres clinicindia -c "VACUUM ANALYZE;"
```

### Deploy Updates
```bash
# Pull latest code
cd /var/www/clinicindia.fit
sudo git pull origin main

# Rebuild and restart
sudo docker-compose build --no-cache
sudo docker-compose down
sudo docker-compose up -d

# Run migrations if needed
# Wait for PostgreSQL to be healthy first
```

---

## 🆘 Troubleshooting

### Domain not working
```bash
# Check DNS propagation (wait 24-48 hours)
nslookup clinicindia.fit

# Check if server is running
sudo docker-compose ps

# Check Nginx
sudo docker-compose logs nginx
```

### SSL certificate issues
```bash
# Force renewal
sudo docker-compose exec certbot certbot renew --force-renewal

# Check expiration
sudo docker-compose exec certbot certbot certificates
```

### Backend not responding
```bash
# Check logs
sudo docker-compose logs backend

# Restart backend
sudo docker-compose restart backend

# Check port 5000
sudo netstat -tulpn | grep 5000
```

### Frontend blank page
```bash
# Check frontend logs
sudo docker-compose logs frontend

# Restart frontend
sudo docker-compose restart frontend

# Check browser console for errors
```

### Database errors
```bash
# Check PostgreSQL
sudo docker-compose logs postgres

# Check database connection
sudo docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# Restart database
sudo docker-compose restart postgres
```

---

## 📊 Performance Tips

1. **Enable caching** - Redis is included
2. **Use CDN** - CloudFlare for static assets
3. **Database indexing** - Already configured
4. **Monitor logs** - Set up alerts
5. **Regular backups** - Automated daily
6. **Security updates** - Enable auto-updates

---

## 🎉 Success Checklist

- [x] Domain points to server
- [x] Server running with all services
- [x] SSL certificate installed and valid
- [x] Backend API responding
- [x] Frontend loads correctly
- [x] Database connected
- [x] Emails configured
- [x] Backups automated
- [x] Monitoring setup
- [x] Admin account created

---

## 🌍 Your Website is Live!

**🎊 Congratulations! Your healthcare management system is now live at:**

## **https://clinicindia.fit**

---

**Need Help?**
- Check logs: `sudo docker-compose logs -f`
- Restart services: `sudo docker-compose restart`
- Server status: `sudo docker-compose ps`
- System health: `df -h && free -h`

**Built with ❤️ by World-Class Healthcare Developers**
