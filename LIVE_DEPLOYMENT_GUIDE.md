# Live Deployment & DNS Configuration Guide

## 🌐 Domain Setup: clinicindia.fit

### Step 1: Update DNS Records

You need to point your domain to your server. Go to your domain registrar (where you bought clinicindia.fit) and update these DNS records:

#### A Records (Required)
```
Type: A
Name: @
Value: YOUR_SERVER_IP_ADDRESS
TTL: 3600

Type: A
Name: www
Value: YOUR_SERVER_IP_ADDRESS
TTL: 3600
```

#### CNAME Records (Optional, for API subdomain)
```
Type: CNAME
Name: api
Value: clinicindia.fit
TTL: 3600
```

#### MX Records (For Email - Optional)
```
Type: MX
Name: @
Value: mail.protonmail.com (or your email provider)
TTL: 3600
Priority: 10
```

### Step 2: DNS Propagation

DNS changes take 24-48 hours to propagate globally. Check propagation:
```bash
# Check DNS propagation
nslookup clinicindia.fit
dig clinicindia.fit
```

### Step 3: Verify DNS Resolution

```bash
# Wait for DNS to resolve
ping clinicindia.fit

# Should return your server IP address
```

---

## 🚀 Server Deployment

### Option A: AWS EC2 Deployment (Recommended)

#### 1. Launch EC2 Instance
```bash
# Instance type: t3.small or larger
# OS: Ubuntu 20.04 LTS or 22.04 LTS
# Storage: 50GB+ SSD
# Security Group: Allow ports 22, 80, 443
```

#### 2. SSH into Server
```bash
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP
```

#### 3. Setup Server
```bash
# Clone your repository
cd /var/www
git clone https://github.com/your-org/clinicindia.fit.git
cd clinicindia.fit

# Run setup script
sudo bash scripts/setup-production.sh
```

#### 4. Configure Environment
```bash
sudo cp .env.production .env
sudo nano .env  # Edit with your production values
```

#### 5. Deploy with Docker
```bash
sudo docker-compose -f docker-compose.yml up -d
```

---

### Option B: DigitalOcean Deployment

#### 1. Create Droplet
```bash
- Size: $24/month or higher
- OS: Ubuntu 22.04 x64
- Datacenter: Closest to your users
- Enable Backups
```

#### 2. SSH Access
```bash
ssh root@YOUR_DROPLET_IP
```

#### 3. Follow same steps as AWS above

---

### Option C: Azure Deployment

#### 1. Create Virtual Machine
```bash
# Using Azure CLI
az vm create \
  --resource-group myResourceGroup \
  --name clinicindia-vm \
  --image UbuntuLTS \
  --size Standard_B2s \
  --admin-username azureuser
```

#### 2. SSH into VM
```bash
ssh azureuser@YOUR_VM_IP
```

#### 3. Deploy application

---

### Option D: Google Cloud Deployment

#### 1. Create VM Instance
```bash
# Using gcloud CLI
gcloud compute instances create clinicindia \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-medium \
  --zone=us-central1-a
```

#### 2. SSH into Instance
```bash
gcloud compute ssh clinicindia --zone=us-central1-a
```

#### 3. Deploy application

---

## 🔒 SSL/TLS Certificate Setup

### Automatic SSL Setup (Using Certbot in Docker)

The Docker Compose file includes automatic SSL setup. Just follow these steps:

#### 1. Update DNS First
Make sure your domain points to the server IP before running the next steps.

#### 2. Create Directories
```bash
mkdir -p certbot/conf
mkdir -p certbot/www
```

#### 3. Initial Certificate
```bash
docker-compose exec certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d clinicindia.fit \
  -d www.clinicindia.fit \
  --email admin@clinicindia.fit \
  --agree-tos \
  --non-interactive
```

#### 4. Verify Certificate
```bash
docker-compose exec certbot certbot certificates
```

#### 5. Auto-Renewal
Certificate renewal is automatic via the certbot container in docker-compose.

---

## 🔄 Deployment Steps

### Full Deployment Procedure

