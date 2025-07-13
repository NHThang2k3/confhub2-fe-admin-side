# Delayed Crawl Feature

## Overview
The Delayed Crawl feature allows administrators to schedule conference crawl jobs to run at a specific time in the future. This is useful for:
- Scheduling crawls during off-peak hours
- Batch processing conferences at predetermined times
- Avoiding server overload during peak usage

## Components

### useDelayedCrawl Hook
Location: `src/hooks/cron/useDelayedCrawl.ts`

**Features:**
- State management for delay configuration (hours, minutes, seconds)
- Batch size and take count configuration
- Real-time calculation of scheduled execution time
- Form validation and error handling
- API integration with the backend endpoint

**State:**
- `delayHours`: Number of hours to delay (0-23)
- `delayMinutes`: Number of minutes to delay (0-59) 
- `delaySeconds`: Number of seconds to delay (0-59)
- `batchSize`: Number of conferences to process per batch (1-50)
- `take`: Total number of conferences to fetch (1-100)
- `takeAll`: Boolean flag to process all available conferences
- `isLoading`: Loading state during API calls

**Methods:**
- `handleScheduleDelayedCrawl()`: Schedules the delayed crawl job
- `calculateTotalDelay()`: Calculates total delay in seconds
- `getScheduledTime()`: Returns the calculated execution time

### DelayedCrawlCard Component
Location: `src/components/cron/DelayedCrawlCard.tsx`

**Features:**
- User-friendly form for setting delay time (hours, minutes, seconds)
- Batch configuration section
- Real-time preview of scheduled execution time
- Visual feedback and validation warnings
- Loading states and success/error handling

**UI Sections:**
1. **Schedule Delay**: Three input fields for hours, minutes, and seconds
2. **Batch Configuration**: Settings for batch size and take count, with "Take All" checkbox option
3. **Preview**: Shows calculated execution time and job details (adapts to show "all conferences" when take all is selected)
4. **Validation**: Warnings for invalid configurations
5. **Action Button**: Schedule button with loading state

## API Integration

**Endpoint:** `POST /api/v1/conference-crawl-job/schedule-delayed`

**Request Body:**
```typescript
{
  delaySeconds: number;
  delayMinutes: number; 
  delayHours: number;
  batchSize: number;
  take: number; // Set to 999999 when takeAll is true
}
```

**Validation:**
- Total delay must be greater than 0
- Batch size between 1-50
- Take count between 1-100 (or unlimited when "Take All" is selected)

## Usage

The DelayedCrawlCard is integrated into the cron management page alongside the regular CronUpdateCard, providing a comprehensive interface for both scheduled and delayed crawl jobs.

## Error Handling

- Client-side validation prevents invalid configurations
- Server errors are displayed via toast notifications
- Loading states prevent multiple submissions
- Form resets on successful scheduling
