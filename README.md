# Clinic India - Healthcare Management System

A comprehensive, enterprise-grade healthcare clinic management system built with modern technologies and best practices for HIPAA compliance and scalability.

## 🚀 Features

### Core Features
- **Patient Management** - Complete patient profiles with medical history
- **Doctor Management** - Doctor profiles with specialization and availability
- **Appointment Booking** - Seamless appointment scheduling and management
- **Medical Records** - Secure digital medical record management
- **Prescriptions** - E-prescription generation and tracking
- **Billing & Invoicing** - Integrated payment processing
- **Notifications** - Real-time appointment and health notifications
- **User Authentication** - Secure JWT-based authentication

### Advanced Features
- **Telemedicine** - Video consultation capabilities
- **Payment Integration** - Stripe integration for secure payments
- **Email Notifications** - Automated email reminders
- **SMS Alerts** - Twilio SMS notification support
- **Report Generation** - Medical and financial reports
- **Audit Logging** - Complete activity tracking for compliance
- **Role-Based Access** - Patient, Doctor, and Admin roles

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js 18+ with Express.js
- PostgreSQL for relational data
- JWT for authentication
- Bcryptjs for password hashing
- Stripe for payments
- Nodemailer for emails

**Frontend:**
- Next.js 14 with React 18
- TailwindCSS for styling
- React Query for state management
- Zustand for global state
- React Hook Form for forms
- Framer Motion for animations
- Recharts for data visualization

**Infrastructure:**
- Docker for containerization
- PostgreSQL database
- Environment-based configuration

## 📋 Project Structure

```
clinicindia.fit/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── server.js       # Main server entry
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Auth & other middleware
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.js
│   │   │   ├── patients.js
│   │   │   ├── doctors.js
│   │   │   ├── appointments.js
│   │   │   ├── medicalRecords.js
│   │   │   ├── prescriptions.js
│   │   │   ├── billing.js
│   │   │   └── notifications.js
│   │   └── utils/          # Helper functions
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── frontend/               # Next.js React App
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   ├── .env.example       # Environment variables
│   ├── next.config.js     # Next.js configuration
│   └── package.json
│
├── database/              # Database
│   └── schema.sql         # PostgreSQL schema
│
├── docs/                  # Documentation
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup PostgreSQL database:**
   ```bash
   psql -U postgres -f ../database/schema.sql
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Patients
- `GET /api/patients` - List patients (admin/doctor only)
- `GET /api/patients/:id` - Get patient profile
- `POST /api/patients` - Create patient profile
- `PUT /api/patients/:id` - Update patient profile

### Doctors
- `GET /api/doctors` - List doctors
- `GET /api/doctors/:id` - Get doctor profile
- `POST /api/doctors` - Create doctor profile (admin only)
- `PATCH /api/doctors/:id/availability` - Update availability
- `GET /api/doctors/:id/schedule` - Get doctor schedule

### Appointments
- `GET /api/appointments` - List user's appointments
- `POST /api/appointments` - Book appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `GET /api/appointments/doctor/:doctorId/slots` - Get available slots

### Medical Records
- `GET /api/medical-records/patient/:patientId` - Get patient records
- `POST /api/medical-records` - Create medical record
- `GET /api/medical-records/:id` - Get record details
- `PUT /api/medical-records/:id` - Update medical record

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id` - Get prescription details

### Billing
- `GET /api/billing` - List invoices
- `POST /api/billing` - Create invoice
- `POST /api/billing/:invoiceId/payment` - Process payment
- `GET /api/billing/:id` - Get invoice details

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all/read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcryptjs with configurable rounds
- **CORS Protection** - Cross-Origin Request handling
- **Rate Limiting** - API rate limiting to prevent abuse
- **Helmet.js** - Security headers
- **Input Validation** - Express-validator for all inputs
- **SQL Injection Protection** - Parameterized queries with pg-promise
- **HTTPS Ready** - Built for production SSL/TLS

## 📊 Database Schema

### Tables
- **users** - User accounts (patient, doctor, admin)
- **patients** - Patient-specific information
- **doctors** - Doctor profiles and specialization
- **doctor_schedules** - Doctor availability schedules
- **appointments** - Appointment bookings
- **medical_records** - Patient medical records
- **prescriptions** - E-prescriptions
- **invoices** - Billing invoices
- **payments** - Payment records
- **notifications** - User notifications
- **audit_logs** - Compliance audit trail

## 🛠️ Development

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

### Code Quality

**Lint Code:**
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## 📦 Deployment

### Docker Deployment

1. **Build Docker images:**
   ```bash
   docker-compose build
   ```

2. **Run containers:**
   ```bash
   docker-compose up
   ```

### Environment-Specific Configs

Create environment-specific `.env` files:
- `.env.development` - Development configuration
- `.env.staging` - Staging configuration
- `.env.production` - Production configuration

## 📝 Configuration

### Backend Configuration (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinicindia
DB_USER=postgres
DB_PASSWORD=your_password

NODE_ENV=development
PORT=5000

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

CORS_ORIGIN=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
```

### Frontend Configuration (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Clinic India
NEXTAUTH_SECRET=your_secret
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Create a pull request

## 📄 License

Proprietary - Clinic India

## 📞 Support

For support, contact: support@clinicindia.fit

## 🔄 Updates & Roadmap

### Planned Features
- [ ] Advanced telemedicine with video conferencing
- [ ] AI-powered medical diagnosis support
- [ ] Mobile native apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] Pharmacy integration
- [ ] Insurance claim automation
- [ ] Multi-language support
- [ ] Blockchain-based medical records

---

**Built with ❤️ by World-Class Healthcare Developers**
