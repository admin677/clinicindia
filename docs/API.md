# API Documentation

## Overview
Clinic India API is a RESTful API for healthcare clinic management. All requests require proper authentication via JWT tokens except for public endpoints.

## Authentication

### Headers
All authenticated requests must include:
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Token Format
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "patient|doctor|admin"
}
```

## Response Format

### Success Response
```json
{
  "data": { /* response data */ },
  "message": "Success message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Error Response
```json
{
  "error": {
    "status": 400,
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Endpoints

### Auth Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient|doctor|admin",
  "phone": "+919876543210"
}

Response: 201
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "patient",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { /* user object */ }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "patient",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+919876543210",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

### Patient Endpoints

#### Get All Patients
```
GET /api/patients
Authorization: Bearer {token}
Role: admin, doctor

Response: 200
[
  {
    "id": "uuid",
    "userId": "uuid",
    "bloodType": "O+",
    "allergies": "Penicillin",
    "medicalHistory": "...",
    "emergencyContact": "+919876543210",
    "insuranceProvider": "Provider Name"
  }
]
```

#### Get Patient Profile
```
GET /api/patients/:id
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "email": "patient@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "bloodType": "AB+",
  "allergies": "Latex",
  "medicalHistory": "Diabetes Type 2",
  "emergencyContact": "+919876543210",
  "insuranceProvider": "Insurance Co"
}
```

#### Create Patient Profile
```
POST /api/patients
Authorization: Bearer {token}
Role: patient

{
  "bloodType": "O+",
  "allergies": "Penicillin",
  "medicalHistory": "No major conditions",
  "emergencyContact": "+919876543210",
  "insuranceProvider": "Insurance Provider"
}

Response: 201
{ /* patient object */ }
```

### Doctor Endpoints

#### Get All Doctors
```
GET /api/doctors

Response: 200
[
  {
    "id": "uuid",
    "email": "doctor@example.com",
    "firstName": "Dr.",
    "lastName": "Smith",
    "specialization": "Cardiology",
    "licenseNumber": "MD123456",
    "yearsExperience": 10,
    "consultationFee": 500,
    "bio": "Experienced cardiologist...",
    "isAvailable": true,
    "phone": "+919876543210"
  }
]
```

#### Get Doctor by ID
```
GET /api/doctors/:id

Response: 200
{ /* doctor object */ }
```

#### Get Doctor Schedule
```
GET /api/doctors/:id/schedule

Response: 200
[
  {
    "id": "uuid",
    "doctorId": "uuid",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "isAvailable": true
  }
]
```

### Appointment Endpoints

#### Get Appointments
```
GET /api/appointments
Authorization: Bearer {token}

Response: 200
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "scheduledAt": "2024-01-15T14:00:00Z",
    "reason": "General checkup",
    "notes": "Patient has anxiety",
    "status": "confirmed",
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

#### Book Appointment
```
POST /api/appointments
Authorization: Bearer {token}
Role: patient

{
  "doctorId": "uuid",
  "scheduledAt": "2024-01-15T14:00:00Z",
  "reason": "General checkup",
  "notes": "Patient background"
}

Response: 201
{ /* appointment object */ }
```

#### Update Appointment Status
```
PATCH /api/appointments/:id/status
Authorization: Bearer {token}

{
  "status": "confirmed|completed|cancelled"
}

Response: 200
{ /* updated appointment */ }
```

#### Cancel Appointment
```
PATCH /api/appointments/:id/cancel
Authorization: Bearer {token}

Response: 200
{ /* cancelled appointment */ }
```

### Medical Records Endpoints

#### Get Patient Records
```
GET /api/medical-records/patient/:patientId
Authorization: Bearer {token}

Response: 200
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "diagnosis": "Hypertension",
    "treatment": "Medication ABC",
    "notes": "Patient doing well",
    "attachments": ["url1", "url2"],
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

#### Create Medical Record
```
POST /api/medical-records
Authorization: Bearer {token}
Role: doctor

{
  "patientId": "uuid",
  "diagnosis": "Diabetes Type 2",
  "treatment": "Insulin therapy",
  "notes": "Follow-up in 2 weeks",
  "attachments": ["file_url"]
}

Response: 201
{ /* medical record */ }
```

### Prescription Endpoints

#### Get Prescriptions
```
GET /api/prescriptions
Authorization: Bearer {token}

Response: 200
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "medications": [
      {
        "name": "Aspirin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "duration": "7 days"
      }
    ],
    "instructions": "Take with food",
    "validUntil": "2024-02-01",
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

#### Create Prescription
```
POST /api/prescriptions
Authorization: Bearer {token}
Role: doctor

{
  "patientId": "uuid",
  "medications": [
    {
      "name": "Aspirin",
      "dosage": "500mg",
      "frequency": "twice daily",
      "duration": "7 days"
    }
  ],
  "instructions": "Take with food, avoid alcohol",
  "validUntil": "2024-02-01"
}

Response: 201
{ /* prescription */ }
```

### Billing Endpoints

#### Get Invoices
```
GET /api/billing
Authorization: Bearer {token}

Response: 200
[
  {
    "id": "uuid",
    "patientId": "uuid",
    "amount": 5000,
    "description": "Consultation + Tests",
    "items": [...],
    "status": "pending|paid|overdue|cancelled",
    "paidAt": "2024-01-01T12:00:00Z",
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

#### Create Invoice
```
POST /api/billing
Authorization: Bearer {token}
Role: admin, doctor

{
  "patientId": "uuid",
  "amount": 5000,
  "description": "Medical consultation",
  "items": [
    {
      "description": "Consultation fee",
      "amount": 500,
      "quantity": 1
    }
  ]
}

Response: 201
{ /* invoice */ }
```

#### Process Payment
```
POST /api/billing/:invoiceId/payment
Authorization: Bearer {token}

{
  "paymentMethod": "card|bank_transfer|cash",
  "transactionId": "txn_123456"
}

Response: 200
{
  "message": "Payment successful",
  "payment": { /* payment object */ }
}
```

### Notification Endpoints

#### Get Notifications
```
GET /api/notifications
Authorization: Bearer {token}

Response: 200
[
  {
    "id": "uuid",
    "userId": "uuid",
    "title": "Appointment Confirmed",
    "message": "Your appointment with Dr. Smith is confirmed",
    "type": "appointment",
    "relatedId": "uuid",
    "isRead": false,
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

#### Mark Notification as Read
```
PATCH /api/notifications/:id/read
Authorization: Bearer {token}

Response: 200
{ /* updated notification */ }
```

## Error Codes

| Code | Status | Message |
|------|--------|---------|
| AUTH_REQUIRED | 401 | Authentication required |
| INVALID_TOKEN | 401 | Invalid or expired token |
| INSUFFICIENT_PERMISSIONS | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Validation error |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

## Rate Limiting

- **General Limit**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 requests per 15 minutes
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination

Endpoints support pagination with query parameters:
```
GET /api/patients?page=1&limit=20&sort=-createdAt
```

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort field (+ascending, -descending)

---

For additional help, contact: api-support@clinicindia.fit
