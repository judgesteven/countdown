# Countdown App

A simple web application that displays a countdown timer to July 7th at 2:00 AM. Built with Next.js and deployed on Vercel.

## Features

- Real-time countdown display
- Responsive design
- Days, hours, minutes, and seconds remaining
- Modern UI with Tailwind CSS
- Activity tracking with calendar view
- Training plan targets (planned runs) vs recorded runs

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Vercel (Deployment)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is automatically deployed to Vercel. Any push to the main branch will trigger a new deployment.

## Training Plan Targets

The activity page supports both **planned targets** and **recorded runs**:

- **Recorded runs**: Activities you've actually completed (blue background, "Recorded" label)
- **Targets**: Planned training runs from your training plan (dashed border, "Target" label)

### How Targets Are Stored

Targets are stored in the same data structure as recorded activities, but with:
- `kind: 'target'` (vs `kind: 'recorded'` for actual runs)
- `source: 'training-plan-2026-q1'` (for idempotency)

The API automatically handles merging targets and recorded activities:
- Recorded activities take precedence over targets on the same date
- Targets with the same `date + source` are deduplicated (idempotent)

### Seeding Training Plan Targets

To populate the calendar with training plan targets for 2026 Q1 (Jan 5 - Mar 31):

**Note**: The seed script requires the API to have access to Vercel Blob storage. For local development, you'll need to set the `BLOB_READ_WRITE_TOKEN` environment variable, or run the script against your deployed Vercel instance.

1. Make sure the development server is running (if testing locally):
   ```bash
   npm run dev
   ```

2. In a separate terminal, run the seed script:
   ```bash
   npm run seed:targets
   ```
   
   Or using npx directly:
   ```bash
   npx tsx scripts/seedTargets2026Q1.ts
   ```

   For deployed environments, you can set the API URL:
   ```bash
   API_URL=https://your-vercel-app.vercel.app/api/data npm run seed:targets
   ```

3. The script will:
   - Generate all target entries for the training plan (50 targets total)
   - Merge them with existing data (won't overwrite recorded activities)
   - Verify the seed was successful

### Avoiding Duplications

The seed script is **idempotent** - you can run it multiple times without creating duplicates. This is achieved by:

1. **Unique identification**: Each target is identified by `date + source` (e.g., `2026-01-06 + training-plan-2026-q1`)
2. **API-level deduplication**: The API route merges entries by this unique key
3. **Recorded takes precedence**: If you record an actual run on a date with a target, the recorded run replaces the target

### Toggle Targets Display

In the Activity page, you can toggle the display of targets using the "Show Targets" checkbox (default: ON). This allows you to:
- Hide targets to focus only on recorded activities
- Show targets to see your planned training schedule
