# Healthcare Best Practices & HIPAA Compliance

## 1. Data Security & HIPAA Compliance

### Protected Health Information (PHI)
All personally identifiable health information must be:
- Encrypted at rest (AES-256)
- Encrypted in transit (TLS 1.3)
- Restricted to authorized personnel only

### Implementation
```javascript
// Encryption at rest
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = crypto.randomBytes(16);

export const encryptPHI = (data) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decryptPHI = (encryptedData) => {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
```

### Access Control (Role-Based)
- **Patient**: Can access own records
- **Doctor**: Can access patient records (assigned patients)
- **Admin**: Full access with audit logging
- **Pharmacist**: Can access prescriptions
- **Billing**: Can access financial records

### Audit Logging
Every PHI access must be logged:
```javascript
const createAuditLog = async (userId, action, recordId, changes) => {
  await db.none(
    `INSERT INTO audit_logs (id, user_id, action, table_name, record_id, old_values, new_values, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [uuidv4(), userId, action, 'patients', recordId, changes.old, changes.new]
  );
};
```

## 2. Patient Privacy

### Consent Management
- Explicit consent required for all data processing
- Consent records must be maintained
- Right to withdraw consent

### Data Minimization
- Collect only necessary data
- Regular data purge of unnecessary records
- Implement data retention policies

```javascript
// Data retention policy
const purgeOldRecords = async () => {
  const retentionPeriod = 90; // days
  await db.none(
    'DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL $1 DAY',
    [retentionPeriod]
  );
};
```

## 3. Medical Records Management

### Record Organization
```javascript
// Standard medical record structure
{
  id: UUID,
  patientId: UUID,
  doctorId: UUID,
  recordType: 'consultation|lab|imaging|prescription',
  diagnosis: string,
  findings: text,
  treatment: text,
  followUp: date,
  attachments: [
    {
      id: UUID,
      fileName: string,
      fileSize: number,
      mimeType: string,
      uploadedAt: timestamp,
      encryptedPath: string
    }
  ],
  status: 'draft|finalized|reviewed',
  signedAt: timestamp,
  signedBy: UUID,
  createdAt: timestamp,
  updatedAt: timestamp,
  archivedAt: timestamp
}
```

### Record Versioning
```javascript
// Maintain record history
const createRecordVersion = async (recordId, changes, userId) => {
  await db.none(
    `INSERT INTO medical_record_history 
     (id, record_id, changes, changed_by, changed_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [uuidv4(), recordId, JSON.stringify(changes), userId]
  );
};
```

## 4. Appointment Management Best Practices

### Scheduling Algorithm
```javascript
// Prevent double-booking
const findAvailableSlots = async (doctorId, date) => {
  const appointments = await db.any(
    `SELECT scheduled_at FROM appointments 
     WHERE doctor_id = $1 AND DATE(scheduled_at) = $2 AND status != 'cancelled'`,
    [doctorId, date]
  );
  
  // Doctor works 9 AM - 5 PM, 30-min slots
  const availableSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, min);
      
      const isBooked = appointments.some(apt => 
        apt.scheduled_at.getHours() === hour && 
        apt.scheduled_at.getMinutes() === min
      );
      
      if (!isBooked) availableSlots.push(slotTime);
    }
  }
  return availableSlots;
};
```

### Appointment Reminders
```javascript
// Send reminders 24h and 1h before appointment
const sendAppointmentReminder = async (appointmentId) => {
  const apt = await db.one(
    'SELECT * FROM appointments WHERE id = $1',
    [appointmentId]
  );
  
  const patient = await db.one(
    'SELECT email, phone FROM users WHERE id = $1',
    [apt.patientId]
  );
  
  // Send email reminder
  await sendEmail(patient.email, 'Appointment Reminder', 
    `Your appointment is in 24 hours. Please arrive 15 minutes early.`);
  
  // Send SMS reminder (optional)
  if (patient.phone) {
    await sendSMS(patient.phone, 'Clinic India: Your appointment is tomorrow.');
  }
};
```

## 5. Prescription Management

### E-Prescription Requirements
```javascript
// Digital signature required
{
  id: UUID,
  patientId: UUID,
  doctorId: UUID,
  medications: [
    {
      name: string,
      strength: string,
      quantity: number,
      unit: string,
      frequency: string,
      duration: string,
      instructions: text,
      refillsAllowed: number
    }
  ],
  instructions: text,
  warnings: text,
  issuedAt: timestamp,
  validUntil: date,
  signedDigitally: boolean,
  digitalSignature: string,
  status: 'active|expired|dispensed|revoked'
}
```

### Drug Interaction Checking
```javascript
// Check for drug interactions
const checkDrugInteractions = async (medications) => {
  const interactions = await db.any(
    `SELECT interaction FROM drug_interactions 
     WHERE drug_id IN (${medications.map(m => `'${m.id}'`).join(',')})
     GROUP BY interaction HAVING COUNT(*) > 1`
  );
  
  return interactions;
};
```

## 6. Payment Security

### PCI DSS Compliance
- Never store full credit card numbers
- Use tokenization (Stripe/PayPal)
- Implement 3D Secure
- Regular security audits

```javascript
// Stripe payment processing
const processPayment = async (invoiceId, token) => {
  try {
    const invoice = await db.one(
      'SELECT amount FROM invoices WHERE id = $1',
      [invoiceId]
    );
    
    const charge = await stripe.charges.create({
      amount: Math.round(invoice.amount * 100), // cents
      currency: 'inr',
      source: token,
      description: `Invoice ${invoiceId}`
    });
    
    // Record payment
    await db.none(
      `INSERT INTO payments (id, invoice_id, amount, payment_method, transaction_id, status)
       VALUES ($1, $2, $3, 'card', $4, 'completed')`,
      [uuidv4(), invoiceId, invoice.amount, charge.id]
    );
    
    return charge;
  } catch (error) {
    // Log error but don't expose details
    console.error('Payment error:', error);
    throw new Error('Payment processing failed');
  }
};
```

## 7. Telemedicine Best Practices

### Video Consultation Security
- End-to-end encryption
- Secure room generation
- Access control tokens
- Recording with patient consent

```javascript
// Generate secure telemedicine room
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const generateTelemedicineRoom = async (appointmentId) => {
  const roomId = uuidv4();
  const roomToken = crypto.randomBytes(32).toString('hex');
  
  await db.none(
    `INSERT INTO telemedicine_rooms (id, appointment_id, room_token, status, created_at)
     VALUES ($1, $2, $3, 'active', NOW())`,
    [roomId, appointmentId, roomToken]
  );
  
  return { roomId, roomToken };
};
```

## 8. Notification & Communication

### Secure Messaging
- Encrypt all patient communications
- No PHI in unencrypted emails
- Opt-in for SMS notifications

```javascript
// Secure notification
const sendSecureNotification = async (userId, message, useEmail = false) => {
  // Always save in app notification
  await db.none(
    `INSERT INTO notifications (id, user_id, message, is_read, created_at)
     VALUES ($1, $2, $3, false, NOW())`,
    [uuidv4(), userId, encryptPHI(message)]
  );
  
  // Optional email (don't include PHI)
  if (useEmail) {
    const user = await db.one('SELECT email FROM users WHERE id = $1', [userId]);
    await sendEmail(user.email, 'New Message', 
      'You have a new message. Log in to Clinic India to view it.');
  }
};
```

## 9. Performance & Scalability

### Database Optimization
```sql
-- Essential indexes for healthcare data
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, scheduled_at);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id, created_at DESC);
CREATE INDEX idx_prescriptions_patient_valid ON prescriptions(patient_id, valid_until);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
```

### Caching Strategy
```javascript
// Cache doctor availability
const cacheDoctorAvailability = async (doctorId) => {
  const availability = await db.any(
    'SELECT * FROM doctor_schedules WHERE doctor_id = $1',
    [doctorId]
  );
  
  // Cache for 1 day
  await redis.setex(
    `doctor_availability_${doctorId}`,
    86400,
    JSON.stringify(availability)
  );
};
```

## 10. Compliance Checklist

- [ ] HIPAA Privacy Rule compliance
- [ ] HIPAA Security Rule compliance
- [ ] HIPAA Breach Notification Rule
- [ ] Patient consent documentation
- [ ] Audit trail implementation
- [ ] Data encryption (at rest & in transit)
- [ ] Access controls & role management
- [ ] Staff training & documentation
- [ ] Incident response plan
- [ ] Business Associate Agreements (BAAs)
- [ ] Regular security assessments
- [ ] Penetration testing
- [ ] Data backup & disaster recovery
- [ ] Privacy impact assessment
- [ ] Terms of Service & Privacy Policy

---

For compliance questions: compliance@clinicindia.fit
