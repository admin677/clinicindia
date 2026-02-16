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

// Get all medical records
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

    let records;

    if (user.role === 'patient') {
      // Get patient's medical records
      records = await queryMany(
        `SELECT mr.*, d.specialization, u.first_name, u.last_name
         FROM medical_records mr
         JOIN patients p ON mr.patient_id = p.id
         JOIN doctors doc ON mr.doctor_id = doc.id
         JOIN users u ON doc.user_id = u.id
         WHERE p.user_id = $1
         ORDER BY mr.visit_date DESC`,
        [user.id]
      );
    } else {
      // Doctor/Admin can view all records
      records = await queryMany(
        `SELECT * FROM medical_records ORDER BY visit_date DESC`,
        []
      );
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Fetch medical records error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}

// Create new medical record
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
      visitDate,
      diagnosis,
      treatment,
      notes,
      symptoms,
      vitals
    } = await request.json();

    // Validation
    if (!patientId || !visitDate) {
      return NextResponse.json(
        { error: 'PatientId and visitDate are required' },
        { status: 400 }
      );
    }

    // Get doctor ID from user
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

    const recordId = uuidv4();

    const result = await query(
      `INSERT INTO medical_records (id, patient_id, doctor_id, visit_date, diagnosis, treatment, notes, symptoms, vitals, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [recordId, patientId, doctor[0].id, visitDate, diagnosis || null, treatment || null, notes || null, symptoms || null, vitals || null]
    );

    return NextResponse.json(
      {
        message: 'Medical record created successfully',
        record: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create medical record error:', error);
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    );
  }
}
