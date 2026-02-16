# 🚀 Quick Deployment Reference

## One-Command Deployment

After SSH into your server, run:

```bash
cd /var/www && git clone https://github.com/YOUR-ORG/clinicindia.fit.git && cd clinicindia.fit && sudo bash scripts/setup-production.sh && sudo cp .env.production .env && sudo nano .env && sudo docker-compose up -d && sudo docker-compose exec certbot certbot certonly --webroot -w /var/www/certbot -d clinicindia.fit -d www.clinicindia.fit --email admin@clinicindia.fit --agree-tos --non-interactive
```

---

## Essential Commands Cheat Sheet

### Docker Commands
```bash
# Start services
sudo docker-compose up -d

# Stop services
sudo docker-compose down

# View logs (real-time)
sudo docker-compose logs -f

# View specific service logs
sudo docker-compose logs -f backend
sudo docker-compose logs -f frontend
sudo docker-compose logs -f postgres

# Status of all containers
sudo docker-compose ps

# Restart a service
sudo docker-compose restart backend

# Execute command in container
sudo docker-compose exec backend npm run db:migrate

# Build images
sudo docker-compose build --no-cache
```

### Database Commands
```bash
# Connect to PostgreSQL
sudo docker-compose exec postgres psql -U postgres clinicindia

# Backup database
sudo docker-compose exec -T postgres pg_dump -U postgres clinicindia | gzip > backup.sql.gz

# Restore database
sudo docker-compose exec postgres psql -U postgres clinicindia < backup.sql.gz

# Check database size
sudo docker-compose exec postgres psql -U postgres clinicindia -c "SELECT pg_size_pretty(pg_database_size('clinicindia'));"
```

### SSL/Certificate Commands
```bash
# Check certificate status
sudo docker-compose exec certbot certbot certificates

# Renew certificate manually
sudo docker-compose exec certbot certbot renew --force-renewal

# View certificate details
echo | openssl s_client -servername clinicindia.fit -connect clinicindia.fit:443

# Check certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/clinicindia.fit/cert.pem
```

### System Commands
```bash
# Check disk space
df -h

# Check memory usage
free -h

# View running processes
top

# Check open ports
sudo netstat -tulpn

# View system logs
sudo journalctl -xe

# Update system
sudo apt-get update && sudo apt-get upgrade -y
```

### Monitoring Commands
```bash
# Real-time container stats
sudo docker stats

# View all container logs
sudo docker-compose logs

# Monitor specific service
watch 'sudo docker-compose logs --tail=20 backend'

# Check Nginx errors
sudo docker-compose logs nginx

# Check API health
curl https://clinicindia.fit/api/health
```

### Deployment Commands
```bash
# Pull latest code
sudo git pull origin main

# Rebuild and restart
sudo docker-compose build --no-cache && sudo docker-compose down && sudo docker-compose up -d

# Full deployment
sudo bash scripts/deploy-live.sh

# Setup production environment
sudo bash scripts/setup-production.sh
```

---

## DNS Checking Commands

```bash
# Check A record
nslookup clinicindia.fit

# Detailed DNS info
dig clinicindia.fit

# Check specific nameserver
nslookup clinicindia.fit 8.8.8.8

# Check all records
dig clinicindia.fit ANY

# View MX records
dig clinicindia.fit MX
```

---

## Nginx Commands

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx status
sudo systemctl status nginx

# View Nginx error log
sudo tail -f /var/log/nginx/error.log

# View Nginx access log
sudo tail -f /var/log/nginx/access.log
```

---

## Emergency Commands

```bash
# Emergency stop
sudo docker-compose down

# Force restart all services
sudo docker-compose restart

# Clear Docker cache
sudo docker system prune -a

# View disk usage
du -sh /*

# Free up space
sudo docker image prune -a --force

# Restore from backup
sudo docker-compose down && sudo docker-compose exec postgres psql -U postgres clinicindia < backup.sql && sudo docker-compose up -d
```

---

## Verification Checklist

```bash
# Check all services running
sudo docker-compose ps

# Test frontend
curl -I https://clinicindia.fit

# Test backend
curl https://clinicindia.fit/api/health

# Test database connection
sudo docker-compose exec postgres pg_isready -U postgres

# Check SSL certificate
openssl s_client -connect clinicindia.fit:443 </dev/null

# View system resources
free -h && df -h

# Check if ports are open
sudo ss -tulpn | grep -E ":(80|443|5000|3000|5432)"
```

---

## Environment Variable Template

```bash
# Copy to production .env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=clinicindia
DB_USER=postgres
DB_PASSWORD=CHANGE_ME
JWT_SECRET=CHANGE_ME
NEXTAUTH_SECRET=CHANGE_ME
CORS_ORIGIN=https://clinicindia.fit
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://clinicindia.fit/api
NEXTAUTH_URL=https://clinicindia.fit
```

---

## Helpful Links

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **Ubuntu Docs**: https://ubuntu.com/server/docs/

---

## Common Issues Quick Fix

```bash
# Service won't start?
sudo docker-compose logs SERVICE_NAME

# Port already in use?
sudo lsof -i :5000

# Database connection failed?
sudo docker-compose exec postgres pg_isready -U postgres

# SSL certificate error?
sudo docker-compose exec certbot certbot renew --force-renewal

# Out of disk space?
sudo docker image prune -a && sudo docker volume prune

# Need to restart everything?
sudo docker-compose down && sudo docker-compose up -d
```

---

## Performance Tuning

```bash
# Optimize database
sudo docker-compose exec postgres psql -U postgres clinicindia -c "VACUUM ANALYZE;"

# Check database size
sudo docker-compose exec postgres psql -U postgres clinicindia -c "SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name)) FROM information_schema.tables WHERE table_schema='public' ORDER BY pg_total_relation_size(table_name) DESC;"

# Enable query logging (for debugging)
sudo docker-compose exec postgres psql -U postgres clinicindia -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# View slow queries
sudo docker-compose logs -f postgres | grep duration
```

---

## Backup & Recovery

```bash
# Create daily automated backup
0 2 * * * cd /var/www/clinicindia.fit && sudo docker-compose exec -T postgres pg_dump -U postgres clinicindia | gzip > /var/backups/clinicindia/backup_$(date +\%Y\%m\%d).sql.gz

# List all backups
ls -lah /var/backups/clinicindia/

# Restore from specific backup
sudo docker-compose down
sudo docker-compose up -d postgres
sleep 10
sudo docker-compose exec postgres psql -U postgres clinicindia < /var/backups/clinicindia/backup_20240115.sql.gz
sudo docker-compose up -d

# Backup application files
tar -czf /var/backups/clinicindia/app_backup_$(date +%Y%m%d).tar.gz /var/www/clinicindia.fit
```

---

**Bookmark this file for quick reference during deployment!**

Last Updated: February 2024
