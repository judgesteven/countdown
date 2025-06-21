import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'distances.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// GET - Read distances
export async function GET() {
  try {
    await ensureDataDirectory();
    
    try {
      const data = await fs.readFile(dataFilePath, 'utf-8');
      const distances = JSON.parse(data);
      return NextResponse.json(distances);
    } catch (error) {
      // If file doesn't exist, return empty object
      return NextResponse.json({});
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read distances' }, { status: 500 });
  }
}

// POST - Save distances
export async function POST(request: NextRequest) {
  try {
    await ensureDataDirectory();
    
    const distances = await request.json();
    
    // Validate the data structure
    if (typeof distances !== 'object' || distances === null) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    
    await fs.writeFile(dataFilePath, JSON.stringify(distances, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save distances' }, { status: 500 });
  }
} 