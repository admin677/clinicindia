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

// Get all notifications
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

    const notifications = await queryMany(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Create new notification (internal use)
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
      userId,
      title,
      message,
      type
    } = await request.json();

    // Validation
    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'UserId, title, and message are required' },
        { status: 400 }
      );
    }

    const notificationId = uuidv4();

    const result = await query(
      `INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING *`,
      [notificationId, userId, title, message, type || 'general']
    );

    return NextResponse.json(
      {
        message: 'Notification created successfully',
        notification: result.rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
