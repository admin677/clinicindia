# Development Notes

## Important Setup Information

### Database Setup
PostgreSQL must be installed and running before starting the backend.

```bash
# Create database
createdb clinicindia

# Run schema
psql clinicindia < database/schema.sql

# Verify connection
psql clinicindia -c "SELECT VERSION();"
```

### Environment Variables Required

**Backend (.env)**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` - Change in production!
- `NODE_ENV` - development/production
- `CORS_ORIGIN` - Frontend URL
- Optional: Stripe, Email, SMS keys

**Frontend (.env.local)**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_SECRET` - Change in production!

### Initial Accounts

For testing, create accounts via the register endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User",
    "role": "patient"
  }'
```

### File Structure Notes

- **Backend uses ES modules** (type: "module" in package.json)
- **Frontend uses TypeScript** (strict mode enabled)
- **Database indexes included** for performance
- **All routes require authentication** except /api/auth/register and /api/auth/login

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Database**: Always backup before schema changes
3. **Logs**: Check console for detailed error messages
4. **CORS**: Configure CORS_ORIGIN for your frontend URL
5. **Token Expiry**: Default is 7 days, adjust JWT_EXPIRY as needed

### Security Reminders

⚠️ **Before Production:**
- Generate new `JWT_SECRET`
- Generate new `NEXTAUTH_SECRET`
- Set `NODE_ENV=production`
- Enable HTTPS/SSL
- Configure strong database password
- Set up email service (SMTP)
- Enable rate limiting
- Set up monitoring
- Run security audit

### Common Issues

**Issue**: "Cannot find module 'pg'"
- **Solution**: Run `npm install` in backend directory

**Issue**: "Connection refused (PostgreSQL)"
- **Solution**: Ensure PostgreSQL is running and credentials are correct

**Issue**: "CORS error in frontend"
- **Solution**: Check `CORS_ORIGIN` in backend .env matches frontend URL

**Issue**: "Token invalid or expired"
- **Solution**: Token expires based on JWT_EXPIRY. Implement token refresh logic.

### Database Schema Notes

- All tables use UUID primary keys
- Timestamps use CURRENT_TIMESTAMP
- Foreign keys have ON DELETE CASCADE
- Soft delete support via deleted_at column
- Audit logs track all modifications
- Status fields use CHECK constraints

### API Response Format

All endpoints follow this pattern:

**Success (2xx):**
```json
{
  "data": { /* actual data */ },
  "message": "Success message"
}
```

**Error (4xx/5xx):**
```json
{
  "error": {
    "status": 400,
    "message": "Error description"
  }
}
```

### Testing Endpoints

Use Postman or curl to test:

```bash
# Test backend health
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000

# Test API root
curl http://localhost:5000/api
```

### Performance Considerations

- Database indexes created for common queries
- Connection pooling enabled (max 30 connections)
- Rate limiting: 100 requests per 15 minutes
- Compression enabled on API responses
- Query timeout: 30 seconds

### Backup Recommendation

```bash
# Daily PostgreSQL backup
pg_dump clinicindia > backup_$(date +%Y%m%d).sql

# Restore from backup
psql clinicindia < backup_20240101.sql
```

### Monitoring & Logs

- Backend logs to console in development
- Frontend logs to browser console
- Database logs available in PostgreSQL logs
- Audit trail in database audit_logs table

### Scaling Considerations

Future optimizations when scaling:
1. Add Redis for caching
2. Implement message queues for async tasks
3. Add database read replicas
4. Use CDN for static assets
5. Implement API pagination
6. Add search indexing (Elasticsearch)
7. Database connection pooling with PgBouncer

---

**Last Updated**: January 2024
**Version**: 1.0.0
