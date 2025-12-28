/**
 * Seed script for 2026 Q1 Training Plan Targets
 * 
 * This script populates the calendar with planned run targets for the date range
 * 2026-01-05 through 2026-03-31 based on the training plan.
 * 
 * The script is idempotent: running it multiple times will not create duplicates.
 * Targets are identified by date + source ('training-plan-2026-q1').
 * 
 * Usage:
 *   npx ts-node scripts/seedTargets2026Q1.ts
 * 
 * Or if using tsx:
 *   npx tsx scripts/seedTargets2026Q1.ts
 */

type ActivityEntry = {
  date: string;
  distance: number;
  time: number;
  pace: number;
  avgHeartRate: number;
  maxHeartRate: number;
  vo2Max: number;
  kind: 'target';
  source: string;
};

const PLAN_SOURCE = 'training-plan-2026-q1';

// Helper to create a date string in ISO format
const createDate = (year: number, month: number, day: number): string => {
  const date = new Date(year, month - 1, day);
  return date.toISOString();
};

// Helper to get day of week (0 = Sunday, 1 = Monday, etc.)
const getDayOfWeek = (year: number, month: number, day: number): number => {
  const date = new Date(year, month - 1, day);
  return date.getDay();
};

// Helper to find the date of a specific weekday in a week
// weekStartDate is the Monday of the week
// targetDay: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const getDateInWeek = (weekStartDate: Date, targetDay: number): Date => {
  const date = new Date(weekStartDate);
  // weekStartDate is Monday (day 1), so we add (targetDay - 1) days
  // But we need to handle: if targetDay is 0 (Sunday), it's 6 days after Monday
  const daysToAdd = targetDay === 0 ? 6 : targetDay - 1;
  date.setDate(date.getDate() + daysToAdd);
  // Set to midnight UTC to avoid timezone issues
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// Generate all training plan targets
const generateTargets = (): ActivityEntry[] => {
  const targets: ActivityEntry[] = [];
  
  // Month 1 (Jan): 3 runs/week on Tue/Thu/Sat
  // Week 1 (starting Mon 2026-01-05): Tue 6k, Thu 6k, Sat 10k
  const week1Start = new Date(Date.UTC(2026, 0, 5, 0, 0, 0, 0)); // Jan 5, 2026 (Monday) UTC
  targets.push({
    date: getDateInWeek(week1Start, 2).toISOString(), // Tuesday
    distance: 6,
    time: 0, // Not specified, will be calculated or left as 0
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week1Start, 4).toISOString(), // Thursday
    distance: 6,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week1Start, 6).toISOString(), // Saturday
    distance: 10,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 2 (starting Mon 2026-01-12): Tue 6k, Thu 7k, Sat 11k
  const week2Start = new Date(Date.UTC(2026, 0, 12, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week2Start, 2).toISOString(), // Tuesday
    distance: 6,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week2Start, 4).toISOString(), // Thursday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week2Start, 6).toISOString(), // Saturday
    distance: 11,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 3 (starting Mon 2026-01-19): Tue 7k, Thu 7k, Sat 12k
  const week3Start = new Date(Date.UTC(2026, 0, 19, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week3Start, 2).toISOString(), // Tuesday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week3Start, 4).toISOString(), // Thursday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week3Start, 6).toISOString(), // Saturday
    distance: 12,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 4 (starting Mon 2026-01-26): Tue 7k, Thu 8k, Sat 14k
  const week4Start = new Date(Date.UTC(2026, 0, 26, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week4Start, 2).toISOString(), // Tuesday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week4Start, 4).toISOString(), // Thursday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week4Start, 6).toISOString(), // Saturday
    distance: 14,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Month 2 (Feb): 4 runs/week on Mon/Wed/Fri/Sat
  // Week 5 (starting Mon 2026-02-02): Mon 7k, Wed 7k, Fri 6k, Sat 14k
  const week5Start = new Date(Date.UTC(2026, 1, 2, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week5Start, 1).toISOString(), // Monday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week5Start, 3).toISOString(), // Wednesday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week5Start, 5).toISOString(), // Friday
    distance: 6,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week5Start, 6).toISOString(), // Saturday
    distance: 14,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 6 (starting Mon 2026-02-09): Mon 7k, Wed 8k, Fri 7k, Sat 15k
  const week6Start = new Date(Date.UTC(2026, 1, 9, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week6Start, 1).toISOString(), // Monday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week6Start, 3).toISOString(), // Wednesday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week6Start, 5).toISOString(), // Friday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week6Start, 6).toISOString(), // Saturday
    distance: 15,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 7 (starting Mon 2026-02-16): Mon 8k, Wed 8k, Fri 7k, Sat 16k
  const week7Start = new Date(Date.UTC(2026, 1, 16, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week7Start, 1).toISOString(), // Monday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week7Start, 3).toISOString(), // Wednesday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week7Start, 5).toISOString(), // Friday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week7Start, 6).toISOString(), // Saturday
    distance: 16,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 8 (starting Mon 2026-02-23): Mon 8k, Wed 8k, Fri 8k, Sat 18k
  const week8Start = new Date(Date.UTC(2026, 1, 23, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week8Start, 1).toISOString(), // Monday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week8Start, 3).toISOString(), // Wednesday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week8Start, 5).toISOString(), // Friday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week8Start, 6).toISOString(), // Saturday
    distance: 18,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Month 3 (Mar): 5 runs/week on Mon/Tue/Thu/Fri/Sat
  // Week 9 (starting Mon 2026-03-02): Mon 7k, Tue 8k, Thu 7k, Fri 6k, Sat 18k
  const week9Start = new Date(Date.UTC(2026, 2, 2, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week9Start, 1).toISOString(), // Monday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week9Start, 2).toISOString(), // Tuesday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week9Start, 4).toISOString(), // Thursday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week9Start, 5).toISOString(), // Friday
    distance: 6,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week9Start, 6).toISOString(), // Saturday
    distance: 18,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 10 (starting Mon 2026-03-09): Mon 8k, Tue 8k, Thu 8k, Fri 6k, Sat 19k
  const week10Start = new Date(Date.UTC(2026, 2, 9, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week10Start, 1).toISOString(), // Monday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week10Start, 2).toISOString(), // Tuesday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week10Start, 4).toISOString(), // Thursday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week10Start, 5).toISOString(), // Friday
    distance: 6,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week10Start, 6).toISOString(), // Saturday
    distance: 19,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 11 (starting Mon 2026-03-16): Mon 8k, Tue 9k, Thu 8k, Fri 7k, Sat 20k
  const week11Start = new Date(Date.UTC(2026, 2, 16, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week11Start, 1).toISOString(), // Monday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week11Start, 2).toISOString(), // Tuesday
    distance: 9,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week11Start, 4).toISOString(), // Thursday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week11Start, 5).toISOString(), // Friday
    distance: 7,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week11Start, 6).toISOString(), // Saturday
    distance: 20,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 12 (starting Mon 2026-03-23): Mon 8k, Tue 9k, Thu 8k, Fri 8k, Sat 21k
  const week12Start = new Date(Date.UTC(2026, 2, 23, 0, 0, 0, 0));
  targets.push({
    date: getDateInWeek(week12Start, 1).toISOString(), // Monday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week12Start, 2).toISOString(), // Tuesday
    distance: 9,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week12Start, 4).toISOString(), // Thursday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week12Start, 5).toISOString(), // Friday
    distance: 8,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });
  targets.push({
    date: getDateInWeek(week12Start, 6).toISOString(), // Saturday
    distance: 21,
    time: 0,
    pace: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    vo2Max: 0,
    kind: 'target',
    source: PLAN_SOURCE
  });

  // Week 13 (starting Mon 2026-03-30): Mon 8k, Tue 9k (only include runs that fall on or before 2026-03-31)
  const week13Start = new Date(Date.UTC(2026, 2, 30, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(2026, 2, 31, 23, 59, 59, 999)); // March 31, 2026 end of day UTC
  
  const mon13 = getDateInWeek(week13Start, 1); // Monday
  if (mon13 <= endDate) {
    targets.push({
      date: mon13.toISOString(),
      distance: 8,
      time: 0,
      pace: 0,
      avgHeartRate: 0,
      maxHeartRate: 0,
      vo2Max: 0,
      kind: 'target',
      source: PLAN_SOURCE
    });
  }
  
  const tue13 = getDateInWeek(week13Start, 2); // Tuesday
  if (tue13 <= endDate) {
    targets.push({
      date: tue13.toISOString(),
      distance: 9,
      time: 0,
      pace: 0,
      avgHeartRate: 0,
      maxHeartRate: 0,
      vo2Max: 0,
      kind: 'target',
      source: PLAN_SOURCE
    });
  }

  return targets;
};

// Main function to seed targets
const seedTargets = async () => {
  const targets = generateTargets();
  
  console.log(`Generated ${targets.length} target entries`);
  console.log('Date range:', targets[0]?.date, 'to', targets[targets.length - 1]?.date);
  
  // Get API endpoint from environment or use default
  const apiUrl = process.env.API_URL || 'http://localhost:3000/api/data';
  const apiKey = process.env.DATA_API_SECRET || process.env.NEXT_PUBLIC_DATA_API_KEY || '';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'x-data-key': apiKey } : {})
  };
  
  try {
    // First, fetch existing data to merge
    console.log('Fetching existing data...');
    let existingData: { activityEntries?: ActivityEntry[]; weightEntries?: any[] } = { activityEntries: [], weightEntries: [] };
    
    try {
      const getRes = await fetch(apiUrl, { 
        headers: apiKey ? { 'x-data-key': apiKey } : {},
        cache: 'no-store' 
      });
      
      if (getRes.ok) {
        existingData = await getRes.json();
      } else {
        console.warn(`Warning: Failed to fetch existing data (${getRes.status}), proceeding with empty data`);
      }
    } catch (fetchError) {
      console.warn('Warning: Could not fetch existing data, proceeding with empty data:', fetchError);
    }
    
    const existingActivities = existingData.activityEntries || [];
    
    console.log(`Found ${existingActivities.length} existing activity entries`);
    
    // Merge targets with existing data
    const payload = {
      activityEntries: targets,
      weightEntries: existingData.weightEntries || []
    };
    
    console.log('Posting targets to API...');
    const postRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (!postRes.ok) {
      const errorText = await postRes.text();
      throw new Error(`Failed to seed targets: ${postRes.status} ${postRes.statusText} ${errorText}`);
    }
    
    const result = await postRes.json();
    console.log('✅ Successfully seeded targets!');
    console.log('Result:', result);
    
    // Verify by fetching again
    console.log('Verifying seed...');
    const verifyRes = await fetch(apiUrl, { 
      headers: apiKey ? { 'x-data-key': apiKey } : {},
      cache: 'no-store' 
    });
    const verifyData = await verifyRes.json();
    const targetCount = (verifyData.activityEntries || []).filter((e: ActivityEntry) => 
      e.kind === 'target' && e.source === PLAN_SOURCE
    ).length;
    
    console.log(`✅ Verification: Found ${targetCount} target entries in database`);
    
  } catch (error) {
    console.error('❌ Error seeding targets:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedTargets();
}

export { seedTargets, generateTargets };

