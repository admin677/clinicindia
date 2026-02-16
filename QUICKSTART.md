# Clinic India - Healthcare Management System

This is a professional healthcare clinic management system with enterprise-grade security and HIPAA compliance.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   psql -U postgres -f database/schema.sql
   ```

3. **Configure Environment**
   ```bash
   # Backend
   cd backend && cp .env.example .env
   
   # Frontend  
   cd ../frontend && cp .env.example .env.local
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📚 Documentation

- [README](./README.md) - Project overview
- [API Documentation](./docs/API.md) - Complete API reference
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment
- [Healthcare Best Practices](./docs/HEALTHCARE_BEST_PRACTICES.md) - HIPAA compliance

## 🏗️ Project Structure

```
├── backend/              # Node.js/Express API
├── frontend/             # Next.js React app
├── database/             # PostgreSQL schema
├── docs/                 # Documentation
└── README.md
```

## 🔐 Security

- JWT Authentication
- Password Hashing (Bcryptjs)
- CORS Protection
- Rate Limiting
- Input Validation
- Audit Logging
- HIPAA Compliance

## 📊 Tech Stack

- Backend: Node.js, Express, PostgreSQL
- Frontend: Next.js, React, TailwindCSS
- Auth: JWT
- Payments: Stripe
- Email: Nodemailer

## 🤝 Contributing

This is a private project. For access or contribution inquiries, contact support@clinicindia.fit

## 📄 License

Proprietary - Clinic India © 2024

---

Built with ❤️ by world-class healthcare developers
