import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      return NextResponse.json(
        {
          status: 'degraded',
          message: 'Database connection failed',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        message: 'API is operational',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        database: 'connected',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
