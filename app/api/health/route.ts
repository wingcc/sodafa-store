import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Verifies the API layer is running
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API is running',
  });
}
