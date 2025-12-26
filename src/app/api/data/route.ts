import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

// Force dynamic to avoid caching of blob data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

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

    const url = `${blobs.blobs[0].url}?ts=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch blob: ${res.status} ${res.statusText} ${text}`);
    }
    const data = await res.json();
    
    // Filter out December 2025 data - only keep 2026 data (starting from Jan 1, 2026)
    const startDate = new Date('2026-01-01T00:00:00Z');
    const filter2026Data = <T extends { date: string }>(entries: T[]): T[] => {
      return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate;
      });
    };
    
    const allActivities = Array.isArray(data.activityEntries) ? data.activityEntries : [];
    const allWeights = Array.isArray(data.weightEntries) ? data.weightEntries : [];
    const filteredActivities = filter2026Data(allActivities);
    const filteredWeights = filter2026Data(allWeights);
    
    console.log('GET /api/data served', {
      activityCount: filteredActivities.length,
      weightCount: filteredWeights.length
    });
    return NextResponse.json({
      activityEntries: filteredActivities,
      weightEntries: filteredWeights
    }, { headers: { 'Cache-Control': 'no-store' } });
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
    const incoming: Payload = {
      activityEntries: Array.isArray(body.activityEntries) ? body.activityEntries : [],
      weightEntries: Array.isArray(body.weightEntries) ? body.weightEntries : []
    };

    // Merge with existing data to avoid accidental overwrites.
    let existing: Payload = { activityEntries: [], weightEntries: [] };
    try {
      const blobs = await list({ prefix: DATA_BLOB_KEY, limit: 1 });
      if (blobs.blobs.length > 0) {
        const url = `${blobs.blobs[0].url}?ts=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          existing = {
            activityEntries: Array.isArray(data.activityEntries) ? data.activityEntries : [],
            weightEntries: Array.isArray(data.weightEntries) ? data.weightEntries : []
          };
        }
      }
    } catch (err) {
      console.warn('POST /api/data: unable to load existing blob, proceeding with incoming only', err);
    }

    const dateKey = (d: string) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
    };

    const mergeByDate = <T extends { date: string }>(existingArr: T[], incomingArr: T[]) => {
      const map = new Map<string, T>();
      existingArr.forEach((e) => map.set(dateKey(e.date), e));
      incomingArr.forEach((e) => map.set(dateKey(e.date), e));
      return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const merged: Payload = {
      activityEntries: mergeByDate(existing.activityEntries, incoming.activityEntries),
      weightEntries: mergeByDate(existing.weightEntries, incoming.weightEntries)
    };

    // Filter out December 2025 data - only keep 2026 data (starting from Jan 1, 2026)
    const startDate = new Date('2026-01-01T00:00:00Z');
    const filter2026Data = <T extends { date: string }>(entries: T[]): T[] => {
      return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate;
      });
    };

    const filtered: Payload = {
      activityEntries: filter2026Data(merged.activityEntries),
      weightEntries: filter2026Data(merged.weightEntries)
    };

    await put(DATA_BLOB_KEY, JSON.stringify(filtered), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true
    });

    console.log('POST /api/data saved', {
      incomingActivity: incoming.activityEntries.length,
      incomingWeight: incoming.weightEntries.length,
      filteredActivity: filtered.activityEntries.length,
      filteredWeight: filtered.weightEntries.length
    });

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error in POST /api/data:', error);
    const message = error instanceof Error ? error.message : 'Failed to save data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

