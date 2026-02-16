import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { query, queryOne, queryMany } from '@/lib/db';

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

// Get all appointments
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

    let appointments;

    if (user.role === 'patient') {
      // Get patient's appointments
      appointments = await queryMany(
        `SELECT a.*, u.first_name, u.last_name, u.email, d.specialization
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN doctors doc ON a.doctor_id = doc.id
         JOIN users u ON doc.user_id = u.id
         WHERE p.user_id = $1
         ORDER BY a.appointment_date DESC`,
        [user.id]
      );
    } else if (user.role === 'doctor') {
      // Get doctor's appointments
      appointments = await queryMany(
        `SELECT a.*, p.user_id, u.first_name, u.last_name, u.email
         FROM appointments a
         JOIN doctors doc ON a.doctor_id = doc.id
         JOIN patients p ON a.patient_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE doc.user_id = $1
         ORDER BY a.appointment_date DESC`,
        [user.id]
      );
    } else {
      // Admin gets all appointments
      appointments = await queryMany(
        `SELECT * FROM appointments ORDER BY appointment_date DESC`,
        []
      );
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// Create new appointment
export async function POST(request: NextRequest) {
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

    const {
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      notes
    } = await request.json();

    // Validation
    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: 'PatientId, doctorId, appointmentDate, and appointmentTime are required' },
        { status: 400 }
      );
    }

    const appointmentId = uuidv4();
    const appointmentDateTime = `${appointmentDate}T${appointmentTime}`;

    const result = await query(
      'INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, reason, notes, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [appointmentId, patientId, doctorId, appointmentDateTime, reason || null, notes || null, 'scheduled']
    );

    return NextResponse.json(
      {
        message: 'Appointment created successfully',
        appointment: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
