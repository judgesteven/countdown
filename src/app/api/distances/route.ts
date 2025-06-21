import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const BLOB_FILENAME = 'workout-distances.json';

// Debug: Check if environment variable is loaded
console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
console.log('BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN?.length);

// GET - Read distances
export async function GET() {
  try {
    // Try to get data from Vercel Blob
    const { blobs } = await list();
    const existingBlob = blobs.find(blob => blob.pathname === BLOB_FILENAME);
    
    if (existingBlob) {
      const response = await fetch(existingBlob.url);
      const text = await response.text();
      const distances = JSON.parse(text);
      return NextResponse.json(distances);
    } else {
      // Return empty object if no data exists
      return NextResponse.json({});
    }
  } catch (error) {
    console.error('Failed to read distances from Blob:', error);
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
      console.error('POST /api/distances: Invalid data format', { received: distances });
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    
    // Convert to JSON string
    const jsonData = JSON.stringify(distances, null, 2);
    
    // Save to Vercel Blob
    try {
      await put(BLOB_FILENAME, jsonData, {
        access: 'public',
        addRandomSuffix: false
      });
    } catch (putError) {
      console.error('POST /api/distances: Error in put()', { putError, jsonData });
      return NextResponse.json({ error: 'Failed to save distances (put error)' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/distances: General error', { error });
    return NextResponse.json({ error: 'Failed to save distances (general error)' }, { status: 500 });
  }
} 