import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Middleware wrapper for API routes
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { error: 'Authorization token required' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Add user to request
      (request as any).user = decoded;
      return handler(request);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}
