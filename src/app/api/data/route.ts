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

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function validateSecret(req: NextRequest) {
  if (!REQUIRED_SECRET) return true;
  const headerSecret = req.headers.get('x-data-key');
  return headerSecret === REQUIRED_SECRET;
}

export async function GET(req: NextRequest) {
  try {
    if (!validateSecret(req)) {
      return unauthorizedResponse();
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
    if (!validateSecret(req)) {
      return unauthorizedResponse();
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

