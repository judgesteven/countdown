import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const DISTANCES_KEY = 'workout_distances';

// GET - Read distances
export async function GET() {
  try {
    // Try to get data from Vercel KV
    const distances = await kv.get(DISTANCES_KEY);
    
    if (distances) {
      return NextResponse.json(distances);
    } else {
      // Return empty object if no data exists
      return NextResponse.json({});
    }
  } catch (error) {
    console.error('Failed to read distances from KV:', error);
    // Return empty object on error
    return NextResponse.json({});
  }
}

// POST - Save distances
export async function POST(request: NextRequest) {
  try {
    const distances = await request.json();
    
    // Validate the data structure
    if (typeof distances !== 'object' || distances === null) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    
    // Save to Vercel KV
    await kv.set(DISTANCES_KEY, distances);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save distances to KV:', error);
    return NextResponse.json({ error: 'Failed to save distances' }, { status: 500 });
  }
} 