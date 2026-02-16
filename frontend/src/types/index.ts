// Type definitions for Clinic India API

export type UserRole = 'patient' | 'doctor' | 'admin';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'cash';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface Patient extends User {
  patientId: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
}

export interface Doctor extends User {
  doctorId: string;
  specialization: string;
  licenseNumber: string;
  yearsExperience: number;
  consultationFee: number;
  bio?: string;
  isAvailable: boolean;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  instructions: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  amount: number;
  description: string;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
  status: InvoiceStatus;
  paidAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
