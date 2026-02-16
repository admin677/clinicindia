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

// Get all invoices
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

    let invoices;

    if (user.role === 'patient') {
      // Get patient's invoices
      invoices = await queryMany(
        `SELECT i.* FROM invoices i
         JOIN patients p ON i.patient_id = p.id
         WHERE p.user_id = $1
         ORDER BY i.created_at DESC`,
        [user.id]
      );
    } else {
      // Admin can view all invoices
      invoices = await queryMany(
        `SELECT * FROM invoices ORDER BY created_at DESC`,
        []
      );
    }

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Fetch invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// Create new invoice
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
      appointmentId,
      amount,
      description,
      dueDate
    } = await request.json();

    // Validation
    if (!patientId || !amount) {
      return NextResponse.json(
        { error: 'PatientId and amount are required' },
        { status: 400 }
      );
    }

    const invoiceId = uuidv4();

    const result = await query(
      `INSERT INTO invoices (id, patient_id, appointment_id, amount, description, due_date, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [invoiceId, patientId, appointmentId || null, amount, description || null, dueDate || null, 'pending']
    );

    return NextResponse.json(
      {
        message: 'Invoice created successfully',
        invoice: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
