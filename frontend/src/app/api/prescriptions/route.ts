import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, queryMany } from '@/lib/db';

// Verify token helper
function verifyAuthToken(token: string | null) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch {
    return null;
  }
}

// Get all prescriptions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = verifyAuthToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let prescriptions;

    if (user.role === 'patient') {
      // Get patient's prescriptions
      prescriptions = await queryMany(
        `SELECT p.*, u.first_name, u.last_name, d.specialization
         FROM prescriptions p
         JOIN patients pat ON p.patient_id = pat.id
         JOIN doctors doc ON p.doctor_id = doc.id
         JOIN users u ON doc.user_id = u.id
         WHERE pat.user_id = $1
         ORDER BY p.issue_date DESC`,
        [user.id]
      );
    } else {
      // Doctor/Admin can view all prescriptions
      prescriptions = await queryMany(
        `SELECT * FROM prescriptions ORDER BY issue_date DESC`,
        []
      );
    }

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

// Create new prescription
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = verifyAuthToken(token);

    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Unauthorized - doctors only' },
        { status: 403 }
      );
    }

    const {
      patientId,
      medications,
      dosage,
      frequency,
      duration,
      instructions,
      notes
    } = await request.json();

    // Validation
    if (!patientId || !medications) {
      return NextResponse.json(
        { error: 'PatientId and medications are required' },
        { status: 400 }
      );
    }

    // Get doctor ID
    const doctor = await queryMany(
      'SELECT id FROM doctors WHERE user_id = $1',
      [user.id]
    );

    if (!doctor.length) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const prescriptionId = uuidv4();

    const result = await query(
      `INSERT INTO prescriptions (id, patient_id, doctor_id, medications, dosage, frequency, duration, instructions, notes, issue_date, expiry_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW() + INTERVAL '30 days', NOW())
       RETURNING *`,
      [prescriptionId, patientId, doctor[0].id, medications, dosage || null, frequency || null, duration || null, instructions || null, notes || null]
    );

    return NextResponse.json(
      {
        message: 'Prescription created successfully',
        prescription: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create prescription error:', error);
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
