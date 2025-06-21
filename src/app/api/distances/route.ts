import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty data since we're using localStorage now
    return NextResponse.json({});
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ error: 'Failed to get distances' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Just return success since we're using localStorage now
    // The actual storage will be handled by the frontend
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Failed to save distances' }, { status: 500 });
  }
} 