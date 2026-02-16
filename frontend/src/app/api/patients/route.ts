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

// Get all patients (admin/doctor only)
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

    const patients = await queryMany(
      'SELECT id, user_id, date_of_birth, gender, blood_type, address, city, state, pincode, emergency_contact, emergency_phone FROM patients ORDER BY created_at DESC',
      []
    );

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Fetch patients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// Create new patient
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
      dateOfBirth,
      gender,
      bloodType,
      address,
      city,
      state,
      pincode,
      emergencyContact,
      emergencyPhone
    } = await request.json();

    // Validation
    if (!dateOfBirth || !gender) {
      return NextResponse.json(
        { error: 'Date of birth and gender are required' },
        { status: 400 }
      );
    }

    const patientId = uuidv4();

    const result = await query(
      'INSERT INTO patients (id, user_id, date_of_birth, gender, blood_type, address, city, state, pincode, emergency_contact, emergency_phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *',
      [
        patientId,
        user.id,
        dateOfBirth,
        gender,
        bloodType || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        emergencyContact || null,
        emergencyPhone || null
      ]
    );

    return NextResponse.json(
      {
        message: 'Patient created successfully',
        patient: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
