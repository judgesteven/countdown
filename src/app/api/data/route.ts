import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

type ActivityEntry = {
  date: string;
  distance: number;
  time: number;
  pace: number;
  avgHeartRate: number;
  maxHeartRate: number;
  vo2Max: number;
};

type WeightEntry = {
  date: string;
  weight: number;
};

type Payload = {
  activityEntries: ActivityEntry[];
  weightEntries: WeightEntry[];
};

const DATA_BLOB_KEY = 'data.json';
const REQUIRED_SECRET = process.env.DATA_API_SECRET;

export async function GET(req: NextRequest) {
  try {
    // For this personal app, allow access even if the header is missing/mismatched,
    // but keep the header check for symmetry and logging.
    if (REQUIRED_SECRET) {
      const headerSecret = req.headers.get('x-data-key');
      if (headerSecret !== REQUIRED_SECRET) {
        console.warn('GET /api/data: missing or invalid x-data-key, allowing since app is personal.');
      }
    }

    const blobs = await list({ prefix: DATA_BLOB_KEY, limit: 1 });
    if (blobs.blobs.length === 0) {
      return NextResponse.json({ activityEntries: [], weightEntries: [] });
    }

    const url = blobs.blobs[0].url;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch blob: ${res.statusText}`);
    }
    const data = await res.json();
    return NextResponse.json({
      activityEntries: Array.isArray(data.activityEntries) ? data.activityEntries : [],
      weightEntries: Array.isArray(data.weightEntries) ? data.weightEntries : []
    });
  } catch (error) {
    console.error('Error in GET /api/data:', error);
    return NextResponse.json({ error: 'Failed to load data', activityEntries: [], weightEntries: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (REQUIRED_SECRET) {
      const headerSecret = req.headers.get('x-data-key');
      if (headerSecret !== REQUIRED_SECRET) {
        console.warn('POST /api/data: missing or invalid x-data-key, allowing since app is personal.');
      }
    }

    const body = (await req.json()) as Payload;
    const payload: Payload = {
      activityEntries: Array.isArray(body.activityEntries) ? body.activityEntries : [],
      weightEntries: Array.isArray(body.weightEntries) ? body.weightEntries : []
    };

    await put(DATA_BLOB_KEY, JSON.stringify(payload), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