```bash
# 1. SSH into your server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# 2. Navigate to app directory
cd /var/www/clinicindia

# 3. Make deploy script executable
sudo chmod +x scripts/deploy-live.sh

# 4. Run deployment
sudo bash scripts/deploy-live.sh

# 5. Check status
docker-compose ps
docker-compose logs -f
```

---

## ✅ Verification Checklist

After deployment, verify everything is working:

### Frontend
```bash
# Test frontend
curl -I https://clinicindia.fit

# Should return HTTP 200 or 301
```

### Backend API
```bash
# Test backend health
curl https://clinicindia.fit/api/health

# Should return JSON status
```

### SSL Certificate
```bash
# Check certificate
openssl s_client -connect clinicindia.fit:443

# Verify in browser - no certificate warnings
```

### Database
```bash
# Check database connection
docker-compose exec postgres pg_isready -U postgres

# Should return: accepting connections
```

### Services Status
```bash
# Check all services
docker-compose ps

# All should show "Up"
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Follow real-time
docker-compose logs -f
```

### Container Status
```bash
docker-compose ps
docker stats
```

### System Resource Usage
```bash
top
htop
df -h
```

---

## 🔧 Troubleshooting

### Issue: Domain not resolving
```bash
# Check DNS
nslookup clinicindia.fit
dig clinicindia.fit

# Wait 24-48 hours for DNS propagation
```

### Issue: SSL certificate errors
```bash
# Force certificate renewal
docker-compose exec certbot certbot renew --force-renewal

# Check certificate
docker-compose exec certbot certbot certificates
```

### Issue: Backend not responding
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Check port 5000
netstat -tulpn | grep 5000
```

### Issue: Frontend not loading
```bash
# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend

# Check port 3000
netstat -tulpn | grep 3000
```

### Issue: Database connection errors
```bash
# Check PostgreSQL
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Check database
docker-compose exec postgres psql -U postgres -c "SELECT 1;"
```

---

## 🛡️ Security Best Practices

### 1. Update Production Secrets
```bash
# Never use example values in production!
# Generate strong passwords
openssl rand -base64 32

# Update .env.production
sudo nano .env.production
```

### 2. Enable Firewall
```bash
# Allow necessary ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Regular Backups
```bash
# Automated daily backups
sudo crontab -e

# Add this line for daily 2 AM backup:
0 2 * * * cd /var/www/clinicindia && sudo docker-compose exec -T postgres pg_dump -U postgres clinicindia | gzip > /var/backups/clinicindia/backup_$(date +\%Y\%m\%d).sql.gz
```

### 4. Monitor Logs
```bash
# Keep monitoring for errors
docker-compose logs -f --tail=100
```

### 5. Update System
```bash
# Regular security updates
sudo apt-get update
sudo apt-get upgrade -y
```

---

## 📈 Performance Optimization

### Enable Caching
Redis is included in docker-compose for session/cache storage:
```bash
# Redis is available on localhost:6379
```

### Database Optimization
```bash
# Check query performance
docker-compose exec postgres psql -U postgres clinicindia
\dt  -- List tables
\di  -- List indexes
```

### Monitor Performance
```bash
# Docker stats
docker stats

# System resources
free -h
```

---

## 🔄 Update & Maintenance

### Deploy Updates
```bash
# Pull latest code
cd /var/www/clinicindia
git pull origin main

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose down
docker-compose up -d
```

### Database Maintenance
```bash
# Vacuum (optimize)
docker-compose exec postgres psql -U postgres clinicindia -c "VACUUM ANALYZE;"

# Backup
pg_dump clinicindia > backup.sql
```

---

## 🆘 Emergency Recovery

### Restore from Backup
```bash
# Stop services
docker-compose down

# Restore database
docker-compose up -d postgres
sleep 10
docker-compose exec postgres psql -U postgres clinicindia < backup_20240101.sql.gz

# Restart all services
docker-compose up -d
```

### Rollback Deployment
```bash
# Go to previous version
git checkout previous-commit-hash
docker-compose build --no-cache
docker-compose down
docker-compose up -d
```

---

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify DNS: `nslookup clinicindia.fit`
3. Test connectivity: `curl https://clinicindia.fit`
4. Check system resources: `df -h` and `free -h`

---

**Last Updated**: February 2024
**Version**: 1.0.0
