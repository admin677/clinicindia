import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role, phone } = await request.json();

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!['patient', 'doctor', 'admin'].includes(role || 'patient')) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);
    const userId = uuidv4();

    // Create user
    const result = await query(
      'INSERT INTO users (id, email, password, first_name, last_name, role, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, email, role, first_name, last_name',
      [userId, email, hashedPassword, firstName, lastName, role || 'patient', phone || null]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
